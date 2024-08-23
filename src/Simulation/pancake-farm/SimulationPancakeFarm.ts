import { BigNumber } from "bignumber.js";
import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Contract } from "ethers";
import _ from "lodash";
import { bnb, MAX_UINT256, percentMul, wadDiv } from "../../utils/config";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
import { updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateTokenBalance, updateUserEthBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import { DetailTokenInPool } from "../../State/SmartWalletState";
import { getMode } from "../../utils/helper";
import { updatePancakeFarmState } from "./UpdateStateAccount";
import { PancakeFarmState, PancakeFarmStateChange } from "../../State/pancake-farm";
import { listFarmingV2List } from "../../utils";
export async function PancakeFarmStakeLP(
  appState: ApplicationState,
  v2Wrapper: EthAddress,
  from: EthAddress,
  _amount: uint256,
  noHarvest: boolean


): Promise<ApplicationState> {
  try {
    appState = await updatePancakeFarmState(appState, v2Wrapper, false);
    let PancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper)!
    let farmconfig = listFarmingV2List[appState.chainId].find((item) => item.v2WrapperAddress.toLowerCase() == v2Wrapper.toLowerCase())!
    const stakedTokenAddr = farmconfig.stakedToken.address.toLowerCase()
    const rewardTokenAddr = farmconfig.rewardToken.address.toLowerCase()

    appState = await updateTokenBalance(appState, from, stakedTokenAddr);
    appState = await updateSmartWalletTokenBalance(appState, rewardTokenAddr)

    let mode = getMode(appState, from);
    let oldTokenBalances = appState[mode].tokenBalances.get(stakedTokenAddr)!


    // Create a copy of the appState to avoid mutating the original state
    let newState = { ...appState };



    let amount = BigNumber(_amount)
    if (BigNumber(amount).toFixed(0) == MAX_UINT256 || BigNumber(amount).isEqualTo(MAX_UINT256)) {
      amount = BigNumber(oldTokenBalances)
    }


    const stakedAmountBefore = PancakeFarmState.stakedAmount
    const stakedAmountAfter = BigNumber(stakedAmountBefore).plus(amount)

    const rewardBefore = PancakeFarmState.pendingReward
    const rewardAfter = noHarvest ? rewardBefore : "0"

    const RPS = PancakeFarmState.rewardPerSecond

    const newPancakeFarmStateChange: PancakeFarmStateChange = {
      stakedAmount: stakedAmountAfter.toFixed(),
      rewardPerSecond: RPS,
      pendingReward: rewardAfter,
    }
    
    let newTokenBalance = BigNumber(oldTokenBalances).minus(amount)
    
    let oldRewardsTokenBalances = newState.smartWalletState.tokenBalances.get(rewardTokenAddr)!
    let newRewardTokenBalance = noHarvest ? BigNumber(oldRewardsTokenBalances) :  BigNumber(oldRewardsTokenBalances).plus(rewardBefore)
    
    
    newState.PancakeFarmState.PancakeFarmState.set(v2Wrapper, newPancakeFarmStateChange)
    newState[mode].tokenBalances.set(stakedTokenAddr, newTokenBalance.toFixed());
    newState.smartWalletState.tokenBalances.set(rewardTokenAddr, newRewardTokenBalance.toFixed());
    return newState;
  } catch (err) {
    throw err;
  }
}

export async function PancakeFarmUnStakeLP(
  appState: ApplicationState,
  v2Wrapper: EthAddress,
  _amount: uint256,
  to: EthAddress,
  noHarvest : boolean,

): Promise<ApplicationState> {
  try {
    appState = await updatePancakeFarmState(appState, v2Wrapper, false);
    let PancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper)!
    let farmconfig = listFarmingV2List[appState.chainId].find((item) => item.v2WrapperAddress.toLowerCase() == v2Wrapper.toLowerCase())!
    const stakedTokenAddr = farmconfig.stakedToken.address.toLowerCase()
    const rewardTokenAddr = farmconfig.rewardToken.address.toLowerCase()
    console.log("to", to)

    appState = await updateTokenBalance(appState, to, stakedTokenAddr);
    appState = await updateTokenBalance(appState, to, rewardTokenAddr);
    let newState = { ...appState };
    let mode = getMode(appState, to);
    let oldTokenBalances = appState[mode].tokenBalances.get(stakedTokenAddr)!
    let amount = BigNumber(_amount)
    const stakedAmountBefore = PancakeFarmState.stakedAmount
    if (BigNumber(amount).toFixed(0) == MAX_UINT256 || BigNumber(amount).isEqualTo(MAX_UINT256)) {
      amount = BigNumber(stakedAmountBefore)
    }
    

    const stakedAmountAfter = BigNumber(stakedAmountBefore).minus(amount)


    const rewardBefore = PancakeFarmState.pendingReward
    const rewardAfter = noHarvest ? rewardBefore : "0"

    const RPS = PancakeFarmState.rewardPerSecond

    const newPancakeFarmStateChange: PancakeFarmStateChange = {
      stakedAmount: stakedAmountAfter.toFixed(),
      rewardPerSecond: RPS,
      pendingReward: rewardAfter,
    }
    let newTokenBalance = BigNumber(oldTokenBalances).plus(amount)
    console.log("old token balance", oldTokenBalances)
    console.log("new token balance", newTokenBalance.toFixed())
    
    let oldRewardsTokenBalances = newState[mode].tokenBalances.get(rewardTokenAddr)!
    let newRewardTokenBalance = noHarvest ? BigNumber(oldRewardsTokenBalances) :  BigNumber(oldRewardsTokenBalances).plus(rewardBefore)
    
    
    newState.PancakeFarmState.PancakeFarmState.set(v2Wrapper, newPancakeFarmStateChange)
    newState[mode].tokenBalances.set(stakedTokenAddr, newTokenBalance.toFixed());
    newState[mode].tokenBalances.set(rewardTokenAddr, newRewardTokenBalance.toFixed());


    

 

    return newState;
  } catch (err) {
    throw err;
  }
}
export async function PancakeFarmHarvestLP(
  appState: ApplicationState,
  v2Wrapper: EthAddress,
  to: EthAddress,
  noHarvest : boolean,

): Promise<ApplicationState> {
  try {
    appState = await updatePancakeFarmState(appState, v2Wrapper, false);
    let PancakeFarmState = appState.PancakeFarmState.PancakeFarmState.get(v2Wrapper)!
    let farmconfig = listFarmingV2List[appState.chainId].find((item) => item.v2WrapperAddress.toLowerCase() == v2Wrapper.toLowerCase())!
    const rewardTokenAddr = farmconfig.rewardToken.address.toLowerCase()

    appState = await updateSmartWalletTokenBalance(appState, rewardTokenAddr)

    let mode = getMode(appState, to);


    // Create a copy of the appState to avoid mutating the original state
    let newState = { ...appState };



    let amount = BigNumber(0)
    


    const stakedAmountBefore = PancakeFarmState.stakedAmount
    const stakedAmountAfter = BigNumber(stakedAmountBefore).plus(amount)

    const rewardBefore = PancakeFarmState.pendingReward
    const rewardAfter = noHarvest ? rewardBefore : "0"

    const RPS = PancakeFarmState.rewardPerSecond

    const newPancakeFarmStateChange: PancakeFarmStateChange = {
      stakedAmount: stakedAmountAfter.toFixed(),
      rewardPerSecond: RPS,
      pendingReward: rewardAfter,
    }
    
    
    let oldRewardsTokenBalances = newState.smartWalletState.tokenBalances.get(rewardTokenAddr)!
    let newRewardTokenBalance = noHarvest ? BigNumber(oldRewardsTokenBalances) :  BigNumber(oldRewardsTokenBalances).plus(rewardBefore)
    
    
    newState.PancakeFarmState.PancakeFarmState.set(v2Wrapper, newPancakeFarmStateChange)
    newState[mode].tokenBalances.set(rewardTokenAddr, newRewardTokenBalance.toFixed());
    return newState;
  } catch (err) {
    throw err;
  }
}
