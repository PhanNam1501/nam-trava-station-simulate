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
exports.SimulationJoinLiquidity = SimulationJoinLiquidity;
exports.SimulationWithdrawLiquidity = SimulationWithdrawLiquidity;
exports.SimulationClaimRewardLiquidity = SimulationClaimRewardLiquidity;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const UpdateStateAccount_1 = require("./UpdateStateAccount");
const basic_1 = require("../basic");
const helper_1 = require("../../utils/helper");
const utils_1 = require("../../utils");
function SimulationJoinLiquidity(_appState, _liquidity, _from, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState);
        try {
            let liquidity = _liquidity.toLowerCase();
            let from = _from;
            let amount = (0, bignumber_js_1.default)(_amount);
            if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateLiquidityCampainState)(appState);
            }
            let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
            if (liquidityCampain == undefined) {
                throw new Error("Liquidity not found");
            }
            const modeFrom = (0, helper_1.getMode)(appState, from);
            if (appState[modeFrom].tokenBalances.has(liquidityCampain.underlyingToken.underlyingAddress) == false) {
                appState = yield (0, basic_1.updateTokenBalance)(appState, from, liquidityCampain.underlyingToken.underlyingAddress);
            }
            let oldBalance = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase()));
            let maxAmountDeposit = (0, bignumber_js_1.default)(liquidityCampain.maxTotalDeposit).minus(liquidityCampain.deposited);
            if (amount.toFixed(0) == utils_1.MAX_UINT256 || amount.isEqualTo(utils_1.MAX_UINT256)) {
                if (oldBalance.isGreaterThan(maxAmountDeposit)) {
                    amount = (0, bignumber_js_1.default)(maxAmountDeposit);
                }
                else {
                    amount = (0, bignumber_js_1.default)(oldBalance);
                }
            }
            let newTotalSupply = (0, bignumber_js_1.default)(liquidityCampain.deposited).plus(amount);
            let newLiquidityCampain = liquidityCampain;
            newLiquidityCampain.deposited = newTotalSupply.toFixed();
            let newTVL = ((0, bignumber_js_1.default)(liquidityCampain.TVL).div(liquidityCampain.underlyingToken.price).multipliedBy((0, bignumber_js_1.default)(10).pow(liquidityCampain.underlyingToken.reserveDecimals).plus(amount)).multipliedBy(liquidityCampain.underlyingToken.price).div((0, bignumber_js_1.default)(10).pow(liquidityCampain.underlyingToken.reserveDecimals)));
            newLiquidityCampain.TVL = newTVL.toFixed();
            appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(liquidity, newLiquidityCampain);
            appState[modeFrom].tokenBalances.set(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase(), oldBalance.minus(amount).toFixed());
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
function SimulationWithdrawLiquidity(_appState, _liquidity, _to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState);
        try {
            let liquidity = _liquidity.toLowerCase();
            let to = _to;
            let amount = (0, bignumber_js_1.default)(_amount);
            if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateLiquidityCampainState)(appState);
            }
            let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
            if (liquidityCampain == undefined) {
                throw new Error("Liquidity not found");
            }
            let lockTime = Number(liquidityCampain.lockTime);
            let now = new Date().getTime();
            if (now < lockTime) {
                throw new Error("Liquidity Campain can not withdraw now");
            }
            const modeTo = (0, helper_1.getMode)(appState, to);
            if (appState[modeTo].tokenBalances.has(liquidityCampain.underlyingToken.underlyingAddress) == false) {
                appState = yield (0, basic_1.updateTokenBalance)(appState, to, liquidityCampain.underlyingToken.underlyingAddress);
            }
            let oldBalance = (0, bignumber_js_1.default)(appState[modeTo].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase()));
            // console.log(oldBalance.toFixed());
            if (amount.toFixed(0) == utils_1.MAX_UINT256 || amount.isEqualTo(utils_1.MAX_UINT256)) {
                amount = (0, bignumber_js_1.default)(liquidityCampain.deposited);
            }
            let newTotalSupply = (0, bignumber_js_1.default)(liquidityCampain.deposited).minus(amount);
            let newLiquidityCampain = liquidityCampain;
            newLiquidityCampain.deposited = newTotalSupply.toFixed();
            let newTVL = ((0, bignumber_js_1.default)(liquidityCampain.TVL).div(liquidityCampain.underlyingToken.price).multipliedBy((0, bignumber_js_1.default)(10).pow(liquidityCampain.underlyingToken.reserveDecimals)).minus(amount)).multipliedBy(liquidityCampain.underlyingToken.price).div((0, bignumber_js_1.default)(10).pow(liquidityCampain.underlyingToken.reserveDecimals));
            newLiquidityCampain.TVL = newTVL.toFixed();
            appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(liquidity, newLiquidityCampain);
            appState[modeTo].tokenBalances.set(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase(), oldBalance.plus(amount).toFixed());
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
function SimulationClaimRewardLiquidity(_appState, _liquidity, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState);
        try {
            let liquidity = _liquidity.toLowerCase();
            let to = _to;
            if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateLiquidityCampainState)(appState);
            }
            let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
            if (liquidityCampain == undefined) {
                throw new Error("Liquidity not found");
            }
            const modeTo = (0, helper_1.getMode)(appState, to);
            if (appState[modeTo].tokenBalances.has(liquidityCampain.rewardToken.address) == false) {
                appState = yield (0, basic_1.updateTokenBalance)(appState, to, liquidityCampain.rewardToken.address);
            }
            let oldBalance = (0, bignumber_js_1.default)(appState[modeTo].tokenBalances.get(liquidityCampain.rewardToken.address.toLowerCase()));
            let amount = (0, bignumber_js_1.default)(liquidityCampain.claimableReward);
            let newClaimableReward = (0, bignumber_js_1.default)(liquidityCampain.claimableReward).minus(amount);
            let newLiquidityCampain = liquidityCampain;
            newLiquidityCampain.claimableReward = newClaimableReward.toFixed();
            appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(liquidity, newLiquidityCampain);
            appState[modeTo].tokenBalances.set(liquidityCampain.rewardToken.address.toLowerCase(), oldBalance.plus(amount).toFixed());
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
