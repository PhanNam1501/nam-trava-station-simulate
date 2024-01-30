import {ApplicationState} from "../../../State/ApplicationState";
import {EthAddress} from "../../../utils/types";
import {updateSmartWalletTokenBalance, updateUserTokenBalance} from "../../basic/UpdateStateAccount";
import {MAX_UINT256} from "../../../utils/config";
import BigNumber from "bignumber.js";
import {values} from "lodash";
import {updateAllAccountVault} from "./UpdateStateAccount";
import {getMode} from "../../../utils/helper";

export function calculateNewAPR(oldAPR: string, oldTVL: string, newTVL: string): string {
    if (newTVL == "0") {
        return "0";
    }
    return BigNumber(oldAPR).multipliedBy(oldTVL).div(newTVL).toFixed()
}

export async function simulateStakeStaking(appState1: ApplicationState, _stakingPool: EthAddress, from: EthAddress, _amount: number | string) {
    let appState = {...appState1};
    let stakingPool = _stakingPool.toLowerCase()
    let amount = BigNumber(_amount)
    let stakedTokenAddress = stakingPool

    let vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);

    if (vault && vault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
        let underlyingToken = vault.underlyingToken.underlyingAddress.toLowerCase();

        if (!appState.smartWalletState.tokenBalances.has(stakedTokenAddress.toLowerCase())) {
            appState = await updateSmartWalletTokenBalance(appState, stakedTokenAddress);
        }
        if (from == appState.walletState.address) {
            if (!appState.walletState.tokenBalances.has(underlyingToken)) {
                appState = await updateUserTokenBalance(appState, underlyingToken);
                appState = await updateSmartWalletTokenBalance(appState, underlyingToken);
            }

            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = BigNumber(appState.walletState.tokenBalances.get(underlyingToken)!);
            }
            const newUnderLyingBalance = BigNumber(appState.walletState.tokenBalances.get(underlyingToken)!).minus(amount)
            appState.walletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
        } else if (from == appState.smartWalletState.address) {
            if (!appState.smartWalletState.tokenBalances.has(underlyingToken)) {
                appState = await updateUserTokenBalance(appState, underlyingToken);
                appState = await updateSmartWalletTokenBalance(appState, underlyingToken);
            }

            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = BigNumber(appState.smartWalletState.tokenBalances.get(underlyingToken)!);
            }
            const newUnderLyingBalance = BigNumber(appState.smartWalletState.tokenBalances.get(underlyingToken)!).minus(amount)
            appState.smartWalletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
        }


        const newRewardBalance = BigNumber(appState.smartWalletState.tokenBalances.get(stakedTokenAddress.toLowerCase())!).plus(amount)

        let amountUSD = amount.div(vault.underlyingToken.reserveDecimals).multipliedBy(vault.underlyingToken.price)
        let oldTVL = vault.TVL
        let newTVL = BigNumber(oldTVL).plus(amountUSD).toFixed()
        let oldAPR = vault.APR

        vault.deposited = BigNumber(vault.deposited).plus(amount).toFixed(0)
        vault.TVL = newTVL;
        vault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);

        appState.smartWalletState.travaLPStakingStateList.set(
            stakingPool,
            vault
        )

        appState.smartWalletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
    }
    return appState;


}

export async function simulateStakingRedeem(appState1: ApplicationState, _stakingPool: EthAddress, to: EthAddress, _amount: number | string) {
    let appState = {...appState1};
    let stakingPool = _stakingPool.toLowerCase()
    let amount = BigNumber(_amount)
    let stakedTokenAddress = stakingPool.toLowerCase()

    let vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);

    if (vault && vault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
        let underlyingToken = vault.underlyingToken.underlyingAddress.toLowerCase();
        if (!appState.smartWalletState.tokenBalances.has(stakedTokenAddress)) {
            appState = await updateSmartWalletTokenBalance(appState, stakedTokenAddress);
        }

        if (!appState.walletState.tokenBalances.has(underlyingToken)) {
            appState = await updateUserTokenBalance(appState, underlyingToken);
            appState = await updateSmartWalletTokenBalance(appState, underlyingToken);
        }

        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = BigNumber(vault.deposited);
        }

        if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
            to = appState.walletState.address;
            const newUnderLyingBalance = BigNumber(appState.walletState.tokenBalances.get(underlyingToken)!).plus(amount)
            appState.walletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
        } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            to = appState.smartWalletState.address;
            const newUnderLyingBalance = BigNumber(appState.smartWalletState.tokenBalances.get(underlyingToken)!).plus(amount)
            appState.smartWalletState.tokenBalances.set(underlyingToken, newUnderLyingBalance.toFixed(0));
        }

        const newRewardBalance = BigNumber(appState.smartWalletState.tokenBalances.get(stakedTokenAddress)!).minus(amount)
        let amountUSD = amount.div(vault.underlyingToken.reserveDecimals).multipliedBy(vault.underlyingToken.price)
        let oldTVL = vault.TVL
        let newTVL = BigNumber(oldTVL).minus(amountUSD).toFixed()
        let oldAPR = vault.APR

        vault.deposited = BigNumber(vault.deposited).minus(amount).toFixed(0);
        vault.TVL = newTVL;
        vault.APR = calculateNewAPR(oldAPR, oldTVL, newTVL);

        appState.smartWalletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));
    }
    return appState;

}

export async function simulateTransfer(appState1: ApplicationState, _stakingPool: EthAddress, from: EthAddress,  to: EthAddress, _amount: number | string) {
    let appState = {...appState1};
    let stakingPool = _stakingPool.toLowerCase()
    let amount = BigNumber(_amount)
    let stakedTokenAddress = stakingPool.toLowerCase()
    let sendVault;
    let vaultWallet;
    let modeFrom = getMode(appState, from);
    if(appState[modeFrom].travaLPStakingStateList.size==0){
        appState = await updateAllAccountVault(appState,from);
    }
    sendVault= appState[modeFrom].travaLPStakingStateList.get(stakingPool)!;
    if (sendVault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
        let underLyingToken = sendVault.underlyingToken.underlyingAddress.toLowerCase();
        if (!appState[modeFrom].tokenBalances.has(underLyingToken)) {
            appState = await updateUserTokenBalance(appState,underLyingToken);
            appState = await updateSmartWalletTokenBalance(appState,underLyingToken);
        }

        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = BigNumber(sendVault.deposited);
        }


        const newRewardBalance = BigNumber(appState[modeFrom].tokenBalances.get(stakedTokenAddress)!).minus(amount);
        appState[modeFrom].tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));

        //handle with a case that to equal wallet state
        if (to == appState.walletState.address || to==appState.smartWalletState.address ) {
            let modeTo=getMode(appState, to);

            const newRewardBalance = BigNumber(appState[modeTo].tokenBalances.get(stakedTokenAddress)!).plus(amount);
            appState[modeTo].tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));

            if (appState[modeTo].travaLPStakingStateList.size==0){
                appState = await updateAllAccountVault(appState,to);
            }
            let toVault= appState[modeTo].travaLPStakingStateList.get(stakingPool)!;
            toVault.deposited = BigNumber(toVault.deposited).plus(amount).toFixed(0);
            appState.walletState.travaLPStakingStateList.set(
                stakingPool,
                toVault
            )
        }

        sendVault.deposited = BigNumber(sendVault.deposited).minus(amount).toFixed(0);

        appState[modeFrom].travaLPStakingStateList.set(
            stakingPool,
            sendVault
        )
    }



    return appState;


}

export async function simulateStakingClaimRewards(appState1: ApplicationState, _stakingPool: EthAddress, _to: EthAddress, _amount: number | string) {
    /// ???
    let appState = {...appState1};
    let stakingPool = _stakingPool.toLowerCase()
    let amount = BigNumber(_amount)
    let stakedTokenAddress = stakingPool.toLowerCase()

    let vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);

    if (vault && vault.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
        let rewardTokenAddress = vault.rewardToken.address.toLowerCase();

        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = BigNumber(vault.claimableReward);
        }

        if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
            if (!appState.walletState.tokenBalances.has(rewardTokenAddress)) {
                appState = await updateUserTokenBalance(appState, rewardTokenAddress);
            }

            appState.walletState.tokenBalances.set(
                rewardTokenAddress,
                BigNumber(appState.walletState.tokenBalances.get(rewardTokenAddress)!).plus(amount).toFixed(0)
            )
        } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            if (!appState.smartWalletState.tokenBalances.has(rewardTokenAddress)) {
                appState = await updateUserTokenBalance(appState, rewardTokenAddress);
            }

            appState.smartWalletState.tokenBalances.set(
                rewardTokenAddress,
                BigNumber(appState.smartWalletState.tokenBalances.get(rewardTokenAddress)!).plus(amount).toFixed(0)
            )
        }

        vault.claimableReward = BigNumber(vault.claimableReward).minus(amount).toFixed(0);
        appState.smartWalletState.travaLPStakingStateList.set(
            stakingPool,
            vault
        )

    }

    return appState;
}