"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateSwap = void 0;
const UpdateStateAccount_1 = require("../basic/UpdateStateAccount");
function simulateSwap(appState1, fromToken, toToken, fromAmount, toAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.walletState.tokenBalances.has(fromToken)) {
            yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, fromToken);
        }
        if (!appState.walletState.tokenBalances.has(toToken)) {
            yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, toToken);
        }
        if (BigInt(appState.walletState.tokenBalances.get(fromToken)) < BigInt(fromAmount)) {
            throw new Error("Insufficient balance");
        }
        let newFromBalance = BigInt(appState.walletState.tokenBalances.get(fromToken)) - BigInt(fromAmount);
        let newToBalance = BigInt(appState.walletState.tokenBalances.get(toToken)) + BigInt(toAmount);
        appState.walletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)));
        appState.walletState.tokenBalances.set(toToken, String(BigInt(newToBalance)));
        return appState;
    });
}
exports.simulateSwap = simulateSwap;
