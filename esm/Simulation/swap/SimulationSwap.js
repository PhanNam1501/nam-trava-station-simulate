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
import { getMode, isWallet } from "../../utils/helper";
import BigNumber from "bignumber.js";
import { getAddr } from "../../utils";
export function simulateSwap(appState1, _fromToken, _toToken, _fromAmount, _toAmount, _fromAddress, _toAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let fromAmount = _fromAmount;
        let toAmount = _toAmount;
        let fromToken = _fromToken.toLowerCase();
        let toToken = _toToken.toLowerCase();
        let appState = Object.assign({}, appState1);
        if (!appState.walletState.tokenBalances.has(fromToken)) {
            appState = yield updateUserTokenBalance(appState, fromToken);
            appState = yield updateSmartWalletTokenBalance(appState, fromToken);
        }
        if (!appState.walletState.tokenBalances.has(toToken)) {
            appState = yield updateUserTokenBalance(appState, toToken);
            appState = yield updateSmartWalletTokenBalance(appState, toToken);
        }
        let modeFrom = getMode(appState, _fromAddress);
        let currentBalance = appState[modeFrom].tokenBalances.get(fromToken);
        if (fromAmount.toString() == MAX_UINT256 || BigInt(fromAmount) == BigInt(MAX_UINT256)) {
            fromAmount = currentBalance;
        }
        let newBalance = BigNumber(currentBalance).minus(fromAmount).toFixed(0);
        appState[modeFrom].tokenBalances.set(fromToken, newBalance);
        if (fromToken.toLowerCase() == getAddr("BNB_ADDRESS", appState.chainId).toLowerCase()) {
            appState[modeFrom].ethBalances = newBalance;
        }
        // if(_fromAddress.toLowerCase() == appState.walletState.address.toLowerCase())
        // {
        //     _fromAddress = appState.walletState.address;
        //     let newFromBalance = BigInt(appState.walletState.tokenBalances.get(fromToken)!) - BigInt(fromAmount)
        //     appState.walletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)))
        // }
        // else if (_fromAddress.toLowerCase() == appState.smartWalletState.address.toLowerCase())
        // {
        //     _fromAddress = appState.smartWalletState.address;
        //     let newFromBalance = BigInt(appState.smartWalletState.tokenBalances.get(fromToken)!) - BigInt(fromAmount)
        //     appState.smartWalletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)))
        // }
        if (isWallet(appState, _toAddress)) {
            let modeTo = getMode(appState, _toAddress);
            let newBalance = BigNumber(appState[modeTo].tokenBalances.get(toToken)).plus(toAmount).toFixed(0);
            appState[modeTo].tokenBalances.set(toToken, newBalance);
        }
        // if(_toAddress.toLowerCase() == appState.walletState.address.toLowerCase())
        // {
        //     _toAddress = appState.walletState.address;
        //     let newToBalance = BigInt(appState.walletState.tokenBalances.get(toToken)!) + BigInt(toAmount)
        //     appState.walletState.tokenBalances.set(toToken, String(BigInt(newToBalance)))
        // }
        // else if (_toAddress.toLowerCase() == appState.smartWalletState.address.toLowerCase())
        // {
        //     _toAddress = appState.smartWalletState.address;
        //     let newToBalance = BigInt(appState.smartWalletState.tokenBalances.get(toToken)!) + BigInt(toAmount)
        //     appState.smartWalletState.tokenBalances.set(toToken, String(BigInt(newToBalance)))
        // }
        return appState;
    });
}
