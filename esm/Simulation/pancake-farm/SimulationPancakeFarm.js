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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPancakeFarmAPR = getPancakeFarmAPR;
exports.getMaxPancakeFarmUnstakeAmount = getMaxPancakeFarmUnstakeAmount;
exports.getPancakeFarmReward = getPancakeFarmReward;
exports.simulatePancakeFarmStakeLP = simulatePancakeFarmStakeLP;
exports.simulatePancakeFarmUnStakeLP = simulatePancakeFarmUnStakeLP;
exports.simulatePancakeFarmHarvestLP = simulatePancakeFarmHarvestLP;
const bignumber_js_1 = require("bignumber.js");
const config_1 = require("../../utils/config");
const UpdateStateAccount_1 = require("../basic/UpdateStateAccount");
const helper_1 = require("../../utils/helper");
const UpdateStateAccount_2 = require("./UpdateStateAccount");
function getPancakeFarmAPR(appState, _v2Wrapper) {
    return __awaiter(this, void 0, void 0, function* () {
        const v2Wrapper = _v2Wrapper.toLowerCase();
        appState = yield (0, UpdateStateAccount_2.updatePancakeFarmState)(appState, appState.smartWalletState.address, false);
        const pancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper);
        const rewardPrice = appState.tokenPrice.get(pancakeFarmState.rewardToken.address);
        const stakedTokenPrice = appState.tokenPrice.get(pancakeFarmState.stakedToken.address);
        const rewardPerYearUSD = rewardPrice ? (0, bignumber_js_1.BigNumber)(pancakeFarmState.rewardPerSecond).multipliedBy(config_1.YEAR_TO_SECONDS).multipliedBy(rewardPrice).div((0, bignumber_js_1.BigNumber)(10).pow(pancakeFarmState.rewardToken.decimals)) : (0, bignumber_js_1.BigNumber)(0);
        const tvlUSD = stakedTokenPrice ? (0, bignumber_js_1.BigNumber)(pancakeFarmState.totalStakeAmount).multipliedBy(stakedTokenPrice).div((0, bignumber_js_1.BigNumber)(10).pow(pancakeFarmState.stakedToken.decimals)) : (0, bignumber_js_1.BigNumber)(0);
        return tvlUSD.isZero() ? "0" : rewardPerYearUSD.div(tvlUSD).toFixed();
    });
}
function getMaxPancakeFarmUnstakeAmount(appState, _v2Wrapper) {
    return __awaiter(this, void 0, void 0, function* () {
        const v2Wrapper = _v2Wrapper.toLowerCase();
        appState = yield (0, UpdateStateAccount_2.updatePancakeFarmState)(appState, appState.smartWalletState.address, false);
        const pancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper);
        return pancakeFarmState.stakedAmount;
    });
}
function getPancakeFarmReward(appState, _v2Wrapper) {
    return __awaiter(this, void 0, void 0, function* () {
        const v2Wrapper = _v2Wrapper.toLowerCase();
        appState = yield (0, UpdateStateAccount_2.updatePancakeFarmState)(appState, appState.smartWalletState.address, false);
        const pancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper);
        return pancakeFarmState.pendingReward;
    });
}
function simulatePancakeFarmStakeLP(appState, _v2Wrapper, from, _amount, noHarvest) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const v2Wrapper = _v2Wrapper.toLowerCase();
            let mode = (0, helper_1.getMode)(appState, from);
            appState = yield (0, UpdateStateAccount_2.updatePancakeFarmState)(appState, appState.smartWalletState.address, false);
            const userPancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper);
            const pancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper);
            const stakedTokenAddr = pancakeFarmState.stakedToken.address.toLowerCase();
            const rewardTokenAddr = pancakeFarmState.rewardToken.address.toLowerCase();
            appState = yield (0, UpdateStateAccount_1.updateTokenBalance)(appState, from, stakedTokenAddr);
            appState = yield (0, UpdateStateAccount_1.updateTokenBalance)(appState, appState.smartWalletState.address, rewardTokenAddr);
            let oldTokenBalances = appState[mode].tokenBalances.get(stakedTokenAddr);
            // Create a copy of the appState to avoid mutating the original state
            let newState = Object.assign({}, appState);
            let amount = (0, bignumber_js_1.BigNumber)(_amount);
            if ((0, bignumber_js_1.BigNumber)(amount).toFixed(0) == config_1.MAX_UINT256 || (0, bignumber_js_1.BigNumber)(amount).isEqualTo(config_1.MAX_UINT256)) {
                amount = (0, bignumber_js_1.BigNumber)(oldTokenBalances);
            }
            const stakedAmountBefore = userPancakeFarmState.stakedAmount;
            const stakedAmountAfter = (0, bignumber_js_1.BigNumber)(stakedAmountBefore).plus(amount);
            const rewardBefore = userPancakeFarmState.pendingReward;
            const rewardAfter = noHarvest ? rewardBefore : "0";
            const newUserPancakeFarmStateChange = {
                stakedAmount: stakedAmountAfter.toFixed(),
                pendingReward: rewardAfter,
            };
            let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).minus(amount);
            let oldRewardsTokenBalances = newState.smartWalletState.tokenBalances.get(rewardTokenAddr);
            let newRewardTokenBalance = noHarvest ? (0, bignumber_js_1.BigNumber)(oldRewardsTokenBalances) : (0, bignumber_js_1.BigNumber)(oldRewardsTokenBalances).plus(rewardBefore);
            const newPancakeFarmStateChange = Object.assign(Object.assign({}, pancakeFarmState), { totalStakeAmount: (0, bignumber_js_1.BigNumber)(pancakeFarmState.totalStakeAmount).plus(amount).toFixed(0) });
            newState.smartWalletState.pancakeFarmState.userPancakeFarmState.set(v2Wrapper, newUserPancakeFarmStateChange);
            newState.PancakeFarmState.PancakeFarmState.set(v2Wrapper, newPancakeFarmStateChange);
            newState[mode].tokenBalances.set(stakedTokenAddr, newTokenBalance.toFixed());
            newState.smartWalletState.tokenBalances.set(rewardTokenAddr, newRewardTokenBalance.toFixed());
            return newState;
        }
        catch (err) {
            throw err;
        }
    });
}
function simulatePancakeFarmUnStakeLP(appState, _v2Wrapper, _amount, to, noHarvest) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const v2Wrapper = _v2Wrapper.toLowerCase();
            appState = yield (0, UpdateStateAccount_2.updatePancakeFarmState)(appState, appState.smartWalletState.address, false);
            const userPancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper);
            const pancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper);
            const stakedTokenAddr = pancakeFarmState.stakedToken.address.toLowerCase();
            const rewardTokenAddr = pancakeFarmState.rewardToken.address.toLowerCase();
            appState = yield (0, UpdateStateAccount_1.updateTokenBalance)(appState, to, stakedTokenAddr);
            appState = yield (0, UpdateStateAccount_1.updateTokenBalance)(appState, to, rewardTokenAddr);
            let newState = Object.assign({}, appState);
            let mode = (0, helper_1.getMode)(appState, to);
            let oldTokenBalances = appState[mode].tokenBalances.get(stakedTokenAddr);
            let amount = (0, bignumber_js_1.BigNumber)(_amount);
            const stakedAmountBefore = userPancakeFarmState.stakedAmount;
            if ((0, bignumber_js_1.BigNumber)(amount).toFixed(0) == config_1.MAX_UINT256 || (0, bignumber_js_1.BigNumber)(amount).isEqualTo(config_1.MAX_UINT256)) {
                amount = (0, bignumber_js_1.BigNumber)(stakedAmountBefore);
            }
            const stakedAmountAfter = (0, bignumber_js_1.BigNumber)(stakedAmountBefore).minus(amount);
            const rewardBefore = userPancakeFarmState.pendingReward;
            const rewardAfter = noHarvest ? rewardBefore : "0";
            const newUserPancakeFarmStateChange = {
                stakedAmount: stakedAmountAfter.toFixed(),
                pendingReward: rewardAfter,
            };
            let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).plus(amount);
            let oldRewardsTokenBalances = newState[mode].tokenBalances.get(rewardTokenAddr);
            let newRewardTokenBalance = noHarvest ? (0, bignumber_js_1.BigNumber)(oldRewardsTokenBalances) : (0, bignumber_js_1.BigNumber)(oldRewardsTokenBalances).plus(rewardBefore);
            const newPancakeFarmStateChange = Object.assign(Object.assign({}, pancakeFarmState), { totalStakeAmount: (0, bignumber_js_1.BigNumber)(pancakeFarmState.totalStakeAmount).minus(amount).toFixed(0) });
            newState.smartWalletState.pancakeFarmState.userPancakeFarmState.set(v2Wrapper, newUserPancakeFarmStateChange);
            newState.PancakeFarmState.PancakeFarmState.set(v2Wrapper, newPancakeFarmStateChange);
            newState[mode].tokenBalances.set(stakedTokenAddr, newTokenBalance.toFixed());
            newState[mode].tokenBalances.set(rewardTokenAddr, newRewardTokenBalance.toFixed());
            return newState;
        }
        catch (err) {
            throw err;
        }
    });
}
function simulatePancakeFarmHarvestLP(appState, _v2Wrapper, to, noHarvest) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const v2Wrapper = _v2Wrapper.toLowerCase();
            appState = yield (0, UpdateStateAccount_2.updatePancakeFarmState)(appState, appState.smartWalletState.address, false);
            const pancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper);
            const userPancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper);
            const rewardTokenAddr = pancakeFarmState.rewardToken.address.toLowerCase();
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, rewardTokenAddr);
            let mode = (0, helper_1.getMode)(appState, to);
            // Create a copy of the appState to avoid mutating the original state
            let newState = Object.assign({}, appState);
            let amount = (0, bignumber_js_1.BigNumber)(0);
            const stakedAmountBefore = userPancakeFarmState.stakedAmount;
            const stakedAmountAfter = (0, bignumber_js_1.BigNumber)(stakedAmountBefore).plus(amount);
            const rewardBefore = userPancakeFarmState.pendingReward;
            const rewardAfter = noHarvest ? rewardBefore : "0";
            const newUserPancakeFarmStateChange = {
                stakedAmount: stakedAmountAfter.toFixed(),
                pendingReward: rewardAfter,
            };
            let oldRewardsTokenBalances = newState.smartWalletState.tokenBalances.get(rewardTokenAddr);
            let newRewardTokenBalance = noHarvest ? (0, bignumber_js_1.BigNumber)(oldRewardsTokenBalances) : (0, bignumber_js_1.BigNumber)(oldRewardsTokenBalances).plus(rewardBefore);
            newState.smartWalletState.pancakeFarmState.userPancakeFarmState.set(v2Wrapper, newUserPancakeFarmStateChange);
            newState[mode].tokenBalances.set(rewardTokenAddr, newRewardTokenBalance.toFixed());
            return newState;
        }
        catch (err) {
            throw err;
        }
    });
}
