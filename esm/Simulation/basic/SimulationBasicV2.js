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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateSendTokenV2 = exports.simulateUnwrapV2 = exports.simulateWrapV2 = void 0;
const trava_station_sdk_1 = require("trava-station-sdk");
const simulateExecute_1 = require("../../utils/simulateExecute");
const UpdateStateAccount_1 = require("./UpdateStateAccount");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const error_1 = require("../../utils/error");
const address_1 = require("../../utils/address");
function simulateWrapV2(appState1, _amount, actionAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if ((0, bignumber_js_1.default)(appState.walletState.ethBalances).isLessThan(_amount)) {
                throw new error_1.NotEnoughBalanceError();
            }
            const action = new trava_station_sdk_1.actions.basic.WrapBnbAction(_amount, actionAddress);
            const encodeActionData = action.encodeForDsProxyCall();
            const tokensApprove = new Array();
            yield (0, simulateExecute_1.simulateExecute)(appState, tokensApprove, {
                target: encodeActionData[0].toString(),
                data: encodeActionData[1].toString(),
                value: _amount
            });
            appState = yield (0, UpdateStateAccount_1.updateUserEthBalance)(appState, true);
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, (0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId), true);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateWrapV2 = simulateWrapV2;
function simulateUnwrapV2(appState1, _amount, actionAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            const bnb_address = (0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId).toLowerCase();
            if ((0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(bnb_address)).isLessThan(_amount)) {
                throw new error_1.NotEnoughBalanceError();
            }
            const action = new trava_station_sdk_1.actions.basic.UnwrapBnbAction(_amount, appState.walletState.address, actionAddress);
            const encodeActionData = action.encodeForDsProxyCall();
            const tokensApprove = new Array();
            yield (0, simulateExecute_1.simulateExecute)(appState, tokensApprove, {
                target: encodeActionData[0].toString(),
                data: encodeActionData[1].toString(),
                value: ""
            });
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletEthBalance)(appState, true);
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, (0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId), true);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateUnwrapV2 = simulateUnwrapV2;
function simulateSendTokenV2(appState1, _tokenAddress, from, to, _amount, actionAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let tokenAddress = _tokenAddress.toLowerCase();
            if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase() && (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(tokenAddress)).isLessThan(_amount)) {
                throw new error_1.NotEnoughBalanceError();
            }
            if (from.toLowerCase() == appState.walletState.address.toLowerCase() && (0, bignumber_js_1.default)(appState.walletState.tokenBalances.get(tokenAddress)).isLessThan(_amount)) {
                throw new error_1.NotEnoughBalanceError();
            }
            let action = new trava_station_sdk_1.actions.basic.SendTokenAction(tokenAddress, to, _amount, actionAddress);
            let tokensApprove = new Array();
            if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                action = new trava_station_sdk_1.actions.basic.PullTokenAction(tokenAddress, from, _amount, actionAddress);
                let tokenApprove_1 = {
                    address: (0, address_1.convertHexStringToAddress)(_tokenAddress),
                    amount: _amount
                };
                tokensApprove.push(tokenApprove_1);
            }
            const encodeActionData = action.encodeForDsProxyCall();
            yield (0, simulateExecute_1.simulateExecute)(appState, tokensApprove, {
                target: encodeActionData[0].toString(),
                data: encodeActionData[1].toString(),
                value: ""
            });
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, tokenAddress, true);
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, tokenAddress, true);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateSendTokenV2 = simulateSendTokenV2;
