
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress, wallet_mode } from "../../utils/types";
import ERC20Mock from "../../abis/ERC20Mock.json";
import { Contract, JsonRpcProvider } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress } from "../../utils/address";
import { FromAddressError } from "../../utils";


export async function updateUserEthBalance(appState1: ApplicationState, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };
    if (appState.walletState.ethBalances == "" || force) {
        appState.walletState.ethBalances = String(await appState.web3?.getBalance(appState.walletState.address))
    }
    return appState;
}
export async function updateSmartWalletEthBalance(appState1: ApplicationState, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };
    if (appState.smartWalletState.ethBalances == "" || force) {
        appState.smartWalletState.ethBalances = String(await appState.web3!.getBalance(appState.smartWalletState.address))
    }
    return appState;
}
export async function updateUserTokenBalance(appState1: ApplicationState, _tokenAddress: EthAddress, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };

    if (!appState.walletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
        const address = convertHexStringToAddress(_tokenAddress);
        const TokenContract = new Contract(address, ERC20Mock, appState.web3)
        const balance = String(await TokenContract.balanceOf(appState.walletState.address));
        appState.walletState.tokenBalances.set(address.toLowerCase(), balance);
    }
    return appState;
}

export async function updateSmartWalletTokenBalance(appState1: ApplicationState, _tokenAddress: EthAddress, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };

    if (!appState.smartWalletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
        const address = convertHexStringToAddress(_tokenAddress);
        const TokenContract = new Contract(address, ERC20Mock, appState.web3)
        const balance = String(await TokenContract.balanceOf(appState.smartWalletState.address));
        appState.smartWalletState.tokenBalances.set(address.toLowerCase(), balance);
    }
    return appState;
}

export async function updateTokenBalance(appState1: ApplicationState, _from: EthAddress, _tokenAddress?: EthAddress, force?: boolean) {
    const appState = { ...appState1 };

    let mode: wallet_mode;
    if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
        mode = "walletState"
    } else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
        mode = "smartWalletState"
    } else {
        throw new FromAddressError()
    }
    if (_tokenAddress) {

        if (!appState[mode].tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
            const address = convertHexStringToAddress(_tokenAddress);
            const TokenContract = new Contract(address, ERC20Mock, appState.web3)
            const balance = String(await TokenContract.balanceOf(appState[mode].address));
            appState[mode].tokenBalances.set(address.toLowerCase(), balance);
        }
    } else {
        if (appState[mode].ethBalances == "" || force) {
            appState[mode].ethBalances = String(await appState.web3?.getBalance(appState[mode].address))
        }
    }
    return appState;
}


