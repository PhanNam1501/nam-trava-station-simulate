import {ApplicationState} from "../../../State/ApplicationState";
import {EthAddress} from "../../../utils/types";
import {updateSmartWalletTokenBalance, updateUserTokenBalance} from "../../basic/UpdateStateAccount";
import {MAX_UINT256} from "../../../utils/config";
import BigNumber from "bignumber.js";
import {values} from "lodash";

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

    let vaultSmartWallet = appState.smartWalletState.travaLPStakingStateList.get(stakingPool);
    let vaultWallet = appState.walletState.travaLPStakingStateList.get(stakingPool);

    if (from == appState.smartWalletState.address) {

        if (vaultSmartWallet && vaultSmartWallet.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            let underlyingToken = vaultSmartWallet.underlyingToken.underlyingAddress.toLowerCase();

            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = BigNumber(vaultSmartWallet.deposited);
            }
            const newStakedToken = BigNumber(appState.smartWalletState.tokenBalances.get(underlyingToken)!).minus(amount);
            appState.smartWalletState.tokenBalances.set(underlyingToken, newStakedToken.toString());

            const newRewardBalance = BigNumber(appState.smartWalletState.tokenBalances.get(stakedTokenAddress)!).minus(amount);
            appState.smartWalletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));

            //handle with a case that to equal wallet state
            if (to == appState.walletState.address) {
                const newStakedToken = BigNumber(appState.walletState.tokenBalances.get(underlyingToken)!).plus(amount);
                appState.walletState.tokenBalances.set(underlyingToken, newStakedToken.toString());

                const newRewardBalance = BigNumber(appState.walletState.tokenBalances.get(stakedTokenAddress)!).plus(amount);
                appState.walletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));


                if (vaultWallet && vaultWallet.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress){
                    vaultWallet.deposited = BigNumber(vaultWallet.deposited).plus(amount).toFixed(0);
                    appState.walletState.travaLPStakingStateList.set(
                        stakingPool,
                        vaultWallet
                    )
                }
            }

            vaultSmartWallet.deposited = BigNumber(vaultSmartWallet.deposited).minus(amount).toFixed(0);

            appState.smartWalletState.travaLPStakingStateList.set(
                stakingPool,
                vaultSmartWallet
            )
        }

    } else {
        if (vaultWallet && vaultWallet.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress) {
            let underlyingToken = vaultWallet.underlyingToken.underlyingAddress.toLowerCase();

            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = BigNumber(vaultWallet.deposited);
            }

            //update a number of underlying tokens and staked tokens
            const newStakedToken = BigNumber(appState.walletState.tokenBalances.get(underlyingToken)!).minus(amount);
            appState.walletState.tokenBalances.set(underlyingToken, newStakedToken.toString());

            const newRewardBalance = BigNumber(appState.walletState.tokenBalances.get(stakedTokenAddress)!).minus(amount);
            appState.walletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));


            //handle with a case that to equal smart wallet state
            if (to == appState.smartWalletState.address) {
                const newStakedToken = BigNumber(appState.smartWalletState.tokenBalances.get(underlyingToken)!).plus(amount);
                appState.smartWalletState.tokenBalances.set(underlyingToken, newStakedToken.toString());

                const newRewardBalance = BigNumber(appState.smartWalletState.tokenBalances.get(stakedTokenAddress)!).plus(amount);
                appState.smartWalletState.tokenBalances.set(stakedTokenAddress.toLowerCase(), newRewardBalance.toFixed(0));

                if (vaultSmartWallet && vaultSmartWallet.stakedToken.stakedTokenAddress.toLowerCase() == stakedTokenAddress){
                    vaultSmartWallet.deposited = BigNumber(vaultWallet.deposited).plus(amount).toFixed(0);
                    appState.smartWalletState.travaLPStakingStateList.set(
                        stakingPool,
                        vaultSmartWallet
                    )
                }

            }
            vaultWallet.deposited = BigNumber(vaultWallet.deposited).minus(amount).toFixed(0);

            appState.walletState.travaLPStakingStateList.set(
                stakingPool,
                vaultWallet
            )
        }

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