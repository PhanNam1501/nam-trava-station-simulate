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
exports.simulateTravaGovernanceMerge = exports.simulateTravaGovernanceWithdraw = exports.simulateTravaGovernanceCompound = exports.simulateTravaGovernanceChangeUnlockTime = exports.simulateTravaGovernanceIncreaseBalance = exports.simulateTravaGovernanceCreateLock = exports.timeRemaining = exports.getPredictVotingPower = exports.getAmountInTrava = exports.calcVotingPower = exports.getTimeLeft = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const config_1 = require("../../../utils/config");
const UpdateStateAccount_1 = require("../../basic/UpdateStateAccount");
const config_2 = require("../../../utils/config");
const UpdateStateAccount_2 = require("./UpdateStateAccount");
const helper_1 = require("../../../utils/helper");
function getTimeLeft(time) {
    let timeEnd = new Date(Number(time) * 1000).getTime();
    let timeNow = new Date().getTime();
    return Math.max(timeEnd - timeNow, 0) / 1000;
}
exports.getTimeLeft = getTimeLeft;
function calcVotingPower(amount, timeRemaining, maxTime = config_1.MAX_LOCK_TIMES) {
    return (0, bignumber_js_1.default)(amount).times(timeRemaining).div(maxTime);
}
exports.calcVotingPower = calcVotingPower;
function getAmountInTrava(tokenBalance, increaseAmount, tokenRatio, claimedReward) {
    return (0, bignumber_js_1.default)(tokenBalance).plus(increaseAmount).times(tokenRatio).plus(claimedReward);
}
exports.getAmountInTrava = getAmountInTrava;
function getPredictVotingPower(tokenBalance, increaseAmount, tokenRatio, claimedReward, timeEnd) {
    let amountInTrava = getAmountInTrava(tokenBalance, increaseAmount, tokenRatio, claimedReward).toFixed(0);
    let timeLeft = getTimeLeft(timeEnd).toFixed(0);
    return calcVotingPower(amountInTrava, timeLeft);
}
exports.getPredictVotingPower = getPredictVotingPower;
// export function getPredictVotingPower1(veTrava: TokenInVeTrava, increaseAmount: uint256, timeEnd: uint256) {
//   let amountInTrava = getAmountInTrava(tokenBalance, increaseAmount, tokenRatio, claimedReward).toFixed(0);
//   let timeLeft = getTimeLeft(timeEnd).toFixed(0);
//   return calcVotingPower(amountInTrava, timeLeft);
// }
function timeRemaining(_timeLock) {
    const now = Math.floor(new Date().getTime() / 1000);
    if (_timeLock.isEqualTo(config_1.WEEK_TO_SECONDS)) {
        _timeLock = _timeLock.multipliedBy(2);
    }
    return (0, bignumber_js_1.default)((0, UpdateStateAccount_2.roundDown)(now + Number(_timeLock)) - now);
}
exports.timeRemaining = timeRemaining;
;
function simulateTravaGovernanceCreateLock(_appState1, _tokenAddress, _amount, _period, //second
_from, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState1);
        try {
            const tokenAddress = _tokenAddress.toLowerCase();
            let amount = (0, bignumber_js_1.default)(_amount);
            const from = _from;
            const period = _period;
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, UpdateStateAccount_2.updateTravaGovernanceState)(appState);
            }
            let mode = (0, helper_1.getMode)(appState, _from);
            if (!appState[mode].tokenBalances.has(tokenAddress)) {
                appState = yield (0, UpdateStateAccount_1.updateTokenBalance)(appState, _from, tokenAddress);
            }
            let travaBalance = (0, bignumber_js_1.default)(appState[mode].tokenBalances.get(tokenAddress));
            if (amount.isEqualTo(config_2.MAX_UINT256)) {
                amount = travaBalance;
            }
            appState[mode].tokenBalances.set(tokenAddress, travaBalance.minus(amount).toFixed(0));
            let remainingPeriod = (0, bignumber_js_1.default)(timeRemaining((0, bignumber_js_1.default)(period)));
            let votingPower = (amount.multipliedBy(remainingPeriod).dividedBy(config_1.YEAR_TO_SECONDS * 4)).integerValue();
            //init ID
            let newId = (0, bignumber_js_1.default)(appState.TravaGovernanceState.totalSupply).plus(1).toFixed(0);
            // init reward
            let rewardTokenBalance = {
                compoundAbleRewards: "0",
                compoundedRewards: "0",
                balances: "0"
            };
            // init token in governance
            let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress);
            let tokenInVeTrava = {
                balances: amount.toFixed(0),
                tokenLockOption: tokenLockOption
            };
            let veTravaState = {
                id: newId.toString(),
                votingPower: votingPower.toFixed(),
                tokenInVeTrava: tokenInVeTrava,
                unlockTime: ((0, bignumber_js_1.default)(period).plus(Math.floor(new Date().getTime() / 1000))).toString(),
                rewardTokenBalance: rewardTokenBalance,
            };
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase() || _to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                mode = (0, helper_1.getMode)(appState, _to);
                if (!appState[mode].veTravaListState.isFetch) {
                    appState = yield (0, UpdateStateAccount_2.updateUserLockBalance)(appState, appState[mode].address);
                }
                appState[mode].veTravaListState.veTravaList.set(newId.toString(), veTravaState);
            }
            appState.TravaGovernanceState.totalSupply = newId;
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
exports.simulateTravaGovernanceCreateLock = simulateTravaGovernanceCreateLock;
function simulateTravaGovernanceIncreaseBalance(appState1, _tokenId, _amount, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, UpdateStateAccount_2.updateTravaGovernanceState)(appState);
            }
            let mode = (0, helper_1.getMode)(appState, _from);
            if (!appState.smartWalletState.veTravaListState.isFetch) {
                yield (0, UpdateStateAccount_2.updateUserLockBalance)(appState, appState.smartWalletState.address);
            }
            if (!appState.smartWalletState.veTravaListState.veTravaList.has(_tokenId)) {
                throw new Error("Invalid owner of token id!");
            }
            let veTrava = appState.smartWalletState.veTravaListState.veTravaList.get(_tokenId);
            let tokenAddress = veTrava.tokenInVeTrava.tokenLockOption.address.toLowerCase();
            if (!appState[mode].tokenBalances.has(tokenAddress)) {
                appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, tokenAddress);
                appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, tokenAddress);
            }
            let tokenBalance = appState[mode].tokenBalances.get(tokenAddress);
            let amount = (0, bignumber_js_1.default)(_amount);
            if (amount.isEqualTo(config_2.MAX_UINT256)) {
                amount = (0, bignumber_js_1.default)(tokenBalance);
            }
            let remainBalance = (0, bignumber_js_1.default)(tokenBalance).minus(amount);
            let deposited = veTrava.tokenInVeTrava.balances;
            let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress);
            let newVotingPower = getPredictVotingPower(deposited, amount.toFixed(0), tokenLockOption.ratio, veTrava.rewardTokenBalance.compoundedRewards, veTrava.unlockTime);
            veTrava.tokenInVeTrava.balances = (0, bignumber_js_1.default)(deposited).plus(amount).toFixed(0);
            veTrava.votingPower = newVotingPower.toFixed(0);
            appState.smartWalletState.veTravaListState.veTravaList.set(_tokenId, veTrava);
            appState[mode].tokenBalances.set(tokenAddress, remainBalance.toFixed(0));
        }
        catch (err) {
            throw (err);
        }
        return appState;
    });
}
exports.simulateTravaGovernanceIncreaseBalance = simulateTravaGovernanceIncreaseBalance;
function simulateTravaGovernanceChangeUnlockTime(appState1, _tokenId, _unlockTime) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, UpdateStateAccount_2.updateTravaGovernanceState)(appState);
            }
            if (!appState.smartWalletState.veTravaListState.isFetch) {
                yield (0, UpdateStateAccount_2.updateUserLockBalance)(appState, appState.smartWalletState.address);
            }
            if (!appState.smartWalletState.veTravaListState.veTravaList.has(_tokenId)) {
                throw new Error("Invalid owner of token id!");
            }
            let veTrava = appState.smartWalletState.veTravaListState.veTravaList.get(_tokenId);
            let tokenAddress = veTrava.tokenInVeTrava.tokenLockOption.address.toLowerCase();
            let deposited = veTrava.tokenInVeTrava.balances;
            let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress);
            let newVotingPower = getPredictVotingPower(deposited, "0", tokenLockOption.ratio, veTrava.rewardTokenBalance.compoundedRewards, _unlockTime);
            veTrava.unlockTime = _unlockTime;
            veTrava.votingPower = newVotingPower.toFixed(0);
            appState.smartWalletState.veTravaListState.veTravaList.set(_tokenId, veTrava);
        }
        catch (err) {
            throw (err);
        }
        return appState;
    });
}
exports.simulateTravaGovernanceChangeUnlockTime = simulateTravaGovernanceChangeUnlockTime;
function simulateTravaGovernanceCompound(appState1, _tokenId) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, UpdateStateAccount_2.updateTravaGovernanceState)(appState);
            }
            if (!appState.smartWalletState.veTravaListState.isFetch) {
                yield (0, UpdateStateAccount_2.updateUserLockBalance)(appState, appState.smartWalletState.address);
            }
            if (!appState.smartWalletState.veTravaListState.veTravaList.has(_tokenId)) {
                throw new Error("Invalid owner of token id!");
            }
            let veTrava = appState.smartWalletState.veTravaListState.veTravaList.get(_tokenId);
            let tokenAddress = veTrava.tokenInVeTrava.tokenLockOption.address.toLowerCase();
            let deposited = veTrava.tokenInVeTrava.balances;
            let compoundAbleRewards = veTrava.rewardTokenBalance.compoundAbleRewards;
            let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress);
            let amount = (0, bignumber_js_1.default)(compoundAbleRewards).div(tokenLockOption.ratio);
            let newVotingPower = getPredictVotingPower(deposited, amount.toFixed(0), tokenLockOption.ratio, veTrava.rewardTokenBalance.compoundedRewards, veTrava.unlockTime);
            veTrava.tokenInVeTrava.balances = amount.plus(veTrava.tokenInVeTrava.balances).toFixed();
            veTrava.rewardTokenBalance.compoundAbleRewards = "0";
            veTrava.rewardTokenBalance.compoundedRewards = (0, bignumber_js_1.default)(veTrava.rewardTokenBalance.compoundedRewards).plus(compoundAbleRewards).toFixed(0);
            veTrava.votingPower = newVotingPower.toFixed(0);
            appState.smartWalletState.veTravaListState.veTravaList.set(_tokenId, veTrava);
        }
        catch (err) {
            throw (err);
        }
        return appState;
    });
}
exports.simulateTravaGovernanceCompound = simulateTravaGovernanceCompound;
function simulateTravaGovernanceWithdraw(appState1, _tokenId, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, UpdateStateAccount_2.updateTravaGovernanceState)(appState);
            }
            if (!appState.smartWalletState.veTravaListState.isFetch) {
                yield (0, UpdateStateAccount_2.updateUserLockBalance)(appState, appState.smartWalletState.address);
            }
            if (!appState.smartWalletState.veTravaListState.veTravaList.has(_tokenId)) {
                throw new Error("Invalid owner of token id!");
            }
            let veTrava = appState.smartWalletState.veTravaListState.veTravaList.get(_tokenId);
            let tokenAddress = veTrava.tokenInVeTrava.tokenLockOption.address.toLowerCase();
            let deposited = veTrava.tokenInVeTrava.balances;
            let rewarded = veTrava.rewardTokenBalance.compoundedRewards;
            let rewardTokenAddress = appState.TravaGovernanceState.rewardTokenInfo.address.toLowerCase();
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase() || _to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                let mode = (0, helper_1.getMode)(appState, _to);
                if (!appState[mode].tokenBalances.has(rewardTokenAddress)) {
                    appState = yield (0, UpdateStateAccount_1.updateTokenBalance)(appState, _to, rewardTokenAddress);
                }
                if (!appState[mode].tokenBalances.has(tokenAddress)) {
                    appState = yield (0, UpdateStateAccount_1.updateTokenBalance)(appState, _to, tokenAddress);
                }
                let tokenBalance = appState[mode].tokenBalances.get(tokenAddress);
                appState[mode].tokenBalances.set(tokenAddress, (0, bignumber_js_1.default)(tokenBalance).plus(deposited).toFixed(0));
                let rewardBalance = appState[mode].tokenBalances.get(rewardTokenAddress);
                appState[mode].tokenBalances.set(rewardTokenAddress, (0, bignumber_js_1.default)(rewardBalance).plus(rewarded).toFixed(0));
            }
            appState.smartWalletState.veTravaListState.veTravaList.delete(_tokenId);
        }
        catch (err) {
            throw (err);
        }
        return appState;
    });
}
exports.simulateTravaGovernanceWithdraw = simulateTravaGovernanceWithdraw;
function simulateTravaGovernanceMerge(appState1, _tokenId1, _tokenId2, _from, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, UpdateStateAccount_2.updateTravaGovernanceState)(appState);
            }
            let mode = (0, helper_1.getMode)(appState, _from);
            if (!appState[mode].veTravaListState.isFetch) {
                yield (0, UpdateStateAccount_2.updateUserLockBalance)(appState, appState[mode].address);
            }
            if (!appState[mode].veTravaListState.veTravaList.has(_tokenId1) || !appState[mode].veTravaListState.veTravaList.has(_tokenId2)) {
                throw new Error("Invalid owner of token id!");
            }
            let veTrava1 = appState[mode].veTravaListState.veTravaList.get(_tokenId1);
            let tokenAddress1 = veTrava1.tokenInVeTrava.tokenLockOption.address.toLowerCase();
            let tokenLockOption1 = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress1);
            let deposited1 = veTrava1.tokenInVeTrava.balances;
            let compoundedRewards1 = veTrava1.rewardTokenBalance.compoundedRewards;
            let compoundAbleRewards1 = veTrava1.rewardTokenBalance.compoundAbleRewards;
            let balanceRewards1 = veTrava1.rewardTokenBalance.balances;
            let veTrava2 = appState[mode].veTravaListState.veTravaList.get(_tokenId2);
            let tokenAddress2 = veTrava2.tokenInVeTrava.tokenLockOption.address.toLowerCase();
            let tokenLockOption2 = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress2);
            let deposited2 = veTrava2.tokenInVeTrava.balances;
            let compoundAbleRewards2 = veTrava2.rewardTokenBalance.compoundAbleRewards;
            let compoundedRewards2 = veTrava2.rewardTokenBalance.compoundedRewards;
            let balanceRewards2 = veTrava2.rewardTokenBalance.balances;
            // let rewardTokenAddress = appState.TravaGovernanceState.rewardTokenInfo.address.toLowerCase();
            let maxUnlockTime = veTrava1.unlockTime;
            let newBalance = (0, bignumber_js_1.default)(deposited1).plus((0, bignumber_js_1.default)(deposited2).times(tokenLockOption2.ratio).div(tokenLockOption1.ratio));
            if ((0, bignumber_js_1.default)(maxUnlockTime).isLessThan(veTrava2.unlockTime)) {
                maxUnlockTime = veTrava2.unlockTime;
                newBalance = (0, bignumber_js_1.default)(deposited2).plus((0, bignumber_js_1.default)(deposited1).times(tokenLockOption1.ratio).div(tokenLockOption2.ratio));
            }
            let newVotingPower1 = getPredictVotingPower(deposited1, "0", tokenLockOption1.ratio, veTrava1.rewardTokenBalance.compoundedRewards, maxUnlockTime);
            let newVotingPower2 = getPredictVotingPower(deposited1, "0", tokenLockOption2.ratio, veTrava2.rewardTokenBalance.compoundedRewards, maxUnlockTime);
            veTrava2.rewardTokenBalance.compoundAbleRewards = (0, bignumber_js_1.default)(compoundAbleRewards2).plus(compoundAbleRewards1).toFixed(0);
            veTrava2.rewardTokenBalance.compoundedRewards = (0, bignumber_js_1.default)(compoundedRewards2).plus(compoundedRewards1).toFixed(0);
            veTrava2.rewardTokenBalance.balances = (0, bignumber_js_1.default)(balanceRewards2).plus(balanceRewards1).toFixed(0);
            veTrava2.tokenInVeTrava.balances = (0, bignumber_js_1.default)(deposited2).plus(deposited1).toFixed(0);
            veTrava2.unlockTime = maxUnlockTime;
            veTrava2.votingPower = (0, bignumber_js_1.default)(newVotingPower2).plus(newVotingPower1).toFixed(0);
            appState[mode].veTravaListState.veTravaList.delete(_tokenId1);
            appState[mode].veTravaListState.veTravaList.set(_tokenId2, veTrava2);
        }
        catch (err) {
            throw (err);
        }
        return appState;
    });
}
exports.simulateTravaGovernanceMerge = simulateTravaGovernanceMerge;
