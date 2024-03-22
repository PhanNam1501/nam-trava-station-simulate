var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { actions } from "trava-station-sdk";
import { simulateExecute } from "../../utils/simulateExecute";
import { updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserEthBalance, updateUserTokenBalance } from "./UpdateStateAccount";
import BigNumber from "bignumber.js";
import { NotEnoughBalanceError } from "../../utils/error";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
export function simulateWrapV2(appState1, _amount, actionAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (BigNumber(appState.walletState.ethBalances).isLessThan(_amount)) {
                throw new NotEnoughBalanceError();
            }
            const action = new actions.basic.WrapBnbAction(_amount, actionAddress);
            const encodeActionData = action.encodeForDsProxyCall();
            const tokensApprove = new Array();
            yield simulateExecute(appState, tokensApprove, {
                target: encodeActionData[0].toString(),
                data: encodeActionData[1].toString(),
                value: _amount
            });
            appState = yield updateUserEthBalance(appState, true);
            appState = yield updateSmartWalletTokenBalance(appState, getAddr("WBNB_ADDRESS", appState.chainId), true);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function simulateUnwrapV2(appState1, _amount, actionAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            const bnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();
            if (BigNumber(appState.smartWalletState.tokenBalances.get(bnb_address)).isLessThan(_amount)) {
                throw new NotEnoughBalanceError();
            }
            const action = new actions.basic.UnwrapBnbAction(_amount, appState.walletState.address, actionAddress);
            const encodeActionData = action.encodeForDsProxyCall();
            const tokensApprove = new Array();
            yield simulateExecute(appState, tokensApprove, {
                target: encodeActionData[0].toString(),
                data: encodeActionData[1].toString(),
                value: ""
            });
            appState = yield updateSmartWalletEthBalance(appState, true);
            appState = yield updateUserTokenBalance(appState, getAddr("WBNB_ADDRESS", appState.chainId), true);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function simulateSendTokenV2(appState1, _tokenAddress, from, to, _amount, actionAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let tokenAddress = _tokenAddress.toLowerCase();
            if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase() && BigNumber(appState.smartWalletState.tokenBalances.get(tokenAddress)).isLessThan(_amount)) {
                throw new NotEnoughBalanceError();
            }
            if (from.toLowerCase() == appState.walletState.address.toLowerCase() && BigNumber(appState.walletState.tokenBalances.get(tokenAddress)).isLessThan(_amount)) {
                throw new NotEnoughBalanceError();
            }
            let action = new actions.basic.SendTokenAction(tokenAddress, to, _amount, actionAddress);
            let tokensApprove = new Array();
            if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                action = new actions.basic.PullTokenAction(tokenAddress, from, _amount, actionAddress);
                let tokenApprove_1 = {
                    address: convertHexStringToAddress(_tokenAddress),
                    amount: _amount
                };
                tokensApprove.push(tokenApprove_1);
            }
            const encodeActionData = action.encodeForDsProxyCall();
            yield simulateExecute(appState, tokensApprove, {
                target: encodeActionData[0].toString(),
                data: encodeActionData[1].toString(),
                value: ""
            });
            appState = yield updateSmartWalletTokenBalance(appState, tokenAddress, true);
            appState = yield updateUserTokenBalance(appState, tokenAddress, true);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
