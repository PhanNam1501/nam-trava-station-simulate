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
exports.isWallet = exports.div = exports.mul = exports.getMode = exports.multiCall = void 0;
const ethers_1 = require("ethers");
const address_1 = require("./address");
const Multicall_json_1 = __importDefault(require("../abis/Multicall.json"));
const error_1 = require("./error");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
function multiCall(abi, calls, provider, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        let _provider = provider;
        const multi = new ethers_1.Contract((0, address_1.getAddr)("MULTI_CALL_ADDRESS", chainId), Multicall_json_1.default, _provider);
        const itf = new ethers_1.Interface(abi);
        const callData = calls.map((call) => [
            call.address.toLowerCase(),
            itf.encodeFunctionData(call.name, call.params),
        ]);
        const { returnData } = yield multi.aggregate(callData);
        return returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
    });
}
exports.multiCall = multiCall;
;
function getMode(appState, _from) {
    let mode;
    if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
        mode = "walletState";
    }
    else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
        mode = "smartWalletState";
    }
    else {
        throw new error_1.FromAddressError();
    }
    return mode;
}
exports.getMode = getMode;
function mul(a, b) {
    return (0, bignumber_js_1.default)(a).multipliedBy(b).toFixed(0);
}
exports.mul = mul;
function div(a, b) {
    return (0, bignumber_js_1.default)(a).div(b).toFixed(0);
}
exports.div = div;
function isWallet(appState, address) {
    if (appState.walletState.address.toLowerCase() == address.toLowerCase() || appState.smartWalletState.address.toLowerCase() == address.toLowerCase()) {
        return true;
    }
    return false;
}
exports.isWallet = isWallet;
