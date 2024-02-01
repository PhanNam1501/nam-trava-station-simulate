import { EthAddress } from "../../../utils/types";
import { ApplicationState } from "../../../State/ApplicationState";
import _ from "lodash";
import { BigNumber } from "bignumber.js";
import { updateLPtTokenInfo } from "./UpdateStateAccount";
import { updateUserTokenBalance } from "../../basic/UpdateStateAccount";
import { getMode} from "../../../utils/helper";
import { calculateNewAvailableBorrow, calculateNewHealFactor, calculateNewLiquidThreshold, calculateNewLTV, getBalanceUsdFromAmount } from "./SimulationWalletTravaLP";

//need to transfer ttoken from smart wallet state 
export async function SimulationTransfer(
    appState1: ApplicationState,
    _from: EthAddress,
    _to: EthAddress,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
      let amount = BigNumber(_amount);
      const appState = { ...appState1 };
  
      _tokenAddress = _tokenAddress.toLowerCase();
  
      let modeFrom =getMode(appState,_from);
      let modeTo = getMode(appState,_to);
  
      await updateLPtTokenInfo(appState, _tokenAddress, _from );
      let tokenInfoFrom = appState[modeFrom].detailTokenInPool.get(_tokenAddress)!;
      
      // check tokenAddress is exist on reverseList
      if (!appState[modeFrom].tokenBalances.has(_tokenAddress)) {
        await updateUserTokenBalance(appState, _tokenAddress);
      }
      let transferUSD = getBalanceUsdFromAmount(amount, tokenInfoFrom);
      let oldTotalCollateralUSD = appState[modeFrom].travaLPState.totalCollateralUSD;
      let newTotalCollateralUSD = BigNumber(appState[modeFrom].travaLPState.totalCollateralUSD).minus(transferUSD);
      // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
        
      let oldLTV = appState[modeFrom].travaLPState.ltv;
      let newLTV = calculateNewLTV(BigNumber(oldTotalCollateralUSD), BigNumber(oldLTV), newTotalCollateralUSD, BigNumber(tokenInfoFrom.maxLTV))
  
      //Calculate liquid threshold
      let oldLiquidTreshold = appState[modeFrom].travaLPState.currentLiquidationThreshold;
      let newLiquidTreshold = calculateNewLiquidThreshold(BigNumber(oldTotalCollateralUSD), BigNumber(oldLiquidTreshold), newTotalCollateralUSD, BigNumber(tokenInfoFrom.liqThres));
  
      // if totalDebtUSD = 0  , not update healthFactor
      const healthFactor = calculateNewHealFactor(newTotalCollateralUSD, newLiquidTreshold, BigNumber(appState[modeFrom].travaLPState.totalDebtUSD));
      const availableBorrowsUSD = calculateNewAvailableBorrow(newTotalCollateralUSD, newLTV, BigNumber(appState[modeFrom].travaLPState.totalDebtUSD));
  
  
      appState[modeFrom].travaLPState.totalCollateralUSD = newTotalCollateralUSD.toFixed(0);
      appState[modeFrom].travaLPState.currentLiquidationThreshold = newLiquidTreshold.toFixed(0);
      appState[modeFrom].travaLPState.ltv = newLTV.toFixed(0);
      appState[modeFrom].travaLPState.healthFactor = healthFactor.toFixed(0);
      appState[modeFrom].travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0)
  
      tokenInfoFrom.tToken = {
        address: tokenInfoFrom.tToken.address,
        decimals: tokenInfoFrom.tToken.decimals,
        balances: BigNumber(tokenInfoFrom.tToken.balances).minus(amount).toFixed(0),
        totalSupply: BigNumber(tokenInfoFrom.tToken.totalSupply).toFixed(0),
        originToken: {
          balances: BigNumber(tokenInfoFrom.tToken.originToken.balances).minus(amount).toFixed(0)
        }
      };
  
      appState[modeFrom].detailTokenInPool.set(
        _tokenAddress,
        tokenInfoFrom
      );
      
      if (_to.toLowerCase() == appState.walletState.address.toLowerCase() || _to.toLowerCase() == appState.smartWalletState.address.toLowerCase() ) {
        
        await updateLPtTokenInfo(appState, _tokenAddress, _to);
        let tokenInfoTo = appState[modeTo].detailTokenInPool.get(_tokenAddress)!;

        // check tokenAddress is exist on reverseList
        if (!appState[modeTo].tokenBalances.has(_tokenAddress)) {
          await updateUserTokenBalance(appState, _tokenAddress);
        }
  
        let transferUSD = getBalanceUsdFromAmount(amount, tokenInfoTo);
        let oldTotalCollateralUSD = appState[modeTo].travaLPState.totalCollateralUSD;
        let newTotalCollateralUSD = BigNumber(appState[modeTo].travaLPState.totalCollateralUSD).plus(transferUSD);
        // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
  
        let oldLTV = appState[modeTo].travaLPState.ltv;
        let newLTV = calculateNewLTV(BigNumber(oldTotalCollateralUSD), BigNumber(oldLTV), newTotalCollateralUSD, BigNumber(tokenInfoTo.maxLTV))
    
        //Calculate liquid threshold
        let oldLiquidTreshold = appState[modeTo].travaLPState.currentLiquidationThreshold;
        let newLiquidTreshold = calculateNewLiquidThreshold(BigNumber(oldTotalCollateralUSD), BigNumber(oldLiquidTreshold), newTotalCollateralUSD, BigNumber(tokenInfoTo.liqThres));
    
        // if totalDebtUSD = 0  , not update healthFactor
        const healthFactor = calculateNewHealFactor(newTotalCollateralUSD, newLiquidTreshold, BigNumber(appState[modeTo].travaLPState.totalDebtUSD));
        const availableBorrowsUSD = calculateNewAvailableBorrow(newTotalCollateralUSD, newLTV, BigNumber(appState[modeTo].travaLPState.totalDebtUSD));
    
    
        appState[modeTo].travaLPState.totalCollateralUSD = newTotalCollateralUSD.toFixed(0);
        appState[modeTo].travaLPState.currentLiquidationThreshold = newLiquidTreshold.toFixed(0);
        appState[modeTo].travaLPState.ltv = newLTV.toFixed(0);
        appState[modeTo].travaLPState.healthFactor = healthFactor.toFixed(0);
        appState[modeTo].travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0)
    
        
        tokenInfoTo.tToken = {
          address: tokenInfoTo.tToken.address,
          decimals: tokenInfoTo.tToken.decimals,
          balances: BigNumber(tokenInfoTo.tToken.balances).plus(amount).toFixed(0),
          totalSupply: BigNumber(tokenInfoTo.tToken.totalSupply).toFixed(0),
          originToken: {
            balances: BigNumber(tokenInfoTo.tToken.originToken.balances).plus(amount).toFixed(0)
          }
        };
    
        appState[modeTo].detailTokenInPool.set(
          _tokenAddress,
          tokenInfoTo
        );
      };
      return appState;
    } catch (err) {
      throw err;
    }
  }