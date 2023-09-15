var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import { MAX_UINT256 } from "../../utils/config";
export function simulateSwap(appState1, _fromToken, _toToken, _fromAmount, _toAmount, _fromAddress, _toAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let fromAmount = _fromAmount;
        let toAmount = _toAmount;
        let appState = Object.assign({}, appState1);
        _fromToken = _fromToken.toLowerCase();
        _toToken = _toToken.toLowerCase();
        if (!appState.walletState.tokenBalances.has(_fromToken)) {
            appState = yield updateUserTokenBalance(appState, _fromToken);
            appState = yield updateSmartWalletTokenBalance(appState, _fromToken);
        }
        if (!appState.walletState.tokenBalances.has(_toToken)) {
            appState = yield updateUserTokenBalance(appState, _toToken);
            appState = yield updateSmartWalletTokenBalance(appState, _toToken);
        }
        if (fromAmount.toString() == MAX_UINT256 || BigInt(fromAmount) == BigInt(MAX_UINT256)) {
            if (_fromAddress == appState.walletState.address) {
                fromAmount = appState.walletState.tokenBalances.get(_fromToken);
            }
            else if (_fromAddress == appState.smartWalletState.address) {
                fromAmount = appState.smartWalletState.tokenBalances.get(_fromToken);
            }
        }
        if (_fromAddress == appState.walletState.address) {
            let newFromBalance = BigInt(appState.walletState.tokenBalances.get(_fromToken)) - BigInt(fromAmount);
            appState.walletState.tokenBalances.set(_fromToken, String(BigInt(newFromBalance)));
        }
        else if (_fromAddress == appState.smartWalletState.address) {
            let newFromBalance = BigInt(appState.smartWalletState.tokenBalances.get(_fromToken)) - BigInt(fromAmount);
            appState.smartWalletState.tokenBalances.set(_fromToken, String(BigInt(newFromBalance)));
        }
        if (_toAddress == appState.walletState.address) {
            let newToBalance = BigInt(appState.walletState.tokenBalances.get(_toToken)) + BigInt(toAmount);
            appState.walletState.tokenBalances.set(_toToken, String(BigInt(newToBalance)));
        }
        else if (_toAddress == appState.smartWalletState.address) {
            let newToBalance = BigInt(appState.smartWalletState.tokenBalances.get(_toToken)) + BigInt(toAmount);
            appState.smartWalletState.tokenBalances.set(_toToken, String(BigInt(newToBalance)));
        }
        return appState;
    });
}
