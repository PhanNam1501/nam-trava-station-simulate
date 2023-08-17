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
import _ from "lodash";
export function simulateWrap(appState1, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = _.cloneDeep(appState1);
        if (!appState.smartWalletState.tokenBalances.has(getAddr("WBNB_ADDRESS"))) {
            yield updateSmartWalletTokenBalance(appState, getAddr("WBNB_ADDRESS"));
        }
        if (BigInt(appState.walletState.ethBalances) < BigInt(amount)) {
            throw new Error("Not enough BNB");
        }
        let newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
        let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(getAddr("WBNB_ADDRESS"))) + BigInt(amount);
        appState.walletState.ethBalances = String(newEthBalance);
        appState.smartWalletState.tokenBalances.set(getAddr("WBNB_ADDRESS"), String(BigInt(newWBNBBalance)));
        return appState;
    });
}
export function simulateUnwrap(appState1, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = _.cloneDeep(appState1);
        if (!appState.walletState.tokenBalances.has(getAddr("WBNB_ADDRESS"))) {
            yield updateUserTokenBalance(appState, getAddr("WBNB_ADDRESS"));
        }
        if (BigInt(appState.walletState.tokenBalances.get(getAddr("WBNB_ADDRESS"))) < BigInt(amount)) {
            throw new Error("Not enough WBNB");
        }
        let newWBNBBalance = BigInt(appState.walletState.tokenBalances.get(getAddr("WBNB_ADDRESS"))) - BigInt(amount);
        let newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount);
        appState.walletState.tokenBalances.set(getAddr("WBNB_ADDRESS"), String(newWBNBBalance));
        appState.walletState.ethBalances = String(newBNBBalance);
        return appState;
    });
}
export function simulateSendToken(appState1, tokenAddress, to, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = _.cloneDeep(appState1);
        if (!appState.walletState.tokenBalances.has(getAddr("WBNB_ADDRESS"))) {
            yield updateUserTokenBalance(appState, getAddr("WBNB_ADDRESS"));
        }
        if (!appState.smartWalletState.tokenBalances.has(getAddr("WBNB_ADDRESS"))) {
            yield updateSmartWalletTokenBalance(appState, getAddr("WBNB_ADDRESS"));
        }
        if (BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)) < BigInt(amount)) {
            throw new Error("Not enough Balance");
        }
        let newTokenBalance = BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)) - BigInt(amount);
        appState.smartWalletState.tokenBalances.set(tokenAddress, String(newTokenBalance));
        if (to == appState.walletState.address) {
            let newUserTokenBalance = BigInt(appState.walletState.tokenBalances.get(tokenAddress)) + BigInt(amount);
            appState.walletState.tokenBalances.set(tokenAddress, String(newUserTokenBalance));
        }
        return appState;
    });
}
