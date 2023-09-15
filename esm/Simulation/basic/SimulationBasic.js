var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "./UpdateStateAccount";
import { getAddr } from "../../utils/address";
import { MAX_UINT256 } from "../../utils/config";
export function simulateWrap(appState1, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = _amount;
        const appState = Object.assign({}, appState1);
        const bnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
        if (!appState.smartWalletState.tokenBalances.has(bnb_address)) {
            yield updateSmartWalletTokenBalance(appState, bnb_address);
        }
        // if (BigInt(appState.walletState.ethBalances) < BigInt(amount)) {
        //     throw new Error("Not enough BNB")
        // }
        console.log("amount.toString() == MAX_UINT256", amount.toString(), MAX_UINT256);
        if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
            console.log("????");
            amount = appState.walletState.ethBalances;
        }
        console.log("amount", amount);
        let newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
        let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(bnb_address)) + BigInt(amount);
        appState.walletState.ethBalances = String(newEthBalance);
        appState.smartWalletState.tokenBalances.set(bnb_address, String(BigInt(newWBNBBalance)));
        return appState;
    });
}
export function simulateUnwrap(appState1, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = _amount;
        const appState = Object.assign({}, appState1);
        const bnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
        if (!appState.walletState.tokenBalances.has(bnb_address)) {
            yield updateUserTokenBalance(appState, bnb_address);
        }
        // if (BigInt(appState.walletState.tokenBalances.get(bnb_address)!) < BigInt(amount)) {
        //     throw new Error("Not enough WBNB");
        // }
        if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
            amount = appState.smartWalletState.tokenBalances.get(bnb_address);
        }
        let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(bnb_address)) - BigInt(amount);
        let newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount);
        appState.smartWalletState.tokenBalances.set(bnb_address, String(newWBNBBalance));
        appState.walletState.ethBalances = String(newBNBBalance);
        return appState;
    });
}
export function simulateSendToken(appState1, _tokenAddress, from, to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = _amount;
        const appState = Object.assign({}, appState1);
        const bnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
        const tokenAddress = _tokenAddress.toLowerCase();
        if (!appState.walletState.tokenBalances.has(bnb_address)) {
            yield updateUserTokenBalance(appState, bnb_address);
        }
        if (!appState.smartWalletState.tokenBalances.has(bnb_address)) {
            yield updateSmartWalletTokenBalance(appState, bnb_address);
        }
        // if (BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)!) < BigInt(amount)) {
        //     throw new Error("Not enough Balance");
        // }
        const oldWalletBalance = appState.walletState.tokenBalances.get(tokenAddress);
        const oldSmartWalletBalance = appState.smartWalletState.tokenBalances.get(tokenAddress);
        if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
            if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
                amount = oldWalletBalance;
            }
            appState.walletState.tokenBalances.set(tokenAddress, String(BigInt(oldWalletBalance) - BigInt(amount)));
            if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                appState.smartWalletState.tokenBalances.set(tokenAddress, String(BigInt(oldSmartWalletBalance) + BigInt(amount)));
            }
        }
        else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
                amount = oldSmartWalletBalance;
            }
            appState.smartWalletState.tokenBalances.set(tokenAddress, String(BigInt(oldSmartWalletBalance) - BigInt(amount)));
            if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                appState.walletState.tokenBalances.set(tokenAddress, String(BigInt(oldWalletBalance) + BigInt(amount)));
            }
        }
        else {
            new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
        }
        // if(amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
        //     amount = appState.smartWalletState.tokenBalances.get(tokenAddress)!;
        // }
        // let newTokenBalance = BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)!) - BigInt(amount);
        // appState.smartWalletState.tokenBalances.set(tokenAddress, String(newTokenBalance));
        // if (to == appState.walletState.address) {
        //     let newUserTokenBalance = BigInt(appState.walletState.tokenBalances.get(tokenAddress)!) + BigInt(amount);
        //     appState.walletState.tokenBalances.set(tokenAddress, String(newUserTokenBalance));
        // }
        return appState;
    });
}
