import BigNumber from "bignumber.js";
import { ApplicationState, LiquidityCampain, UserAsset } from "../../State";
import { EthAddress, wallet_mode } from "../../utils/types";
import { updateLiquidityCampainState } from "./UpdateStateAccount";
import { updateTokenBalance } from "../basic";
import { getMode } from "../../utils/helper";

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
      let amount = _amount;
      if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
        appState = await updateLiquidityCampainState(appState);
      } 
      let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
      if (liquidityCampain == undefined) {
        throw new Error("Liquidity not found");
      }
      const modeFrom = getMode(appState, from);
      if (modeFrom != "walletState" && modeFrom != "smartWalletState") {
        throw new Error("Address not found");
      }
      if (appState[modeFrom].tokenBalances.has(liquidityCampain.stakedToken.stakedTokenAddress) == false) {
        appState = await updateTokenBalance(appState, from, liquidityCampain.underlyingToken.underlyingAddress);
      }
      console.log(liquidityCampain.underlyingToken.underlyingAddress)
      console.log(appState[modeFrom].tokenBalances.get(liquidityCampain.stakedToken.stakedTokenAddress))

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
    let amount = _amount;
    if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
      appState = await updateLiquidityCampainState(appState);
    } 
    if (!appState.smartWalletState.liquidityCampainState.liquidityCampainList.has(liquidity)) {
      throw new Error("Liquidity not found");
    }
    

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
    let amount = _amount;
    if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
      appState = await updateLiquidityCampainState(appState);
    }  
    if (!appState.smartWalletState.liquidityCampainState.liquidityCampainList.has(liquidity)) {
      throw new Error("Liquidity not found");
    }

    return appState;
  } catch (err) {
    throw err;
  }
}