import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "./UpdateStateAccount";
import { getAddr } from "../../utils/address";
import _ from "lodash";
import { MAX_UINT256 } from "../../utils/config";

export async function simulateWrap(appState1: ApplicationState, _amount: number | string): Promise<ApplicationState> {
    let amount = _amount;
    const appState = {...appState1};
    const bnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
    if (!appState.smartWalletState.tokenBalances.has(bnb_address)) {
        await updateSmartWalletTokenBalance(appState, bnb_address)
    }
    // if (BigInt(appState.walletState.ethBalances) < BigInt(amount)) {
    //     throw new Error("Not enough BNB")
    // }
    console.log("amount.toString() == MAX_UINT256", amount.toString(), MAX_UINT256)
    if(amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
        console.log("????")
        amount = appState.walletState.ethBalances;
    }
    console.log("amount", amount)
    let newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
    let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(bnb_address)!) + BigInt(amount)
    appState.walletState.ethBalances = String(newEthBalance);
    appState.smartWalletState.tokenBalances.set(bnb_address, String(BigInt(newWBNBBalance)))
    return appState;
}
export async function simulateUnwrap(appState1: ApplicationState, _amount: number | string): Promise<ApplicationState> {
    let amount = _amount;
    const appState = {...appState1};
    const bnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
    if (!appState.walletState.tokenBalances.has(bnb_address)) {
        await updateUserTokenBalance(appState, bnb_address)
    }
    // if (BigInt(appState.walletState.tokenBalances.get(bnb_address)!) < BigInt(amount)) {
    //     throw new Error("Not enough WBNB");
    // }
    if(amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
        amount = appState.smartWalletState.tokenBalances.get(bnb_address)!;
    }

    let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(bnb_address)!) - BigInt(amount);
    let newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount)
    appState.smartWalletState.tokenBalances.set(bnb_address, String(newWBNBBalance));
    appState.walletState.ethBalances = String(newBNBBalance);
    return appState;
}
export async function simulateSendToken(appState1: ApplicationState, _tokenAddress: EthAddress, to: EthAddress, _amount: number | string): Promise<ApplicationState> {
    let amount = _amount;
    const appState = {...appState1};
    const bnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
    const tokenAddress = _tokenAddress.toLowerCase();

    if (!appState.walletState.tokenBalances.has(bnb_address)) {
        await updateUserTokenBalance(appState, bnb_address)
    }
    if (!appState.smartWalletState.tokenBalances.has(bnb_address)) {
        await updateSmartWalletTokenBalance(appState, bnb_address)
    }
    // if (BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)!) < BigInt(amount)) {
    //     throw new Error("Not enough Balance");
    // }
    if(amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
        amount = appState.smartWalletState.tokenBalances.get(tokenAddress)!;
    }

    let newTokenBalance = BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)!) - BigInt(amount);
    appState.smartWalletState.tokenBalances.set(tokenAddress, String(newTokenBalance));
    if (to == appState.walletState.address) {
        let newUserTokenBalance = BigInt(appState.walletState.tokenBalances.get(tokenAddress)!) + BigInt(amount);
        appState.walletState.tokenBalances.set(tokenAddress, String(newUserTokenBalance));
    }
    return appState;
}

