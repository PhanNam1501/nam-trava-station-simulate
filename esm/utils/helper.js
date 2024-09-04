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
exports.convertApyToApr = void 0;
exports.multiCall = multiCall;
exports.getMode = getMode;
exports.mul = mul;
exports.div = div;
exports.isWallet = isWallet;
exports.isNullAddress = isNullAddress;
exports.isNonUpdateTokenBalance = isNonUpdateTokenBalance;
exports.isUserAddress = isUserAddress;
exports.getJsonProvider = getJsonProvider;
const ethers_1 = require("ethers");
const address_1 = require("./address");
const Multicall_json_1 = __importDefault(require("../abis/Multicall.json"));
const error_1 = require("./error");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const config_1 = require("./config");
const chain_1 = require("./chain");
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
function mul(a, b) {
    return (0, bignumber_js_1.default)(a).multipliedBy(b).toFixed(0);
}
function div(a, b) {
    return (0, bignumber_js_1.default)(a).div(b).toFixed(0);
}
function isWallet(appState, address) {
    if (appState.walletState.address.toLowerCase() == address.toLowerCase() || appState.smartWalletState.address.toLowerCase() == address.toLowerCase()) {
        return true;
    }
    return false;
}
function isNullAddress(address) {
    return config_1.ZERO_ADDRESS === address;
}
function isNonUpdateTokenBalance(appState, _userAddress, _tokenAddress) {
    if (isUserAddress(appState, _userAddress)) {
        const mode = getMode(appState, _userAddress);
        const tokenAddress = _tokenAddress.toLowerCase();
        if (String(appState[mode].tokenBalances.get(tokenAddress)).toLowerCase() == "nan" || !appState[mode].tokenBalances.has(tokenAddress)) {
            return true;
        }
        return false;
    }
}
function isUserAddress(appState, userAddress) {
    if (appState.walletState.address.toLowerCase() == userAddress.toLowerCase() || appState.smartWalletState.address.toLowerCase() == userAddress.toLowerCase()) {
        return true;
    }
    return false;
}
const convertApyToApr = (apy) => {
    const n = 365;
    // Calculate (1 + x)
    const onePlusX = 1 + apy;
    // Calculate (1/n)
    const oneOverN = 1 / n;
    // Calculate (1 + x)^(1/n)
    const power = Math.pow(onePlusX, oneOverN);
    // Subtract 1
    const powerMinusOne = power - 1;
    // Multiply by n
    const result = n * powerMinusOne;
    return result;
};
exports.convertApyToApr = convertApyToApr;
function getJsonProvider(_chainId, _rpcUrl) {
    let rpcUrl = _rpcUrl ? _rpcUrl : chain_1.listChain[_chainId].rpcUrls[0];
    return new ethers_1.JsonRpcProvider(rpcUrl);
}
