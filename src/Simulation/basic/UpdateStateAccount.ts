
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import ERC20Mock from "../../abis/ERC20Mock.json";
import { Contract, JsonRpcProvider } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress } from "../../utils/address";


export async function updateUserEthBalance(appState1: ApplicationState): Promise<ApplicationState> {
    const appState = { ...appState1 };
    if (appState.walletState.ethBalances == "") {
        appState.walletState.ethBalances = String(await appState.web3?.getBalance(appState.walletState.address))
    }
    return appState;
}
export async function updateSmartWalletEthBalance(appState1: ApplicationState): Promise<ApplicationState> {
    const appState = { ...appState1 };
    if (appState.smartWalletState.ethBalances == "") {
        appState.smartWalletState.ethBalances = String(await appState.web3!.getBalance(appState.smartWalletState.address))
    }
    return appState;
}
export async function updateUserTokenBalance(appState1: ApplicationState, _tokenAddress: EthAddress): Promise<ApplicationState> {
    const appState = { ...appState1 };

    if (!appState.walletState.tokenBalances.has(_tokenAddress.toLowerCase())) {
        const address = convertHexStringToAddress(_tokenAddress);
        const TokenContract = new Contract(address, ERC20Mock, appState.web3)
        const balance = String(await TokenContract.balanceOf(appState.walletState.address));
        appState.walletState.tokenBalances.set(address.toLowerCase(), balance);
    }
    return appState;
}

export async function updateSmartWalletTokenBalance(appState1: ApplicationState, _tokenAddress: EthAddress): Promise<ApplicationState> {
    const appState = { ...appState1 };

    if (!appState.smartWalletState.tokenBalances.has(_tokenAddress.toLowerCase())) {
        const address = convertHexStringToAddress(_tokenAddress);
        const TokenContract = new Contract(address, ERC20Mock, appState.web3)
        const balance = String(await TokenContract.balanceOf(appState.smartWalletState.address));
        appState.smartWalletState.tokenBalances.set(address.toLowerCase(), balance);
    }
    return appState;
}
