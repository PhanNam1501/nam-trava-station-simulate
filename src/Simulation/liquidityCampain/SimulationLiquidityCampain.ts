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
      let from = _from.toLowerCase();
      let amount = BigNumber(_amount);
      if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
        appState = await updateLiquidityCampainState(appState);
      } 
      let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
      if (liquidityCampain == undefined) {
        throw new Error("Liquidity not found");
      }
      let joinTime = Number(liquidityCampain.joinTime);
      let now = new Date().getTime();
      // if (now > joinTime) {
      //   throw new Error("Liquidity Campain can not join now");
      // }

      const modeFrom = getMode(appState, from);
      if (modeFrom != "walletState" && modeFrom != "smartWalletState") {
        throw new Error("Address not found");
      }
      if (appState[modeFrom].tokenBalances.has(liquidityCampain.stakedToken.stakedTokenAddress) == false) {
        appState = await updateTokenBalance(appState, from, liquidityCampain.underlyingToken.underlyingAddress);
      }
      
      let oldBalance = BigNumber(0);
      if (appState[modeFrom].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase())){
        oldBalance = BigNumber(appState[modeFrom].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase())!);
      }

      if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256) ) {
        amount = BigNumber(oldBalance);
      }

      let newTotalSupply = BigNumber(liquidityCampain.deposited).plus(amount);
      let newLiquidityCampain = liquidityCampain;
      newLiquidityCampain.deposited = newTotalSupply.toFixed();

      let newTVL = (BigNumber(liquidityCampain.TVL).div(liquidityCampain.underlyingToken.price).multipliedBy(liquidityCampain.underlyingToken.reserveDecimals).plus(amount)).multipliedBy(liquidityCampain.underlyingToken.price).div(liquidityCampain.underlyingToken.reserveDecimals);
      newLiquidityCampain.TVL = newTVL.toFixed();

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
    let to = _to.toLowerCase();
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
    if (modeTo != "walletState" && modeTo != "smartWalletState") {
      throw new Error("Address not found");
    }
    if (appState[modeTo].tokenBalances.has(liquidityCampain.stakedToken.stakedTokenAddress) == false) {
      appState = await updateTokenBalance(appState, to, liquidityCampain.underlyingToken.underlyingAddress);
    }
    
    let oldBalance = BigNumber(0);
    if (appState[modeTo].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase())){
      oldBalance = BigNumber(appState[modeTo].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase())!);
    }

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
  _to: EthAddress,
  _amount: EthAddress,
): Promise<ApplicationState> {
  let appState = { ..._appState };
  try {
    let liquidity = _liquidity.toLowerCase();
    let to = _to.toLowerCase();
    let amount = BigNumber(_amount);
    if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
      appState = await updateLiquidityCampainState(appState);
    } 
    let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
    if (liquidityCampain == undefined) {
      throw new Error("Liquidity not found");
    }
    const modeTo = getMode(appState, to);
    if (modeTo != "walletState" && modeTo != "smartWalletState") {
      throw new Error("Address not found");
    }
    if (appState[modeTo].tokenBalances.has(liquidityCampain.stakedToken.stakedTokenAddress) == false) {
      appState = await updateTokenBalance(appState, to, liquidityCampain.underlyingToken.underlyingAddress);
    }

    /////
    return appState;
  } catch (err) {
    throw err;
  }
}