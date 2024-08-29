import { BigNumber } from "bignumber.js";
import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import _ from "lodash";
import { MAX_UINT256, YEAR_TO_SECONDS } from "../../utils/config";
import { updateSmartWalletTokenBalance, updateTokenBalance } from "../basic/UpdateStateAccount";
import { getMode } from "../../utils/helper";
import { updatePancakeFarmState } from "./UpdateStateAccount";
import { PancakeFarmStateChange, UserPancakeFarmStateChange } from "../../State/pancake-farm";

export async function getPancakeFarmAPR(
  appState: ApplicationState,
  _v2Wrapper: EthAddress
) {
  const v2Wrapper = _v2Wrapper.toLowerCase();
  appState = await updatePancakeFarmState(appState, appState.smartWalletState.address, false);
  
  const pancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper)!
  const rewardPrice = appState.tokenPrice.get(pancakeFarmState.rewardToken.address)!
  const stakedTokenPrice = appState.tokenPrice.get(pancakeFarmState.stakedToken.address)!
  const rewardPerYearUSD = rewardPrice ? BigNumber(pancakeFarmState.rewardPerSecond).multipliedBy(YEAR_TO_SECONDS).multipliedBy(rewardPrice).div(BigNumber(10).pow(pancakeFarmState.rewardToken.decimals)) : BigNumber(0)
  const tvlUSD = stakedTokenPrice?  BigNumber(pancakeFarmState.totalStakeAmount).multipliedBy(stakedTokenPrice).div(BigNumber(10).pow(pancakeFarmState.stakedToken.decimals)) : BigNumber(0)
  return tvlUSD.isZero() ? "0" : rewardPerYearUSD.div(tvlUSD).toFixed()
}

export async function getMaxPancakeFarmUnstakeAmount(
  appState: ApplicationState,
  _v2Wrapper: EthAddress
) {
  const v2Wrapper = _v2Wrapper.toLowerCase();
  appState = await updatePancakeFarmState(appState, appState.smartWalletState.address, false);
  
  const pancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper)!

  return pancakeFarmState.stakedAmount;
}

export async function getPancakeFarmReward(
  appState: ApplicationState,
  _v2Wrapper: EthAddress
) {
  const v2Wrapper = _v2Wrapper.toLowerCase();
  appState = await updatePancakeFarmState(appState, appState.smartWalletState.address, false);
  
  const pancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper)!

  return pancakeFarmState.pendingReward;
}

export async function simulatePancakeFarmStakeLP(
  appState: ApplicationState,
  _v2Wrapper: EthAddress,
  from: EthAddress,
  _amount: uint256,
  noHarvest: boolean


): Promise<ApplicationState> {
  try {
    const v2Wrapper = _v2Wrapper.toLowerCase()
    let mode = getMode(appState, from);

    appState = await updatePancakeFarmState(appState, appState.smartWalletState.address, false);
    const userPancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper)!
    const pancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper)!
    const stakedTokenAddr = pancakeFarmState.stakedToken.address.toLowerCase()
    const rewardTokenAddr = pancakeFarmState.rewardToken.address.toLowerCase()

    appState = await updateTokenBalance(appState, from, stakedTokenAddr);
    appState = await updateTokenBalance(appState, appState.smartWalletState.address, rewardTokenAddr)

    let oldTokenBalances = appState[mode].tokenBalances.get(stakedTokenAddr)!


    // Create a copy of the appState to avoid mutating the original state
    let newState = { ...appState };



    let amount = BigNumber(_amount)
    if (BigNumber(amount).toFixed(0) == MAX_UINT256 || BigNumber(amount).isEqualTo(MAX_UINT256)) {
      amount = BigNumber(oldTokenBalances)
    }


    const stakedAmountBefore = userPancakeFarmState.stakedAmount
    const stakedAmountAfter = BigNumber(stakedAmountBefore).plus(amount)

    const rewardBefore = userPancakeFarmState.pendingReward
    const rewardAfter = noHarvest ? rewardBefore : "0"


    const newUserPancakeFarmStateChange: UserPancakeFarmStateChange = {
      stakedAmount: stakedAmountAfter.toFixed(),
      pendingReward: rewardAfter,
    }
    
    let newTokenBalance = BigNumber(oldTokenBalances).minus(amount)
    
    let oldRewardsTokenBalances = newState.smartWalletState.tokenBalances.get(rewardTokenAddr)!
    let newRewardTokenBalance = noHarvest ? BigNumber(oldRewardsTokenBalances) :  BigNumber(oldRewardsTokenBalances).plus(rewardBefore)
    
    const newPancakeFarmStateChange: PancakeFarmStateChange = {
      ...pancakeFarmState,
      totalStakeAmount: BigNumber(pancakeFarmState.totalStakeAmount).plus(amount).toFixed(0)
    }
    
    newState.smartWalletState.pancakeFarmState.userPancakeFarmState.set(v2Wrapper, newUserPancakeFarmStateChange)
    newState.PancakeFarmState.PancakeFarmState.set(v2Wrapper, newPancakeFarmStateChange)

    newState[mode].tokenBalances.set(stakedTokenAddr, newTokenBalance.toFixed());
    newState.smartWalletState.tokenBalances.set(rewardTokenAddr, newRewardTokenBalance.toFixed());
    return newState;
  } catch (err) {
    throw err;
  }
}

export async function simulatePancakeFarmUnStakeLP(
  appState: ApplicationState,
  _v2Wrapper: EthAddress,
  _amount: uint256,
  to: EthAddress,
  noHarvest : boolean,

): Promise<ApplicationState> {
  try {
    const v2Wrapper = _v2Wrapper.toLowerCase();

    appState = await updatePancakeFarmState(appState, appState.smartWalletState.address, false);
    const userPancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper)!
    const pancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper)!
    const stakedTokenAddr = pancakeFarmState.stakedToken.address.toLowerCase()
    const rewardTokenAddr = pancakeFarmState.rewardToken.address.toLowerCase()

    appState = await updateTokenBalance(appState, to, stakedTokenAddr);
    appState = await updateTokenBalance(appState, to, rewardTokenAddr);

    let newState = { ...appState };
    let mode = getMode(appState, to);
    let oldTokenBalances = appState[mode].tokenBalances.get(stakedTokenAddr)!
    let amount = BigNumber(_amount)
    const stakedAmountBefore = userPancakeFarmState.stakedAmount
    if (BigNumber(amount).toFixed(0) == MAX_UINT256 || BigNumber(amount).isEqualTo(MAX_UINT256)) {
      amount = BigNumber(stakedAmountBefore)
    }
    

    const stakedAmountAfter = BigNumber(stakedAmountBefore).minus(amount)


    const rewardBefore = userPancakeFarmState.pendingReward
    const rewardAfter = noHarvest ? rewardBefore : "0"


    const newUserPancakeFarmStateChange: UserPancakeFarmStateChange = {
      stakedAmount: stakedAmountAfter.toFixed(),
      pendingReward: rewardAfter,
    }
    let newTokenBalance = BigNumber(oldTokenBalances).plus(amount)
    
    let oldRewardsTokenBalances = newState[mode].tokenBalances.get(rewardTokenAddr)!
    let newRewardTokenBalance = noHarvest ? BigNumber(oldRewardsTokenBalances) :  BigNumber(oldRewardsTokenBalances).plus(rewardBefore)
    
    const newPancakeFarmStateChange: PancakeFarmStateChange = {
      ...pancakeFarmState,
      totalStakeAmount: BigNumber(pancakeFarmState.totalStakeAmount).minus(amount).toFixed(0)
    }

    newState.smartWalletState.pancakeFarmState.userPancakeFarmState.set(v2Wrapper, newUserPancakeFarmStateChange)
    newState.PancakeFarmState.PancakeFarmState.set(v2Wrapper, newPancakeFarmStateChange)
    newState[mode].tokenBalances.set(stakedTokenAddr, newTokenBalance.toFixed());
    newState[mode].tokenBalances.set(rewardTokenAddr, newRewardTokenBalance.toFixed());
    return newState;
  } catch (err) {
    throw err;
  }
}
export async function simulatePancakeFarmHarvestLP(
  appState: ApplicationState,
  _v2Wrapper: EthAddress,
  to: EthAddress,
  noHarvest : boolean,

): Promise<ApplicationState> {
  try {
    const v2Wrapper = _v2Wrapper.toLowerCase();

    appState = await updatePancakeFarmState(appState, appState.smartWalletState.address, false);
    const pancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper)!
    const userPancakeFarmState = appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2Wrapper)!

    const rewardTokenAddr = pancakeFarmState.rewardToken.address.toLowerCase()

    appState = await updateSmartWalletTokenBalance(appState, rewardTokenAddr)

    let mode = getMode(appState, to);


    // Create a copy of the appState to avoid mutating the original state
    let newState = { ...appState };



    let amount = BigNumber(0)
    


    const stakedAmountBefore = userPancakeFarmState.stakedAmount
    const stakedAmountAfter = BigNumber(stakedAmountBefore).plus(amount)

    const rewardBefore = userPancakeFarmState.pendingReward
    const rewardAfter = noHarvest ? rewardBefore : "0"


    const newUserPancakeFarmStateChange: UserPancakeFarmStateChange = {
      stakedAmount: stakedAmountAfter.toFixed(),
      pendingReward: rewardAfter,
    }
    
    
    let oldRewardsTokenBalances = newState.smartWalletState.tokenBalances.get(rewardTokenAddr)!
    let newRewardTokenBalance = noHarvest ? BigNumber(oldRewardsTokenBalances) :  BigNumber(oldRewardsTokenBalances).plus(rewardBefore)
    
    
    newState.smartWalletState.pancakeFarmState.userPancakeFarmState.set(v2Wrapper, newUserPancakeFarmStateChange)
    newState[mode].tokenBalances.set(rewardTokenAddr, newRewardTokenBalance.toFixed());
    return newState;
  } catch (err) {
    throw err;
  }
}
