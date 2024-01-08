import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "./UpdateStateAccount";
import { getAddr } from "../../utils/address";
import _ from "lodash";
import { MAX_UINT256 } from "../../utils/config";

export async function simulateWrap(appState1: ApplicationState, _amount: number | string): Promise<ApplicationState> {
    let amount = _amount;
    const appState = { ...appState1 };
    const wbnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
    if (!appState.smartWalletState.tokenBalances.has(wbnb_address)) {
        await updateSmartWalletTokenBalance(appState, wbnb_address)
    }

    console.log("amount.toString() == MAX_UINT256", amount.toString(), MAX_UINT256)
    if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
        console.log("????")
        amount = appState.walletState.ethBalances;
    }
    console.log("amount", amount)
    let newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
    let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(wbnb_address)!) + BigInt(amount)
    appState.walletState.ethBalances = String(newEthBalance);
    appState.smartWalletState.tokenBalances.set(wbnb_address, String(BigInt(newWBNBBalance)))
    appState.smartWalletState.tokenBalances.set(getAddr("BNB_ADDRESS").toLowerCase(), String(BigInt(newWBNBBalance)))

    return appState;
}
export async function simulateUnwrap(appState1: ApplicationState, _amount: number | string): Promise<ApplicationState> {
    let amount = _amount;
    const appState = { ...appState1 };
    const wbnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
    if (!appState.walletState.tokenBalances.has(wbnb_address)) {
        await updateUserTokenBalance(appState, wbnb_address)
    }

    if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
        amount = appState.smartWalletState.tokenBalances.get(wbnb_address)!;
    }

    let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(wbnb_address)!) - BigInt(amount);
    let newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount)
    appState.smartWalletState.tokenBalances.set(wbnb_address, String(newWBNBBalance));
    appState.smartWalletState.tokenBalances.set(getAddr("BNB_ADDRESS").toLowerCase(), String(newWBNBBalance));

    appState.walletState.ethBalances = String(newBNBBalance);
    return appState;
}
export async function simulateSendToken(appState1: ApplicationState, _tokenAddress: EthAddress, from: EthAddress, to: EthAddress, _amount: number | string): Promise<ApplicationState> {
    let amount = _amount;
    const appState = { ...appState1 };
    const bnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
    const tokenAddress = _tokenAddress.toLowerCase();

    if (!appState.walletState.tokenBalances.has(bnb_address)) {
        await updateUserTokenBalance(appState, bnb_address)
    }
    if (!appState.smartWalletState.tokenBalances.has(bnb_address)) {
        await updateSmartWalletTokenBalance(appState, bnb_address)
    }

    const oldWalletBalance = appState.walletState.tokenBalances.get(tokenAddress)!;
    const oldSmartWalletBalance = appState.smartWalletState.tokenBalances.get(tokenAddress)!;


    if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
        if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
            amount = oldWalletBalance
        }
        appState.walletState.tokenBalances.set(tokenAddress, String(BigInt(oldWalletBalance) - BigInt(amount)));
        if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            appState.smartWalletState.tokenBalances.set(tokenAddress, String(BigInt(oldSmartWalletBalance) + BigInt(amount)));
        }
    } else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
        if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
            amount = oldSmartWalletBalance
        }
        appState.smartWalletState.tokenBalances.set(tokenAddress, String(BigInt(oldSmartWalletBalance) - BigInt(amount)));

        if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
            appState.walletState.tokenBalances.set(tokenAddress, String(BigInt(oldWalletBalance) + BigInt(amount)));
        }
    } else {
        new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
    }

    return appState;
}

