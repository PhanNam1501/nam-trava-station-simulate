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
exports.simulateAddliquidity = simulateAddliquidity;
exports.simulateRemoveliquidity = simulateRemoveliquidity;
var UpdateStateAccount_1 = require("../basic/UpdateStateAccount");
var bignumber_js_1 = require("bignumber.js");
var UpdateStateAccount_2 = require("./UpdateStateAccount");
function simulateAddliquidity(appState1, _token0, _token1, _tokenPair, _token0Amount, _token1Amount) {
    return __awaiter(this, void 0, void 0, function () {
        var token0Amount, token1Amount, token0, token1, tokenPair, appState, token0Balance, token1Balance, token0ToUSD, token1ToUSD, sumToken0And1, tvl, pairBalance, _tokenPairAmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token0Amount = _token0Amount;
                    token1Amount = _token1Amount;
                    token0 = _token0.toLowerCase();
                    token1 = _token1.toLowerCase();
                    tokenPair = _tokenPair.toLowerCase();
                    appState = __assign({}, appState1);
                    if (!!appState.pancakeSwapV2Pair.isFetch) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, UpdateStateAccount_2.updatePancakeSwapV2)(appState)];
                case 1:
                    appState = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!!appState.smartWalletState.tokenBalances.has(token0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, token0)];
                case 3:
                    appState = _a.sent();
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, token0)];
                case 4:
                    appState = _a.sent();
                    _a.label = 5;
                case 5:
                    if (!!appState.smartWalletState.tokenBalances.has(token1)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, token1)];
                case 6:
                    appState = _a.sent();
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, token1)];
                case 7:
                    appState = _a.sent();
                    _a.label = 8;
                case 8:
                    if (!!appState.smartWalletState.tokenBalances.has(tokenPair)) return [3 /*break*/, 11];
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, tokenPair)];
                case 9:
                    appState = _a.sent();
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, tokenPair)];
                case 10:
                    appState = _a.sent();
                    _a.label = 11;
                case 11:
                    if (!appState.smartWalletState.tokenBalances.get(token0)) {
                        throw new Error("token0 not found in smart wallet");
                    }
                    token0Balance = appState.smartWalletState.tokenBalances.get(token0);
                    if (!appState.smartWalletState.tokenBalances.get(token1)) {
                        throw new Error("token1 not found in smart wallet");
                    }
                    token1Balance = appState.smartWalletState.tokenBalances.get(token1);
                    token0ToUSD = (0, bignumber_js_1.default)(token0Amount).multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Price).dividedBy(Math.pow(10, Number(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Decimals)));
                    token1ToUSD = (0, bignumber_js_1.default)(token1Amount).multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Price).dividedBy(Math.pow(10, Number(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Decimals)));
                    sumToken0And1 = (0, bignumber_js_1.default)(token0ToUSD).plus(token1ToUSD);
                    tvl = appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl;
                    pairBalance = (0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken);
                    _tokenPairAmount = pairBalance.dividedBy((0, bignumber_js_1.default)(1).minus((sumToken0And1.dividedBy(sumToken0And1.plus(tvl))))).minus(pairBalance);
                    appState.smartWalletState.tokenBalances.set(token0, (0, bignumber_js_1.default)(token0Balance).minus(token0Amount).toString());
                    appState.smartWalletState.tokenBalances.set(token1, (0, bignumber_js_1.default)(token1Balance).minus(token1Amount).toString());
                    appState.smartWalletState.tokenBalances.set(tokenPair, (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(tokenPair)).plus(_tokenPairAmount).toString());
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).pairTokenOfSmartWallet = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).pairTokenOfSmartWallet).plus(_tokenPairAmount));
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Hold = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Hold).plus(_token0Amount));
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Hold = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Hold).plus(_token1Amount));
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl)
                        .plus(sumToken0And1));
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken).plus(_tokenPairAmount));
                    return [2 /*return*/, appState];
            }
        });
    });
}
function simulateRemoveliquidity(appState1, _token0, _token1, _tokenPair, _tokenPairAmount) {
    return __awaiter(this, void 0, void 0, function () {
        var token0, token1, tokenPair, appState, token0Balance, token1Balance, tokenPairAmount, token0Amount, token1Amount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token0 = _token0.toLowerCase();
                    token1 = _token1.toLowerCase();
                    tokenPair = _tokenPair.toLowerCase();
                    appState = __assign({}, appState1);
                    if (!!appState.pancakeSwapV2Pair.isFetch) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, UpdateStateAccount_2.updatePancakeSwapV2)(appState)];
                case 1:
                    appState = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!!appState.smartWalletState.tokenBalances.has(token0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, token0)];
                case 3:
                    appState = _a.sent();
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, token0)];
                case 4:
                    appState = _a.sent();
                    _a.label = 5;
                case 5:
                    if (!!appState.smartWalletState.tokenBalances.has(token1)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, token1)];
                case 6:
                    appState = _a.sent();
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, token1)];
                case 7:
                    appState = _a.sent();
                    _a.label = 8;
                case 8:
                    if (!!appState.smartWalletState.tokenBalances.has(tokenPair)) return [3 /*break*/, 11];
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, tokenPair)];
                case 9:
                    appState = _a.sent();
                    return [4 /*yield*/, (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, tokenPair)];
                case 10:
                    appState = _a.sent();
                    _a.label = 11;
                case 11:
                    if (!appState.smartWalletState.tokenBalances.get(token0)) {
                        throw new Error("token0 not found in smart wallet");
                    }
                    token0Balance = appState.smartWalletState.tokenBalances.get(token0);
                    if (!appState.smartWalletState.tokenBalances.get(token1)) {
                        throw new Error("token1 not found in smart wallet");
                    }
                    token1Balance = appState.smartWalletState.tokenBalances.get(token1);
                    tokenPairAmount = (0, bignumber_js_1.default)(_tokenPairAmount);
                    token0Amount = (0, bignumber_js_1.default)(tokenPairAmount)
                        .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken)
                        .multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl)
                        .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Price)
                        .multipliedBy(Math.pow(10, Number(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Decimals)))
                        .dividedBy(2);
                    token1Amount = (0, bignumber_js_1.default)(tokenPairAmount)
                        .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken)
                        .multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl)
                        .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Price)
                        .multipliedBy(Math.pow(10, Number(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Decimals)))
                        .dividedBy(2);
                    appState.smartWalletState.tokenBalances.set(token0, (0, bignumber_js_1.default)(token0Balance).plus(token0Amount).toString());
                    appState.smartWalletState.tokenBalances.set(token1, (0, bignumber_js_1.default)(token1Balance).plus(token1Amount).toString());
                    appState.smartWalletState.tokenBalances.set(tokenPair, (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(tokenPair)).minus(_tokenPairAmount).toString());
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).pairTokenOfSmartWallet = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).pairTokenOfSmartWallet).minus(_tokenPairAmount));
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Hold = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Hold).minus(token0Amount));
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Hold = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Hold).minus(token1Amount));
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken).minus(_tokenPairAmount));
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl)
                        .minus(token0Amount.dividedBy(Math.pow(10, Number(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Decimals))).multipliedBy(2)));
                    return [2 /*return*/, appState];
            }
        });
    });
}
