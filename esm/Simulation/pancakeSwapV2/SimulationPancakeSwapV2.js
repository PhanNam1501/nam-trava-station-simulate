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
exports.simulateRemoveliquidity = exports.simulateAddliquidity = void 0;
const UpdateStateAccount_1 = require("../basic/UpdateStateAccount");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const UpdateStateAccount_2 = require("./UpdateStateAccount");
function simulateAddliquidity(appState1, _token0, _token1, _tokenPair, _token0Amount, _token1Amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let token0Amount = _token0Amount;
        let token1Amount = _token1Amount;
        let token0 = _token0.toLowerCase();
        let token1 = _token1.toLowerCase();
        let tokenPair = _tokenPair.toLowerCase();
        let appState = Object.assign({}, appState1);
        if (!appState.pancakeSwapV2Pair.isFetch) {
            appState = yield (0, UpdateStateAccount_2.updatePancakeSwapV2)(appState);
        }
        if (!appState.smartWalletState.tokenBalances.has(token0)) {
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, token0);
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, token0);
        }
        if (!appState.smartWalletState.tokenBalances.has(token1)) {
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, token1);
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, token1);
        }
        if (!appState.smartWalletState.tokenBalances.has(tokenPair)) {
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, tokenPair);
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, tokenPair);
        }
        if (!appState.smartWalletState.tokenBalances.get(token0)) {
            throw new Error("token0 not found in smart wallet");
        }
        let token0Balance = appState.smartWalletState.tokenBalances.get(token0);
        if (!appState.smartWalletState.tokenBalances.get(token1)) {
            throw new Error("token1 not found in smart wallet");
        }
        let token1Balance = appState.smartWalletState.tokenBalances.get(token1);
        let token0ToUSD = (0, bignumber_js_1.default)(token0Amount).multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Price).dividedBy(Math.pow(10, Number(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Decimals)));
        let token1ToUSD = (0, bignumber_js_1.default)(token1Amount).multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Price).dividedBy(Math.pow(10, Number(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Decimals)));
        let sumToken0And1 = (0, bignumber_js_1.default)(token0ToUSD).plus(token1ToUSD);
        let tvl = appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl;
        let pairBalance = (0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken);
        let _tokenPairAmount = pairBalance.dividedBy((0, bignumber_js_1.default)(1).minus((sumToken0And1.dividedBy(sumToken0And1.plus(tvl))))).minus(pairBalance);
        appState.smartWalletState.tokenBalances.set(token0, (0, bignumber_js_1.default)(token0Balance).minus(token0Amount).toString());
        appState.smartWalletState.tokenBalances.set(token1, (0, bignumber_js_1.default)(token1Balance).minus(token1Amount).toString());
        appState.smartWalletState.tokenBalances.set(tokenPair, (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(tokenPair)).plus(_tokenPairAmount).toString());
        appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).pairTokenOfSmartWallet = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).pairTokenOfSmartWallet).plus(_tokenPairAmount));
        appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Hold = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Hold).plus(_token0Amount));
        appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Hold = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token1Hold).plus(_token1Amount));
        appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl)
            .plus(sumToken0And1));
        appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken = Number((0, bignumber_js_1.default)(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken).plus(_tokenPairAmount));
        return appState;
    });
}
exports.simulateAddliquidity = simulateAddliquidity;
function simulateRemoveliquidity(appState1, _token0, _token1, _tokenPair, _tokenPairAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        let token0 = _token0.toLowerCase();
        let token1 = _token1.toLowerCase();
        let tokenPair = _tokenPair.toLowerCase();
        let appState = Object.assign({}, appState1);
        if (!appState.pancakeSwapV2Pair.isFetch) {
            appState = yield (0, UpdateStateAccount_2.updatePancakeSwapV2)(appState);
        }
        if (!appState.smartWalletState.tokenBalances.has(token0)) {
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, token0);
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, token0);
        }
        if (!appState.smartWalletState.tokenBalances.has(token1)) {
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, token1);
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, token1);
        }
        if (!appState.smartWalletState.tokenBalances.has(tokenPair)) {
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, tokenPair);
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, tokenPair);
        }
        if (!appState.smartWalletState.tokenBalances.get(token0)) {
            throw new Error("token0 not found in smart wallet");
        }
        let token0Balance = appState.smartWalletState.tokenBalances.get(token0);
        if (!appState.smartWalletState.tokenBalances.get(token1)) {
            throw new Error("token1 not found in smart wallet");
        }
        let token1Balance = appState.smartWalletState.tokenBalances.get(token1);
        let tokenPairAmount = (0, bignumber_js_1.default)(_tokenPairAmount);
        let token0Amount = (0, bignumber_js_1.default)(tokenPairAmount)
            .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).totalSupplyPairToken)
            .multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).tvl)
            .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Price)
            .multipliedBy(Math.pow(10, Number(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair).token0Decimals)))
            .dividedBy(2);
        // console.log(tokenPairAmount.toString());
        // console.log(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.pairTokenOfSmartWallet);
        // console.log(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.totalSupplyPairToken);
        // console.log(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.tvl);
        // console.log(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token0Price);
        let token1Amount = (0, bignumber_js_1.default)(tokenPairAmount)
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
        return appState;
    });
}
exports.simulateRemoveliquidity = simulateRemoveliquidity;
