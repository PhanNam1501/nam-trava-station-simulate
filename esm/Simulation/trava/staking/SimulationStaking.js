var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { updateSmartWalletTokenBalance, updateTokenBalance, updateUserTokenBalance } from "../../basic/UpdateStateAccount";
import { MAX_UINT256 } from "../../../utils/config";
import BigNumber from "bignumber.js";
import { updateAllAccountVault } from "./UpdateStateAccount";
import { getMode, isWallet } from "../../../utils/helper";
export function calculateNewAPR(oldAPR, oldTVL, newTVL) {
    if (newTVL == "0") {
        return "0";
    }
    return BigNumber(oldAPR).multipliedBy(oldTVL).div(newTVL).toFixed();
}
export function simulateStakeStaking(appState1, _stakingPool, from, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        let stakingPool = _stakingPool.toLowerCase();
        let amount = BigNumber(_amount);
        let stakedTokenAddress = stakingPool;
        let vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);
        if (vault && vault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            let underlyingToken = vault.underlyingToken.underlyingAddress.toLowerCase();
            if (!appState.smartWalletState.tokenBalances.has(stakedTokenAddress.toLowerCase())) {
                appState = yield updateSmartWalletTokenBalance(appState, stakedTokenAddress);
            }
            if (from == appState.walletState.address) {
                if (!appState.walletState.tokenBalances.has(underlyingToken)) {
                    appState = yield updateUserTokenBalance(appState, underlyingToken);
                    appState = yield updateSmartWalletTokenBalance(appState, underlyingToken);
                }
                if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                    amount = BigNumber(appState.walletState.tokenBalances.get(underlyingToken));
                }
                const newUnderLyingBalance = BigNumber(appState.walletState.tokenBalances.get(underlyingToken)).minus(amount);
                appState.walletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
            }
            else if (from == appState.smartWalletState.address) {
                if (!appState.smartWalletState.tokenBalances.has(underlyingToken)) {
                    appState = yield updateUserTokenBalance(appState, underlyingToken);
                    appState = yield updateSmartWalletTokenBalance(appState, underlyingToken);
                }
                if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                    amount = BigNumber(appState.smartWalletState.tokenBalances.get(underlyingToken));
                }
                const newUnderLyingBalance = BigNumber(appState.smartWalletState.tokenBalances.get(underlyingToken)).minus(amount);
                appState.smartWalletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
            }
            const newRewardBalance = BigNumber(appState.smartWalletState.tokenBalances.get(stakedTokenAddress.toLowerCase())).plus(amount);
            let amountUSD = amount.div(vault.underlyingToken.reserveDecimals).multipliedBy(vault.underlyingToken.price);
            let oldTVL = vault.TVL;
            let newTVL = BigNumber(oldTVL).plus(amountUSD).toFixed();
            let oldAPR = vault.APR;
            vault.deposited = BigNumber(vault.deposited).plus(amount).toFixed(0);
            vault.TVL = newTVL;
            vault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);
            appState.smartWalletState.travaLPStakingStateList.set(stakingPool, vault);
            appState.smartWalletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
            //update the wallet vault
            if (appState.walletState.travaLPStakingStateList.size == 0) {
                appState = yield updateAllAccountVault(appState, appState.walletState.address);
            }
            let walletVault = appState.walletState.travaLPStakingStateList.get(stakingPool);
            walletVault.TVL = newTVL;
            walletVault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);
            appState.walletState.travaLPStakingStateList.set(stakingPool, walletVault);
        }
        return appState;
    });
}
export function simulateStakingRedeem(appState1, _stakingPool, to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        let stakingPool = _stakingPool.toLowerCase();
        let amount = BigNumber(_amount);
        let stakedTokenAddress = stakingPool.toLowerCase();
        let vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);
        if (vault && vault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            let underlyingToken = vault.underlyingToken.underlyingAddress.toLowerCase();
            if (!appState.smartWalletState.tokenBalances.has(stakedTokenAddress)) {
                appState = yield updateSmartWalletTokenBalance(appState, stakedTokenAddress);
            }
            if (!appState.walletState.tokenBalances.has(underlyingToken)) {
                appState = yield updateUserTokenBalance(appState, underlyingToken);
                appState = yield updateSmartWalletTokenBalance(appState, underlyingToken);
            }
            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = BigNumber(vault.deposited);
            }
            if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                to = appState.walletState.address;
                const newUnderLyingBalance = BigNumber(appState.walletState.tokenBalances.get(underlyingToken)).plus(amount);
                appState.walletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
            }
            else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                to = appState.smartWalletState.address;
                const newUnderLyingBalance = BigNumber(appState.smartWalletState.tokenBalances.get(underlyingToken)).plus(amount);
                appState.smartWalletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
            }
            const newRewardBalance = BigNumber(appState.smartWalletState.tokenBalances.get(stakedTokenAddress)).minus(amount);
            let amountUSD = amount.div(vault.underlyingToken.reserveDecimals).multipliedBy(vault.underlyingToken.price);
            let oldTVL = vault.TVL;
            let newTVL = BigNumber(oldTVL).minus(amountUSD).toFixed();
            let oldAPR = vault.APR;
            vault.deposited = BigNumber(vault.deposited).minus(amount).toFixed(0);
            vault.TVL = newTVL;
            vault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);
            appState.smartWalletState.travaLPStakingStateList.set(stakingPool, vault);
            appState.smartWalletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
            //update wallet vault
            if (appState.walletState.travaLPStakingStateList.size == 0) {
                appState = yield updateAllAccountVault(appState, appState.walletState.address);
            }
            let walletVault = appState.walletState.travaLPStakingStateList.get(stakingPool);
            walletVault.TVL = newTVL;
            walletVault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);
            appState.walletState.travaLPStakingStateList.set(stakingPool, walletVault);
        }
        return appState;
    });
}
export function simulateTransferStakedToken(appState1, _stakingPool, from, to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        let stakingPool = _stakingPool.toLowerCase();
        let amount = BigNumber(_amount);
        let stakedTokenAddress = stakingPool.toLowerCase();
        let vaultFrom;
        let modeFrom = getMode(appState, from);
        if (appState[modeFrom].travaLPStakingStateList.size == 0) {
            appState = yield updateAllAccountVault(appState, from);
        }
        vaultFrom = appState[modeFrom].travaLPStakingStateList.get(stakingPool);
        if (vaultFrom.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            if (!appState[modeFrom].tokenBalances.has(stakedTokenAddress)) {
                appState = yield updateTokenBalance(appState, appState[modeFrom].address, stakedTokenAddress);
            }
            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = BigNumber(vaultFrom.deposited);
            }
            const newRewardBalance = BigNumber(appState[modeFrom].tokenBalances.get(stakedTokenAddress)).minus(amount);
            appState[modeFrom].tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
            //handle with a case that to equal wallet state
            if (isWallet(appState, to)) {
                let modeTo = getMode(appState, to);
                if (!appState[modeTo].tokenBalances.has(stakedTokenAddress)) {
                    appState = yield updateTokenBalance(appState, appState[modeTo].address, stakedTokenAddress);
                }
                const newRewardBalance = BigNumber(appState[modeTo].tokenBalances.get(stakedTokenAddress)).plus(amount);
                appState[modeTo].tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
                if (appState[modeTo].travaLPStakingStateList.size == 0) {
                    appState = yield updateAllAccountVault(appState, to);
                }
                let vaultTo = appState[modeTo].travaLPStakingStateList.get(stakingPool);
                vaultTo.deposited = BigNumber(vaultTo.deposited).plus(amount).toFixed(0);
                appState[modeTo].travaLPStakingStateList.set(stakingPool, vaultTo);
            }
            vaultFrom.deposited = BigNumber(vaultFrom.deposited).minus(amount).toFixed(0);
            appState[modeFrom].travaLPStakingStateList.set(stakingPool, vaultFrom);
        }
        return appState;
    });
}
export function simulateStakingClaimRewards(appState1, _stakingPool, _to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        /// ???
        let appState = Object.assign({}, appState1);
        let stakingPool = _stakingPool.toLowerCase();
        let amount = BigNumber(_amount);
        let stakedTokenAddress = stakingPool.toLowerCase();
        let vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);
        if (vault && vault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            let rewardTokenAddress = vault.rewardToken.address.toLowerCase();
            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = BigNumber(vault.claimableReward);
            }
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                if (!appState.walletState.tokenBalances.has(rewardTokenAddress)) {
                    appState = yield updateUserTokenBalance(appState, rewardTokenAddress);
                }
                appState.walletState.tokenBalances.set(rewardTokenAddress, BigNumber(appState.walletState.tokenBalances.get(rewardTokenAddress)).plus(amount).toFixed(0));
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                if (!appState.smartWalletState.tokenBalances.has(rewardTokenAddress)) {
                    appState = yield updateUserTokenBalance(appState, rewardTokenAddress);
                }
                appState.smartWalletState.tokenBalances.set(rewardTokenAddress, BigNumber(appState.smartWalletState.tokenBalances.get(rewardTokenAddress)).plus(amount).toFixed(0));
            }
            vault.claimableReward = BigNumber(vault.claimableReward).minus(amount).toFixed(0);
            appState.smartWalletState.travaLPStakingStateList.set(stakingPool, vault);
        }
        return appState;
    });
}
