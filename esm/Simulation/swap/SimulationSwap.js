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
const config_1 = require("../../utils/config");
function simulateSwap(appState1, _fromToken, _toToken, _fromAmount, _toAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        let fromAmount = _fromAmount;
        let toAmount = _toAmount;
        const appState = Object.assign({}, appState1);
        _fromToken = _fromToken.toLowerCase();
        _toToken = _toToken.toLowerCase();
        if (!appState.walletState.tokenBalances.has(_fromToken)) {
            yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, _fromToken);
        }
        if (!appState.walletState.tokenBalances.has(_toToken)) {
            yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, _toToken);
        }
        // if (BigInt(appState.walletState.tokenBalances.get(fromToken)!) < BigInt(fromAmount)) {
        //     throw new Error("Insufficient balance")
        // }
        if (fromAmount.toString() == config_1.MAX_UINT256 || BigInt(fromAmount) == BigInt(config_1.MAX_UINT256)) {
            fromAmount = appState.walletState.tokenBalances.get(_fromToken);
        }
        let newFromBalance = BigInt(appState.walletState.tokenBalances.get(_fromToken)) - BigInt(fromAmount);
        let newToBalance = BigInt(appState.walletState.tokenBalances.get(_toToken)) + BigInt(toAmount);
        appState.walletState.tokenBalances.set(_fromToken, String(BigInt(newFromBalance)));
        appState.walletState.tokenBalances.set(_toToken, String(BigInt(newToBalance)));
        return appState;
    });
}
exports.simulateSwap = simulateSwap;
