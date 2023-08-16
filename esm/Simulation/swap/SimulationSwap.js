var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { updateUserTokenBalance } from "../basic/UpdateStateAccount";
export function simulateSwap(appState, fromToken, toToken, fromAmount, toAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!appState.walletState.tokenBalances.has(fromToken)) {
            yield updateUserTokenBalance(appState, fromToken);
        }
        if (!appState.walletState.tokenBalances.has(toToken)) {
            yield updateUserTokenBalance(appState, toToken);
        }
        if (BigInt(appState.walletState.tokenBalances.get(fromToken)) < BigInt(fromAmount)) {
            throw new Error("Insufficient balance");
        }
        let newFromBalance = BigInt(appState.walletState.tokenBalances.get(fromToken)) - BigInt(fromAmount);
        let newToBalance = BigInt(appState.walletState.tokenBalances.get(toToken)) + BigInt(toAmount);
        appState.walletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)));
        appState.walletState.tokenBalances.set(toToken, String(BigInt(newToBalance)));
    });
}
