import BigNumber from "bignumber.js";
import { ApplicationState, LiquidityCampain, UserAsset } from "../../State";
import { EthAddress, wallet_mode } from "../../utils/types";
import { updateLiquidityCampainState } from "./UpdateStateAccount";
import { updateTokenBalance } from "../basic";
import { getMode } from "../../utils/helper";
import { MAX_UINT256 } from "../../utils";

export async function SimulationJoinLiquidity(
    _appState: ApplicationState,
    _liquidity: EthAddress,
    _from: EthAddress,
    _amount: string,
  ): Promise<ApplicationState> {
    let appState = { ..._appState };
    try {
      let liquidity = _liquidity.toLowerCase();
      let from = _from;
      let amount = BigNumber(_amount);
      if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
        appState = await updateLiquidityCampainState(appState);
      } 
      let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
      if (liquidityCampain == undefined) {
        throw new Error("Liquidity not found");
      }

      const modeFrom = getMode(appState, from);
      if (appState[modeFrom].tokenBalances.has(liquidityCampain.underlyingToken.underlyingAddress) == false) {
        appState = await updateTokenBalance(appState, from, liquidityCampain.underlyingToken.underlyingAddress);
      }
      
      let oldBalance = BigNumber(appState[modeFrom].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase())!);

      let maxTotalDeposit = Number(liquidityCampain.maxTotalDeposit);
      if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256) ) {
        if (oldBalance.isGreaterThan(maxTotalDeposit)) {
          amount = BigNumber(maxTotalDeposit);
        } else {
          amount = BigNumber(oldBalance);
        }
      }

      let newTotalSupply = BigNumber(liquidityCampain.deposited).plus(amount);
      let newLiquidityCampain = liquidityCampain;
      newLiquidityCampain.deposited = newTotalSupply.toFixed();

      let newTVL = (BigNumber(liquidityCampain.TVL).div(liquidityCampain.underlyingToken.price).multipliedBy(liquidityCampain.underlyingToken.reserveDecimals).plus(amount)).multipliedBy(liquidityCampain.underlyingToken.price).div(liquidityCampain.underlyingToken.reserveDecimals);
      newLiquidityCampain.TVL = newTVL.toFixed();
      newLiquidityCampain.maxTotalDeposit = BigNumber(liquidityCampain.maxTotalDeposit).minus(amount).toFixed();

      appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(liquidity, newLiquidityCampain);
      appState[modeFrom].tokenBalances.set(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase(), oldBalance.minus(amount).toFixed());
      return appState;
    } catch (err) {
      throw err;
    }
  }

export async function SimulationWithdrawLiquidity(
  _appState: ApplicationState,
  _liquidity: EthAddress,
  _to: EthAddress,
  _amount: string,
): Promise<ApplicationState> {
  let appState = { ..._appState };
  try {
    let liquidity = _liquidity.toLowerCase();
    let to = _to;
    let amount = BigNumber(_amount);
    if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
      appState = await updateLiquidityCampainState(appState);
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
    const modeTo = getMode(appState, to);
    if (appState[modeTo].tokenBalances.has(liquidityCampain.underlyingToken.underlyingAddress) == false) {
      appState = await updateTokenBalance(appState, to, liquidityCampain.underlyingToken.underlyingAddress);
    }
    
    let oldBalance = BigNumber(appState[modeTo].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase())!);
    console.log(oldBalance.toFixed());
    if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256) ) {
      amount = BigNumber(liquidityCampain.deposited);
    }

    let newTotalSupply = BigNumber(liquidityCampain.deposited).minus(amount);
    let newLiquidityCampain = liquidityCampain;
    newLiquidityCampain.deposited = newTotalSupply.toFixed();

    let newTVL = (BigNumber(liquidityCampain.TVL).div(liquidityCampain.underlyingToken.price).multipliedBy(liquidityCampain.underlyingToken.reserveDecimals).minus(amount)).multipliedBy(liquidityCampain.underlyingToken.price).div(liquidityCampain.underlyingToken.reserveDecimals);
    newLiquidityCampain.TVL = newTVL.toFixed();

    appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(liquidity, newLiquidityCampain);
    appState[modeTo].tokenBalances.set(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase(), oldBalance.plus(amount).toFixed());
    return appState;
  } catch (err) {
    throw err;
  }
}

export async function SimulationClaimRewardLiquidity(
  _appState: ApplicationState,
  _liquidity: EthAddress,
  _to: EthAddress
): Promise<ApplicationState> {
  let appState = { ..._appState };
  try {
    let liquidity = _liquidity.toLowerCase();
    let to = _to;
    if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
      appState = await updateLiquidityCampainState(appState);
    } 
    let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
    if (liquidityCampain == undefined) {
      throw new Error("Liquidity not found");
    }
    const modeTo = getMode(appState, to);
    if (appState[modeTo].tokenBalances.has(liquidityCampain.rewardToken.address) == false) {
      appState = await updateTokenBalance(appState, to, liquidityCampain.rewardToken.address);
    }

    let oldBalance = BigNumber(appState[modeTo].tokenBalances.get(liquidityCampain.rewardToken.address.toLowerCase())!);
    let amount = BigNumber(liquidityCampain.claimableReward);
    let newClaimableReward = BigNumber(liquidityCampain.claimableReward).minus(amount);
    let newLiquidityCampain = liquidityCampain;
    newLiquidityCampain.claimableReward = newClaimableReward.toFixed();

    appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(liquidity, newLiquidityCampain);
    appState[modeTo].tokenBalances.set(liquidityCampain.rewardToken.address.toLowerCase(), oldBalance.plus(amount).toFixed());
    return appState;
  } catch (err) {
    throw err;
  }
}