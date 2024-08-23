"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePancakeSwapV2 = updatePancakeSwapV2;
var bignumber_js_1 = require("bignumber.js");
var PancakeSwapFactory_json_1 = require("../../abis/PancakeSwapFactory.json");
var token_combinationsMainnet_json_1 = require("./token_combinationsMainnet.json");
var addressTokenMainnet_json_1 = require("./addressTokenMainnet.json");
var BEP20_json_1 = require("../../abis/BEP20.json");
var utils_1 = require("../../utils");
var axios_1 = require("axios");
var helper_1 = require("../../utils/helper");
function updatePancakeSwapV2(appState1, force) {
    return __awaiter(this, void 0, void 0, function () {
        function getAddressList(tokens) {
            return tokens.map(function (token) { return token.address; });
        }
        var appState, factoryAddress_1, tokenPairs, tokensAddress_1, tokens0Address, i, token0, token1, token, pairTokensAddress, tokens, addressList, stringAddress, i, dataTokensSupported, tokensAddressAndpairToken_1, pairTokensAddressNot0, i, token0, token1, pairAddress, _a, tokens0InPair, tokens1InPair, tokens0Decimals, tokens1Decimals, pairTokensOfSmartWallet, pairTokensDecimals, totalSupplyPairTokens, _loop_1, i, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = __assign({}, appState1);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    factoryAddress_1 = (0, utils_1.getAddr)("FactoryAddress", appState.chainId);
                    tokenPairs = token_combinationsMainnet_json_1.default;
                    tokensAddress_1 = [];
                    tokens0Address = [];
                    for (i = 0; i < tokenPairs.length; i++) {
                        token0 = tokenPairs[i].address1;
                        token1 = tokenPairs[i].address2;
                        token = [token0, token1];
                        tokens0Address.push(token0);
                        tokensAddress_1.push(token);
                    }
                    return [4 /*yield*/, Promise.all([
                            (0, helper_1.multiCall)(PancakeSwapFactory_json_1.default, tokens0Address.map(function (address, index) { return ({
                                address: factoryAddress_1,
                                name: "getPair",
                                params: [tokensAddress_1[index][0], tokensAddress_1[index][1]],
                            }); }), appState.web3, appState.chainId)
                        ])];
                case 2:
                    pairTokensAddress = (_b.sent())[0];
                    tokens = addressTokenMainnet_json_1.default;
                    addressList = getAddressList(tokens);
                    stringAddress = "";
                    for (i = 0; i < addressList.length; i++) {
                        stringAddress += addressList[i] + "%2C%20";
                    }
                    stringAddress = stringAddress.slice(0, -6);
                    return [4 /*yield*/, getDataTokenByAxios(stringAddress, "0x38")];
                case 3:
                    dataTokensSupported = _b.sent();
                    dataTokensSupported = dataTokensSupported["tokens"];
                    tokensAddressAndpairToken_1 = [];
                    pairTokensAddressNot0 = [];
                    for (i = 0; i < tokenPairs.length; i++) {
                        token0 = tokenPairs[i].address1;
                        token1 = tokenPairs[i].address2;
                        pairAddress = pairTokensAddress[i][0];
                        if (pairAddress != utils_1.ZERO_ADDRESS) {
                            tokensAddressAndpairToken_1.push([token0, token1, pairAddress]);
                            pairTokensAddressNot0.push(pairAddress);
                        }
                    }
                    return [4 /*yield*/, Promise.all([
                            (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map(function (address, index) { return ({
                                address: tokensAddressAndpairToken_1[index][0],
                                name: "balanceOf",
                                params: [address],
                            }); }), appState.web3, appState.chainId),
                            (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map(function (address, index) { return ({
                                address: tokensAddressAndpairToken_1[index][1],
                                name: "balanceOf",
                                params: [address],
                            }); }), appState.web3, appState.chainId),
                            (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map(function (address, index) { return ({
                                address: tokensAddressAndpairToken_1[index][0],
                                name: "decimals",
                                params: [],
                            }); }), appState.web3, appState.chainId),
                            (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map(function (address, index) { return ({
                                address: tokensAddressAndpairToken_1[index][1],
                                name: "decimals",
                                params: [],
                            }); }), appState.web3, appState.chainId),
                            (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map(function (address, index) { return ({
                                address: address,
                                name: "balanceOf",
                                params: [appState.smartWalletState.address],
                            }); }), appState.web3, appState.chainId),
                            (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map(function (address, index) { return ({
                                address: address,
                                name: "decimals",
                                params: [],
                            }); }), appState.web3, appState.chainId),
                            (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map(function (address, index) { return ({
                                address: address,
                                name: "totalSupply",
                                params: [],
                            }); }), appState.web3, appState.chainId)
                        ])];
                case 4:
                    _a = _b.sent(), tokens0InPair = _a[0], tokens1InPair = _a[1], tokens0Decimals = _a[2], tokens1Decimals = _a[3], pairTokensOfSmartWallet = _a[4], pairTokensDecimals = _a[5], totalSupplyPairTokens = _a[6];
                    _loop_1 = function (i) {
                        var token0 = tokensAddressAndpairToken_1[i][0];
                        var token1 = tokensAddressAndpairToken_1[i][1];
                        var pairAddress = pairTokensAddressNot0[i];
                        var token0InPair = tokens0InPair[i][0];
                        var token0Decimals = tokens0Decimals[i][0];
                        var token1InPair = tokens1InPair[i][0];
                        var token1Decimals = tokens1Decimals[i][0];
                        var pairTokenOfSmartWallet = pairTokensOfSmartWallet[i][0];
                        var pairTokenDecimals = pairTokensDecimals[i][0];
                        var totalSupplyPairToken = totalSupplyPairTokens[i][0];
                        var token0Price = new bignumber_js_1.default(dataTokensSupported.find(function (token) { return token.address == token0; })["price"]);
                        var token1Price = new bignumber_js_1.default(dataTokensSupported.find(function (token) { return token.address == token1; })["price"]);
                        var totalValue = token0Price.multipliedBy(token0InPair).dividedBy(Math.pow(10, Number(token0Decimals))).plus(token1Price.multipliedBy(token1InPair).dividedBy(Math.pow(10, Number(token1Decimals))));
                        // 1000 USD
                        if (totalValue.isGreaterThan(1000)) {
                            appState.pancakeSwapV2Pair.pancakeV2Pairs.set(pairAddress.toLowerCase(), {
                                addressToken0: token0.toLowerCase(),
                                addressToken1: token1.toLowerCase(),
                                token0Price: Number(token0Price),
                                token1Price: Number(token1Price),
                                token0Decimals: Number(token0Decimals),
                                token1Decimals: Number(token1Decimals),
                                token0Hold: Number(token0InPair),
                                token1Hold: Number(token1InPair),
                                pairTokenDecimals: Number(pairTokenDecimals),
                                totalSupplyPairToken: Number(totalSupplyPairToken),
                                tvl: Number(totalValue),
                                pairTokenOfSmartWallet: Number(pairTokenOfSmartWallet)
                            });
                        }
                    };
                    for (i = 0; i < pairTokensAddressNot0.length; i++) {
                        _loop_1(i);
                    }
                    appState.pancakeSwapV2Pair.isFetch = true;
                    return [2 /*return*/, appState];
                case 5:
                    error_1 = _b.sent();
                    console.error(error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, appState];
            }
        });
    });
}
function getDataTokenByAxios(address, chain) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "".concat(utils_1.centic_api, "/v3//tokens/price?chain=").concat(chain, "&addresses=").concat(address);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.request({
                            method: "get",
                            url: url,
                            headers: {
                                "x-apikey": utils_1.centic_api_key
                            }
                        })];
                case 2:
                    response = _a.sent();
                    data = response.data;
                    return [2 /*return*/, data];
                case 3:
                    err_1 = _a.sent();
                    console.log(err_1);
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
