import { BigNumber } from "bignumber.js";
import BigInt from "bignumber.js";

import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Contract } from "ethers";
import _ from "lodash";
import { bnb, MAX_UINT256, percentMul, wadDiv } from "../../utils/config";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
import { updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserEthBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import { DetailTokenInPool } from "../../State/SmartWalletState";
import { getMode} from "../../utils/helper";
import { updateCS251State } from "./update";
import { cs251state, cs251statechange } from "../../State/cs251";



export async function getExchangeRate(appState: ApplicationState, exchange:EthAddress){
  let tokenAddr;
  appState = await updateCS251State(appState, exchange, false);
  let newState = { ...appState };

  let exchangeState = newState.cs251state.cs251state.get(exchange)!

  const oldETHReserve = exchangeState.eth_reserve
  const oldTokenReserves = exchangeState.token_reserve
  const exchangeRate = BigNumber(oldTokenReserves).multipliedBy(10**18).multipliedBy(10**15).dividedBy(oldETHReserve)
  return exchangeRate
}
// Add Liquidity
export async function addLiquidity(
  appState: ApplicationState,
  exchange:EthAddress, // Declare and provide a value for tokenAddr
  from: EthAddress,
  amountETH: string,
  force: boolean

): Promise<ApplicationState> {
  try {
    
    appState  = await updateCS251State(appState, exchange, false);
    let newState = { ...appState };
    
    let exchangeState = newState.cs251state.cs251state.get(exchange)!

    let tokenAddr;
    tokenAddr = exchangeState.tokenAddr;
    
    if (!appState.walletState.tokenBalances.has(tokenAddr)) {
      await updateUserTokenBalance(appState, tokenAddr)
  }
    if (!appState.smartWalletState.tokenBalances.has(tokenAddr)) {
      await updateSmartWalletTokenBalance(appState, tokenAddr)
  }

    

    const oldETHReserve = new BigNumber(exchangeState.eth_reserve)
    console.log("oldeth", oldETHReserve.toString());
    const newETHReserve = oldETHReserve.plus(new BigNumber(amountETH));
    
    const oldtotalshare = new BigNumber(exchangeState.total_shares)
    const newtotalshare = oldtotalshare.plus(new BigNumber(amountETH).multipliedBy(oldtotalshare).dividedBy(newETHReserve));
    

    const oldLps = new BigNumber(exchangeState.lps)
    const newLps = oldLps.plus(new BigNumber(amountETH).multipliedBy(oldtotalshare).dividedBy(newETHReserve));
    
   // Calculate the amount of tokens to add to the liquidity pool based on the reserves
    const tokenAmount = new BigNumber(amountETH).multipliedBy(new BigNumber(exchangeState.token_reserve)).dividedBy(new BigNumber(exchangeState.eth_reserve));
    console.log("amount", tokenAmount.toString());
    const oldTokenReserves = new BigNumber(exchangeState.token_reserve)
    const newTokenReserve = oldTokenReserves.plus(tokenAmount);
    console.log("new", newTokenReserve.toString());

    const newExchangeState: cs251statechange = {
      eth_reserve: Number(newETHReserve),
      token_reserve: Number(newTokenReserve),
      total_shares: Number(newtotalshare),
      lps: Number(newLps),
      tokenAddr: tokenAddr,
    }
    newState.cs251state.cs251state.set(exchange, newExchangeState)

    let mode = getMode(appState, from);
    if (appState[mode].tokenBalances.has(tokenAddr.toLowerCase())) {
      console.log("IN");
      // newState = await updateUserTokenBalance(newState, tokenAddr)
      // newState = await updateUserEthBalance(newState)
      let oldTokenBalances = appState[mode].tokenBalances.get(tokenAddr.toLowerCase())!
      let newTokenBalance = BigNumber(oldTokenBalances).minus(tokenAmount)
      appState[mode].tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

      let oldETHBalances = appState[mode].ethBalances
      let newETHBalance = BigNumber(oldETHBalances).minus(amountETH)
      appState[mode].ethBalances = newETHBalance.toFixed()

  // } else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
    
  //   // newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
  //   // newState = await updateSmartWalletEthBalance(newState)

  //   let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
  //   let newTokenBalance = BigNumber(oldTokenBalances).minus(tokenAmount)
  //   appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

  //   let oldETHBalances = appState.smartWalletState.ethBalances
  //   let newETHBalance = BigNumber(oldETHBalances).minus(amountETH)
  //   appState.smartWalletState.ethBalances = newETHBalance.toFixed()

    
    
  // 
  } else {
      new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
  }

    return newState;
  } catch (err) {
    throw err;
  }
}

// Remove Liquidity     
export async function removeLiquidity(   
  appState: ApplicationState,
  exchange: EthAddress,
  amountETH: string,
  to:EthAddress,

): Promise<ApplicationState> {
  try {
    appState = await updateCS251State(appState, exchange, false);
    // Create a copy of the appState to avoid mutating the original state
    let newState = { ...appState };
    let exchangeState = newState.cs251state.cs251state.get(exchange)!
    let tokenAddr;
    tokenAddr = exchangeState.tokenAddr;
    if (!appState.walletState.tokenBalances.has(tokenAddr)) {
      await updateUserTokenBalance(appState, tokenAddr)
  }
    if (!appState.smartWalletState.tokenBalances.has(tokenAddr)) {
      await updateSmartWalletTokenBalance(appState, tokenAddr)
  }

    
    //check max amount to remove
    const share_withdraw = BigNumber(amountETH).multipliedBy(exchangeState.total_shares).dividedBy(exchangeState.eth_reserve)
    const tokenwithdraw = BigNumber(exchangeState.token_reserve).multipliedBy(share_withdraw).dividedBy(exchangeState.total_shares)
    let ethwithdraw = BigNumber(exchangeState.eth_reserve).multipliedBy(share_withdraw).dividedBy(exchangeState.total_shares)
    
    const oldTokenReserves = exchangeState.token_reserve
    const newTokenReserve = BigNumber(oldTokenReserves).minus(tokenwithdraw)

    const oldETHReserve = exchangeState.eth_reserve
    const newETHReserve = BigNumber(oldETHReserve).minus(ethwithdraw)

    const oldtotalshare = exchangeState.total_shares
    const newtotalshare = BigNumber(oldtotalshare).minus(share_withdraw)
    
    const oldLps = exchangeState.lps
    const newLps = BigNumber(oldLps).minus(share_withdraw)
    console.log("new", newLps);
    const newExchangeState: cs251statechange = {
      eth_reserve: Number(newETHReserve),
      token_reserve: Number(newTokenReserve),
      total_shares: Number(newtotalshare),
      lps: Number(newLps),
      tokenAddr: tokenAddr,
    }
    newState.cs251state.cs251state.set(exchange, newExchangeState)
    if (ethwithdraw.toFixed(0) == MAX_UINT256 || ethwithdraw.isEqualTo(MAX_UINT256)) {
      ethwithdraw = BigNumber(exchangeState.lps).multipliedBy(exchangeState.eth_reserve).dividedBy(exchangeState.total_shares);
    }


    if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      

      let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
      let newTokenBalance = BigNumber(oldTokenBalances).plus(tokenwithdraw)
      appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

      let oldETHBalances = appState.walletState.ethBalances
      let newETHBalance = BigNumber(oldETHBalances).plus(ethwithdraw)
      appState.walletState.ethBalances = newETHBalance.toFixed()

  } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
    
    let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
    let newTokenBalance = BigNumber(oldTokenBalances).plus(tokenwithdraw)
    appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

    let oldETHBalances = appState.smartWalletState.ethBalances
    let newETHBalance = BigNumber(oldETHBalances).plus(ethwithdraw)
    appState.smartWalletState.ethBalances = newETHBalance.toFixed()
    
  } else {
      new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
  }
    return newState;
  } catch (err) {
    throw err;
  }
}

export async function swapAssets(
  appState: ApplicationState,
  exchange: EthAddress,
  amountIn: string,
  from: EthAddress,
  isSwapForETH: boolean // true for Token for ETH, false for ETH for Token
): Promise<ApplicationState> {
  try {
    // Update the state with the current exchange details
    appState = await updateCS251State(appState, exchange, false);
    let newState = { ...appState };
    let exchangeState = newState.cs251state.cs251state.get(exchange)!
    let tokenAddr;
    tokenAddr = exchangeState.tokenAddr;
    if (!appState.walletState.tokenBalances.has(tokenAddr)) {
      await updateUserTokenBalance(appState, tokenAddr)
  }
    if (!appState.smartWalletState.tokenBalances.has(tokenAddr)) {
      await updateSmartWalletTokenBalance(appState, tokenAddr)
  }
    

    let newTokenBalance, newETHBalance, amountToken, amountETH;

    if (isSwapForETH) {
      // Handling Token for ETH swap
      const tokenBalanceBefore = exchangeState.token_reserve;
      amountETH = BigNumber(amountIn).multipliedBy(exchangeState.eth_reserve).multipliedBy(0.97).dividedBy(BigNumber(tokenBalanceBefore).plus(amountIn));
      newTokenBalance = BigNumber(tokenBalanceBefore).minus(amountIn);
      newETHBalance = BigNumber(exchangeState.eth_reserve).plus(amountETH);
       if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
        
        // newState = await updateUserTokenBalance(newState, tokenAddr)
        // newState = await updateUserEthBalance(newState)
  
        let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
        let newTokenBalance = BigNumber(oldTokenBalances).minus(amountIn)
        appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());
  
        let oldETHBalances = appState.walletState.ethBalances
        let newETHBalance = BigNumber(oldETHBalances).plus(amountETH)
        appState.walletState.ethBalances = newETHBalance.toFixed()
  
       } else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
    
        // newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
        // newState = await updateSmartWalletEthBalance(newState)
  
        let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
        let newTokenBalance = BigNumber(oldTokenBalances).minus(amountIn)
        appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());
  
        let oldETHBalances = appState.smartWalletState.ethBalances
        let newETHBalance = BigNumber(oldETHBalances).plus(amountETH)
        appState.smartWalletState.ethBalances = newETHBalance.toFixed()
    
       } else {
      new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
       }
    } else {
      // Handling ETH for Token swap
      const ethBalanceBefore = exchangeState.eth_reserve;
      amountToken = BigNumber(amountIn).multipliedBy(exchangeState.token_reserve).multipliedBy(0.97).dividedBy(BigNumber(ethBalanceBefore).plus(amountIn));
      newETHBalance = BigNumber(ethBalanceBefore).minus(amountIn);
      newTokenBalance = BigNumber(exchangeState.token_reserve).plus(amountToken);
       if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
        
        newState = await updateUserTokenBalance(newState, tokenAddr)
        newState = await updateUserEthBalance(newState)
  
        let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
        let newTokenBalance = BigNumber(oldTokenBalances).plus(amountToken)
        appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());
  
        let oldETHBalances = appState.walletState.ethBalances
        let newETHBalance = BigNumber(oldETHBalances).minus(amountIn)
        appState.walletState.ethBalances = newETHBalance.toFixed()
  
       } else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
    
        newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
        newState = await updateSmartWalletEthBalance(newState)
  
        let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
        let newTokenBalance = BigNumber(oldTokenBalances).plus(amountToken)
        appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());
  
        let oldETHBalances = appState.smartWalletState.ethBalances
        let newETHBalance = BigNumber(oldETHBalances).minus(amountIn)
        appState.smartWalletState.ethBalances = newETHBalance.toFixed()
    
       } else {
      new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
       }
      
    }

    const newExchangeState = {
      eth_reserve: Number(newETHBalance),
      token_reserve: Number(newTokenBalance),
      total_shares: Number(exchangeState.total_shares),
      lps: Number(exchangeState.lps),
      tokenAddr: tokenAddr,
    };
    newState.cs251state.cs251state.set(exchange.toLowerCase(), newExchangeState);
    
   
      
    
    return newState;
  } catch (err) {
    throw err;
  }
}

  
