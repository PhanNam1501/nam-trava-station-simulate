
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import ERC20Mock from "../../abis/ERC20Mock.json";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { getMode, isNonUpdateTokenBalance, isUserAddress, multiCall } from "../../utils/helper";
import { bnb } from "../../utils";
import BEP20Abi from "../../abis/BEP20.json";


export async function updateUserEthBalance(appState1: ApplicationState, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };
    if (appState.walletState.ethBalances == "" || force) {
        const balance = String(await appState.web3?.getBalance(appState.walletState.address));
        appState.walletState.ethBalances = balance
        appState.walletState.tokenBalances.set(getAddr("BNB_ADDRESS", appState.chainId).toLowerCase(), balance);
    }
    return appState;
}
export async function updateSmartWalletEthBalance(appState1: ApplicationState, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };
    if (appState.smartWalletState.ethBalances == "" || force) {
        const balance = String(await appState.web3!.getBalance(appState.smartWalletState.address))
        appState.smartWalletState.ethBalances = balance;
        appState.smartWalletState.tokenBalances.set(getAddr("BNB_ADDRESS", appState.chainId).toLowerCase(), balance);
    }
    return appState;
}
export async function updateUserTokenBalance(appState1: ApplicationState, _tokenAddress: EthAddress, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };

    if (!appState.walletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
        if (_tokenAddress.toLowerCase() == getAddr("BNB_ADDRESS", appState.chainId).toLowerCase()) {
            const balance = String(await appState.web3?.getBalance(appState.walletState.address));
            appState.walletState.tokenBalances.set(_tokenAddress.toLowerCase(), balance);
            appState.walletState.ethBalances = balance
        } else {

            const address = convertHexStringToAddress(_tokenAddress);
            const TokenContract = new Contract(address, ERC20Mock, appState.web3)
            const balance = String(await TokenContract.balanceOf(appState.walletState.address));
            appState.walletState.tokenBalances.set(address.toLowerCase(), balance);
        }
    }
    return appState;
}

export async function updateSmartWalletTokenBalance(appState1: ApplicationState, _tokenAddress: EthAddress, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };

    if (!appState.smartWalletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
        if (_tokenAddress.toLowerCase() == getAddr("BNB_ADDRESS", appState.chainId).toLowerCase()) {
            const balance = String(await appState.web3?.getBalance(appState.smartWalletState.address))
            appState.walletState.tokenBalances.set(_tokenAddress.toLowerCase(), balance)
            appState.walletState.ethBalances = balance
        } else {
            const address = convertHexStringToAddress(_tokenAddress);
            const TokenContract = new Contract(address, ERC20Mock, appState.web3)
            const balance = String(await TokenContract.balanceOf(appState.smartWalletState.address));
            appState.smartWalletState.tokenBalances.set(address.toLowerCase(), balance);
        }
    }
    return appState;
}

export async function updateTokenBalance(appState1: ApplicationState, _from: EthAddress, _tokenAddress?: EthAddress, force?: boolean) {
    const appState = { ...appState1 };

    let mode = getMode(appState, _from);
    if (_tokenAddress) {

        if (!appState[mode].tokenBalances.has(_tokenAddress.toLowerCase())) {
            if (_tokenAddress.toLowerCase() == getAddr("BNB_ADDRESS", appState.chainId).toLowerCase()) {
                const balance = String(await appState.web3?.getBalance(appState[mode].address))
                appState[mode].tokenBalances.set(_tokenAddress.toLowerCase(), balance);
                appState[mode].ethBalances = balance
            } else {
                const address = convertHexStringToAddress(_tokenAddress);
                const TokenContract = new Contract(address, ERC20Mock, appState.web3)
                const balance = String(await TokenContract.balanceOf(appState[mode].address));
                appState[mode].tokenBalances.set(address.toLowerCase(), balance);
            }
        }
    } else {
        if (appState[mode].ethBalances == "" || force) {
            appState[mode].ethBalances = String(await appState.web3?.getBalance(appState[mode].address))
        }
    }
    return appState;
}

export async function updateAllTokensBalance(appState1: ApplicationState, userAddress: EthAddress, _tokenAddresses: Array<EthAddress>, force = false) {
    let appState = {...appState1}
    try {
        if (isUserAddress(appState, userAddress)) {
            const mode = getMode(appState, userAddress);
            const tokenAddresses = _tokenAddresses.map(e => e.toLowerCase());
            const bnbIndex = tokenAddresses.indexOf(bnb.toLowerCase());
            let nonUpdateToken = tokenAddresses.filter(e => e.toLowerCase() != bnb.toLowerCase());
            // console.log(bnbIndex, nonUpdateToken)

            // if (!force) {
            //     nonUpdateToken = tokenAddresses.filter(e => !appState[mode].tokenBalances.has(e) || appState[mode].tokenBalances.get(e)! == "nan");
            // }

            if (nonUpdateToken.length > 0) {
                let [balances] = await Promise.all(
                    [
                        multiCall(
                            BEP20Abi,
                            nonUpdateToken.map((_tokenAddress: any, _: number) => ({
                                address: _tokenAddress,
                                name: "balanceOf",
                                params: [appState[mode].address]
                            })),
                            appState.web3,
                            appState.chainId
                        )
                    ]
                )

                for (let i = 0; i < nonUpdateToken.length; i++) {
                    if (isNonUpdateTokenBalance(appState, userAddress, nonUpdateToken[i]) || force) {
                        appState[mode].tokenBalances.set(nonUpdateToken[i], String(balances[i]))
                    }
                }
            }

            if (bnbIndex != -1) {
                if (isNonUpdateTokenBalance(appState, userAddress, bnb) || force) {
                    appState = await updateTokenBalance(appState, userAddress, bnb);
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
    return appState;
}
