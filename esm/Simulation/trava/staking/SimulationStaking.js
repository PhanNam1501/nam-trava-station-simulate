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
exports.calculateNewAPR = calculateNewAPR;
exports.simulateStakeStaking = simulateStakeStaking;
exports.simulateStakingRedeem = simulateStakingRedeem;
exports.simulateTransferStakedToken = simulateTransferStakedToken;
exports.simulateStakingClaimRewards = simulateStakingClaimRewards;
const UpdateStateAccount_1 = require("../../basic/UpdateStateAccount");
const config_1 = require("../../../utils/config");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const UpdateStateAccount_2 = require("./UpdateStateAccount");
const helper_1 = require("../../../utils/helper");
function calculateNewAPR(oldAPR, oldTVL, newTVL) {
    if (newTVL == "0") {
        return "0";
    }
    return (0, bignumber_js_1.default)(oldAPR).multipliedBy(oldTVL).div(newTVL).toFixed();
}
function simulateStakeStaking(appState1, _stakingPool, from, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        let stakingPool = _stakingPool.toLowerCase();
        let amount = (0, bignumber_js_1.default)(_amount);
        let stakedTokenAddress = stakingPool;
        let vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);
        if (vault && vault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            let underlyingToken = vault.underlyingToken.underlyingAddress.toLowerCase();
            if (!appState.smartWalletState.tokenBalances.has(stakedTokenAddress.toLowerCase())) {
                appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, stakedTokenAddress);
            }
            if (from == appState.walletState.address) {
                if (!appState.walletState.tokenBalances.has(underlyingToken)) {
                    appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, underlyingToken);
                    appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, underlyingToken);
                }
                if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                    amount = (0, bignumber_js_1.default)(appState.walletState.tokenBalances.get(underlyingToken));
                }
                const newUnderLyingBalance = (0, bignumber_js_1.default)(appState.walletState.tokenBalances.get(underlyingToken)).minus(amount);
                appState.walletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
            }
            else if (from == appState.smartWalletState.address) {
                if (!appState.smartWalletState.tokenBalances.has(underlyingToken)) {
                    appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, underlyingToken);
                    appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, underlyingToken);
                }
                if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                    amount = (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(underlyingToken));
                }
                const newUnderLyingBalance = (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(underlyingToken)).minus(amount);
                appState.smartWalletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
            }
            const newRewardBalance = (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(stakedTokenAddress.toLowerCase())).plus(amount);
            let amountUSD = amount.div(vault.underlyingToken.reserveDecimals).multipliedBy(vault.underlyingToken.price);
            let oldTVL = vault.TVL;
            let newTVL = (0, bignumber_js_1.default)(oldTVL).plus(amountUSD).toFixed();
            let oldAPR = vault.APR;
            vault.deposited = (0, bignumber_js_1.default)(vault.deposited).plus(amount).toFixed(0);
            vault.TVL = newTVL;
            vault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);
            appState.smartWalletState.travaLPStakingStateList.set(stakingPool, vault);
            appState.smartWalletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
            //update the wallet vault
            if (appState.walletState.travaLPStakingStateList.size == 0) {
                appState = yield (0, UpdateStateAccount_2.updateAllAccountVault)(appState, appState.walletState.address);
            }
            let walletVault = appState.walletState.travaLPStakingStateList.get(stakingPool);
            walletVault.TVL = newTVL;
            walletVault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);
            appState.walletState.travaLPStakingStateList.set(stakingPool, walletVault);
        }
        return appState;
    });
}
function simulateStakingRedeem(appState1, _stakingPool, to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        let stakingPool = _stakingPool.toLowerCase();
        let amount = (0, bignumber_js_1.default)(_amount);
        let stakedTokenAddress = stakingPool.toLowerCase();
        let vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);
        if (vault && vault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            let underlyingToken = vault.underlyingToken.underlyingAddress.toLowerCase();
            if (!appState.smartWalletState.tokenBalances.has(stakedTokenAddress)) {
                appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, stakedTokenAddress);
            }
            if (!appState.walletState.tokenBalances.has(underlyingToken)) {
                appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, underlyingToken);
                appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, underlyingToken);
            }
            if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                amount = (0, bignumber_js_1.default)(vault.deposited);
            }
            if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                to = appState.walletState.address;
                const newUnderLyingBalance = (0, bignumber_js_1.default)(appState.walletState.tokenBalances.get(underlyingToken)).plus(amount);
                appState.walletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
            }
            else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                to = appState.smartWalletState.address;
                const newUnderLyingBalance = (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(underlyingToken)).plus(amount);
                appState.smartWalletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
            }
            const newRewardBalance = (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(stakedTokenAddress)).minus(amount);
            let amountUSD = amount.div(vault.underlyingToken.reserveDecimals).multipliedBy(vault.underlyingToken.price);
            let oldTVL = vault.TVL;
            let newTVL = (0, bignumber_js_1.default)(oldTVL).minus(amountUSD).toFixed();
            let oldAPR = vault.APR;
            vault.deposited = (0, bignumber_js_1.default)(vault.deposited).minus(amount).toFixed(0);
            vault.TVL = newTVL;
            vault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);
            appState.smartWalletState.travaLPStakingStateList.set(stakingPool, vault);
            appState.smartWalletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
            //update wallet vault
            if (appState.walletState.travaLPStakingStateList.size == 0) {
                appState = yield (0, UpdateStateAccount_2.updateAllAccountVault)(appState, appState.walletState.address);
            }
            let walletVault = appState.walletState.travaLPStakingStateList.get(stakingPool);
            walletVault.TVL = newTVL;
            walletVault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);
            appState.walletState.travaLPStakingStateList.set(stakingPool, walletVault);
        }
        return appState;
    });
}
function simulateTransferStakedToken(appState1, _stakingPool, from, to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        let stakingPool = _stakingPool.toLowerCase();
        let amount = (0, bignumber_js_1.default)(_amount);
        let stakedTokenAddress = stakingPool.toLowerCase();
        let vaultFrom;
        let modeFrom = (0, helper_1.getMode)(appState, from);
        if (appState[modeFrom].travaLPStakingStateList.size == 0) {
            appState = yield (0, UpdateStateAccount_2.updateAllAccountVault)(appState, from);
        }
        vaultFrom = appState[modeFrom].travaLPStakingStateList.get(stakingPool);
        if (vaultFrom.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            if (!appState[modeFrom].tokenBalances.has(stakedTokenAddress)) {
                appState = yield (0, UpdateStateAccount_1.updateTokenBalance)(appState, appState[modeFrom].address, stakedTokenAddress);
            }
            if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                amount = (0, bignumber_js_1.default)(vaultFrom.deposited);
            }
            const newRewardBalance = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(stakedTokenAddress)).minus(amount);
            appState[modeFrom].tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
            //handle with a case that to equal wallet state
            if ((0, helper_1.isWallet)(appState, to)) {
                let modeTo = (0, helper_1.getMode)(appState, to);
                if (!appState[modeTo].tokenBalances.has(stakedTokenAddress)) {
                    appState = yield (0, UpdateStateAccount_1.updateTokenBalance)(appState, appState[modeTo].address, stakedTokenAddress);
                }
                const newRewardBalance = (0, bignumber_js_1.default)(appState[modeTo].tokenBalances.get(stakedTokenAddress)).plus(amount);
                appState[modeTo].tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
                if (appState[modeTo].travaLPStakingStateList.size == 0) {
                    appState = yield (0, UpdateStateAccount_2.updateAllAccountVault)(appState, to);
                }
                let vaultTo = appState[modeTo].travaLPStakingStateList.get(stakingPool);
                vaultTo.deposited = (0, bignumber_js_1.default)(vaultTo.deposited).plus(amount).toFixed(0);
                appState[modeTo].travaLPStakingStateList.set(stakingPool, vaultTo);
            }
            vaultFrom.deposited = (0, bignumber_js_1.default)(vaultFrom.deposited).minus(amount).toFixed(0);
            appState[modeFrom].travaLPStakingStateList.set(stakingPool, vaultFrom);
        }
        return appState;
    });
}
function simulateStakingClaimRewards(appState1, _stakingPool, _to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        /// ???
        let appState = Object.assign({}, appState1);
        let stakingPool = _stakingPool.toLowerCase();
        let amount = (0, bignumber_js_1.default)(_amount);
        let stakedTokenAddress = stakingPool.toLowerCase();
        let vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);
        if (vault && vault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            let rewardTokenAddress = vault.rewardToken.address.toLowerCase();
            if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                amount = (0, bignumber_js_1.default)(vault.claimableReward);
            }
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                if (!appState.walletState.tokenBalances.has(rewardTokenAddress)) {
                    appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, rewardTokenAddress);
                }
                appState.walletState.tokenBalances.set(rewardTokenAddress, (0, bignumber_js_1.default)(appState.walletState.tokenBalances.get(rewardTokenAddress)).plus(amount).toFixed(0));
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                if (!appState.smartWalletState.tokenBalances.has(rewardTokenAddress)) {
                    appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, rewardTokenAddress);
                }
                appState.smartWalletState.tokenBalances.set(rewardTokenAddress, (0, bignumber_js_1.default)(appState.smartWalletState.tokenBalances.get(rewardTokenAddress)).plus(amount).toFixed(0));
            }
            vault.claimableReward = (0, bignumber_js_1.default)(vault.claimableReward).minus(amount).toFixed(0);
            appState.smartWalletState.travaLPStakingStateList.set(stakingPool, vault);
        }
        return appState;
    });
}
