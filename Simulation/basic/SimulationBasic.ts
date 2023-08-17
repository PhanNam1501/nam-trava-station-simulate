import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "./UpdateStateAccount";
import { getAddr } from "../../utils/address";
import _ from "lodash";

export async function simulateWrap(appState1: ApplicationState, amount: number | string): Promise<ApplicationState> {
    const appState = {...appState1};
    if (!appState.smartWalletState.tokenBalances.has(getAddr("WBNB_ADDRESS"))) {
        await updateSmartWalletTokenBalance(appState, getAddr("WBNB_ADDRESS"))
    }
    if (BigInt(appState.walletState.ethBalances) < BigInt(amount)) {
        throw new Error("Not enough BNB")
    }
    let newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
    let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(getAddr("WBNB_ADDRESS"))!) + BigInt(amount)
    appState.walletState.ethBalances = String(newEthBalance);
    appState.smartWalletState.tokenBalances.set(getAddr("WBNB_ADDRESS"), String(BigInt(newWBNBBalance)))
    return appState;
}
export async function simulateUnwrap(appState1: ApplicationState, amount: number | string): Promise<ApplicationState> {
    const appState = {...appState1};
    if (!appState.walletState.tokenBalances.has(getAddr("WBNB_ADDRESS"))) {
        await updateUserTokenBalance(appState, getAddr("WBNB_ADDRESS"))
    }
    if (BigInt(appState.walletState.tokenBalances.get(getAddr("WBNB_ADDRESS"))!) < BigInt(amount)) {
        throw new Error("Not enough WBNB");
    }
    let newWBNBBalance = BigInt(appState.walletState.tokenBalances.get(getAddr("WBNB_ADDRESS"))!) - BigInt(amount);
    let newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount)
    appState.walletState.tokenBalances.set(getAddr("WBNB_ADDRESS"), String(newWBNBBalance));
    appState.walletState.ethBalances = String(newBNBBalance);
    return appState;
}
export async function simulateSendToken(appState1: ApplicationState, tokenAddress: EthAddress, to: EthAddress, amount: number | string): Promise<ApplicationState> {
    const appState = {...appState1};
    if (!appState.walletState.tokenBalances.has(getAddr("WBNB_ADDRESS"))) {
        await updateUserTokenBalance(appState, getAddr("WBNB_ADDRESS"))
    }
    if (!appState.smartWalletState.tokenBalances.has(getAddr("WBNB_ADDRESS"))) {
        await updateSmartWalletTokenBalance(appState, getAddr("WBNB_ADDRESS"))
    }
    if (BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)!) < BigInt(amount)) {
        throw new Error("Not enough Balance");
    }
    let newTokenBalance = BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)!) - BigInt(amount);
    appState.smartWalletState.tokenBalances.set(tokenAddress, String(newTokenBalance));
    if (to == appState.walletState.address) {
        let newUserTokenBalance = BigInt(appState.walletState.tokenBalances.get(tokenAddress)!) + BigInt(amount);
        appState.walletState.tokenBalances.set(tokenAddress, String(newUserTokenBalance));
    }
    return appState;
}

