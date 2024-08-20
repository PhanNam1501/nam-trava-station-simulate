import { BigNumber } from "bignumber.js";
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


// interface LiquidityPoolState {
//   tokenAmount: BigNumber;
//   ethAmount: BigNumber;
//   shares: BigNumber;
// }
// interface UserBalances {
//     ethBalance: BigNumber;
//     tokenBalance: BigNumber;
    
// }
// interface RemoveLiquidityResult {
//     maxEth: BigNumber;
//     maxTokens: BigNumber;
//     maxShares: BigNumber;
//   }

// const multiplier = new BigNumber(10 ** 5);
// const swapFeeNumerator = new BigNumber(3);
// const swapFeeDenominator = new BigNumber(100);



  

  // export function calculateMaxAmountTransferTToken(appState: ApplicationState, _tokenAddress: string, _from: EthAddress): BigNumber {
  //   let modeFrom = getMode(appState, _from);
  //   let tokenAddress = _tokenAddress.toLowerCase();
  //   let tokenInfo = appState[modeFrom].detailTokenInPool.get(tokenAddress.toLowerCase())!;
  
  //   if (typeof tokenInfo == undefined) {    
  //     throw new Error("Token is not init in lending pool state!")
  //   }
  //   const depositedRaw = tokenInfo.tToken.balances;
  //   const deposited = BigNumber(depositedRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
  
  //   const tTokenReserveBalanceRaw = tokenInfo.tToken.originToken.balances;
  //   const tTokenReserveBalance = BigNumber(tTokenReserveBalanceRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
  
  //   let nativeAvailableTransfer = BigNumber(appState[modeFrom].travaLPState.totalCollateralUSD)
  //     .minus(BigNumber(appState[modeFrom].travaLPState.totalDebtUSD).div(BigNumber(appState[modeFrom].travaLPState.ltv)))
  //     .div(tokenInfo.price);
  //   const available = BigNumber(tokenInfo.tToken.totalSupply).minus(tokenInfo.dToken.totalSupply).div(tokenInfo.price);
  
  //   if (nativeAvailableTransfer.isNaN()) {
  //     nativeAvailableTransfer = BigNumber(0);
  //   }
  
  //   return BigNumber.max(
  //     BigNumber.min(deposited, nativeAvailableTransfer, tTokenReserveBalance, available),
  //     0
  //   ).multipliedBy(BigNumber("10").pow(tokenInfo.tToken.decimals))
  // }
  // export function calculateNewLiquidThreshold(oldTotalColleteral: BigNumber, oldLiqThres: BigNumber, newTotalCollateral: BigNumber, tokenLiqThres: BigNumber): BigNumber {
  //   if (newTotalCollateral.toFixed(0) == "0") {
  //     return BigNumber(0);
  //   }
  //   let usd_changed = newTotalCollateral.minus(oldTotalColleteral);
  //   let newLiqThres = oldTotalColleteral
  //     .multipliedBy(oldLiqThres)
  //     .plus(usd_changed.multipliedBy(tokenLiqThres))
  //     .div(newTotalCollateral)
  //   return newLiqThres
  // }


  



export async function getExchangeRate(appState: ApplicationState, exchange:EthAddress){
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
  exchange:EthAddress,
  tokenAddr: EthAddress, // Declare and provide a value for tokenAddr
  from: EthAddress,
  amountETH: uint256,

): Promise<ApplicationState> {
  try {
    appState = await updateCS251State(appState, exchange, false);
    // Create a copy of the appState to avoid mutating the original state
    let newState = { ...appState };

    let exchangeState = newState.cs251state.cs251state.get(exchange)!

    const oldETHReserve = exchangeState.eth_reserve
    const newETHReserve = BigNumber(oldETHReserve).plus(amountETH)
    
    const oldtotalshare = exchangeState.total_shares
    const newtotalshare = BigNumber(oldtotalshare).plus(BigNumber(amountETH).multipliedBy(oldtotalshare).dividedBy(newETHReserve))
    

    const oldLps = exchangeState.lps
    const newLps = BigNumber(oldLps).plus(BigNumber(amountETH).multipliedBy(oldLps).dividedBy(newETHReserve))
    
   // Calculate the amount of tokens to add to the liquidity pool based on the reserves
    const tokenAmount = BigNumber(amountETH).multipliedBy(exchangeState?.token_reserve).dividedBy(exchangeState.eth_reserve);
    const oldTokenReserves = exchangeState.token_reserve
    const newTokenReserve = BigNumber(oldTokenReserves).plus(tokenAmount);

    const newExchangeState: cs251statechange = {
      eth_reserve: newETHReserve.toFixed(),
      token_reserve: newTokenReserve.toFixed(),
      total_shares: newtotalshare.toFixed(),
      lps: newLps.toFixed(),
    }
    newState.cs251state.cs251state.set(exchange, newExchangeState)


    if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
      
      newState = await updateUserTokenBalance(newState, tokenAddr)
      newState = await updateUserEthBalance(newState)

      let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
      let newTokenBalance = BigNumber(oldTokenBalances).minus(tokenAmount)
      appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

      let oldETHBalances = appState.walletState.ethBalances
      let newETHBalance = BigNumber(oldETHBalances).minus(amountETH)
      appState.walletState.ethBalances = newETHBalance.toFixed()

  } else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
    
    newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
    newState = await updateSmartWalletEthBalance(newState)

    let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
    let newTokenBalance = BigNumber(oldTokenBalances).minus(tokenAmount)
    appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

    let oldETHBalances = appState.smartWalletState.ethBalances
    let newETHBalance = BigNumber(oldETHBalances).minus(amountETH)
    appState.smartWalletState.ethBalances = newETHBalance.toFixed()
    
  } else {
      new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
  }
  //check if amountETH within the exchangerate
  // const exchangeRate = await getExchangeRate(appState, exchange)
  // if (exchangeRate.isLessThan(amountETH)){
  //   throw new Error("AmountETH is greater than the exchange rate")
  // }
  // if (exchangeRate.isGreaterThan(amountETH)){
  //   throw new Error("AmountETH is less than the exchange rate")
  // }


    return newState;
  } catch (err) {
    throw err;
  }
}

// Remove Liquidity     
export async function removeLiquidity(   
  appState: ApplicationState,
  exchange: EthAddress,
  tokenAddr: EthAddress, // Declare and provide a value for tokenAddr
  // maxSlippage: uint256,
  // minSlippage: uint256,
  amountETH: uint256,
  to:EthAddress,

): Promise<ApplicationState> {
  try {
    appState = await updateCS251State(appState, exchange, false);
    // Create a copy of the appState to avoid mutating the original state
    let newState = { ...appState };

    let exchangeState = newState.cs251state.cs251state.get(exchange)!
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

    const newExchangeState: cs251statechange = {
      eth_reserve: newETHReserve.toFixed(),
      token_reserve: newTokenReserve.toFixed(),
      total_shares: newtotalshare.toFixed(),
      lps: newLps.toFixed(),
    }
    newState.cs251state.cs251state.set(exchange, newExchangeState)
    //check max
    if (ethwithdraw.toFixed(0) == MAX_UINT256 || ethwithdraw.isEqualTo(MAX_UINT256)) {
      ethwithdraw = BigNumber(exchangeState.lps).multipliedBy(exchangeState.eth_reserve).dividedBy(exchangeState.total_shares);
    }


    if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      
      newState = await updateUserTokenBalance(newState, tokenAddr)
      newState = await updateUserEthBalance(newState)

      let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
      let newTokenBalance = BigNumber(oldTokenBalances).plus(tokenwithdraw)
      appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

      let oldETHBalances = appState.walletState.ethBalances
      let newETHBalance = BigNumber(oldETHBalances).plus(ethwithdraw)
      appState.walletState.ethBalances = newETHBalance.toFixed()

  } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
    
    newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
    newState = await updateSmartWalletEthBalance(newState)

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




// Swap Tokens
// export async function swapETHforTokens(
//   appState: ApplicationState,
//   exchange:EthAddress,
//   amountIn: uint256,
//   // maxSlippage:uint256,
//   from:EthAddress,
//   to:EthAddress,
//   tokenAddr:EthAddress,
// ):Promise<ApplicationState> {
//   try {
//     appState = await updateCS251State(appState, exchange, false);
//     // Create a copy of the appState to avoid mutating the original state
//     let newState = { ...appState };

//     let exchangeState = newState.cs251state.cs251state.get(exchange)!
//     //check max amount to swap

//     const tokenBalanceBefore =exchangeState.token_reserve
//     const amountToken = BigNumber(amountIn).multipliedBy(exchangeState.token_reserve).multipliedBy(0.97).dividedBy(BigNumber(exchangeState.eth_reserve).plus(amountIn))
//     const tokenBalanceAfter = BigNumber(tokenBalanceBefore).plus(amountToken)
//     const ethBalanceBefore = exchangeState.eth_reserve
//     const newETHReserve = BigNumber(ethBalanceBefore).minus(amountIn)
//     const newtotalshare = BigNumber(exchangeState.total_shares)
//     const newLps = BigNumber(exchangeState.lps)
//     const newExchangeState: cs251statechange = {
//       eth_reserve: newETHReserve.toFixed(),
//       token_reserve: tokenBalanceAfter.toFixed(),
//       total_shares: newtotalshare.toFixed(),
//       lps: newLps.toFixed(),
//     }
//     newState.cs251state.cs251state.set(exchange, newExchangeState)
//     if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      
//       newState = await updateUserTokenBalance(newState, tokenAddr)
//       newState = await updateUserEthBalance(newState)

//       let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
//       let newTokenBalance = BigNumber(oldTokenBalances).plus(amountToken)
//       appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

//       let oldETHBalances = appState.walletState.ethBalances
//       let newETHBalance = BigNumber(oldETHBalances).minus(amountIn)
//       appState.walletState.ethBalances = newETHBalance.toFixed()

//   } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
    
//     newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
//     newState = await updateSmartWalletEthBalance(newState)

//     let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
//     let newTokenBalance = BigNumber(oldTokenBalances).plus(amountToken)
//     appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

//     let oldETHBalances = appState.smartWalletState.ethBalances
//     let newETHBalance = BigNumber(oldETHBalances).minus(amountIn)
//     appState.smartWalletState.ethBalances = newETHBalance.toFixed()
    
//   } else {
//       new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
//   }
//   if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
      
//     newState = await updateUserTokenBalance(newState, tokenAddr)
//     newState = await updateUserEthBalance(newState)

//     let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
//     let newTokenBalance = BigNumber(oldTokenBalances).minus(amountToken)
//     appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

//     let oldETHBalances = appState.walletState.ethBalances
//     let newETHBalance = BigNumber(oldETHBalances).minus(amountIn)
//     appState.walletState.ethBalances = newETHBalance.toFixed()

// } else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
  
//   newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
//   newState = await updateSmartWalletEthBalance(newState)

//   let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
//   let newTokenBalance = BigNumber(oldTokenBalances).minus(amountToken)
//   appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

//   let oldETHBalances = appState.smartWalletState.ethBalances
//   let newETHBalance = BigNumber(oldETHBalances).minus(amountToken)
//   appState.smartWalletState.ethBalances = newETHBalance.toFixed()
  
// } else {
//     new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
// }
    
    

//     return newState;
//   } catch (err) {
//     throw err;
//   }
  
// }

// export async function swapTokenforETH(
//   appState: ApplicationState,
//   exchange:EthAddress,
//   amountIn: uint256,
//   // maxSlippage:uint256,
//   from:EthAddress,
//   to:EthAddress,
//   tokenAddr:EthAddress,
// ):Promise<ApplicationState> {
//   try {
//     appState = await updateCS251State(appState, exchange, false);
//     // Create a copy of the appState to avoid mutating the original state
//     let newState = { ...appState };

//     let exchangeState = newState.cs251state.cs251state.get(exchange)!
//     //check max amount to swap

//     const ethBalanceBefore =exchangeState.eth_reserve
//     const amountETH = BigNumber(amountIn).multipliedBy(exchangeState.eth_reserve).multipliedBy(0.97).dividedBy(BigNumber(exchangeState.token_reserve).plus(amountIn))
//     const ethBalanceAfter = BigNumber(ethBalanceBefore).plus(amountETH)
//     const tokenBalanceBefore = exchangeState.token_reserve
//     const newtokenReserve = BigNumber(tokenBalanceBefore).minus(amountIn)
//     const newtotalshare = BigNumber(exchangeState.total_shares)
//     const newLps = BigNumber(exchangeState.lps)
//     const newExchangeState: cs251statechange = {
//       eth_reserve: ethBalanceAfter.toFixed(),
//       token_reserve: newtokenReserve.toFixed(),
//       total_shares: newtotalshare.toFixed(),
//       lps: newLps.toFixed(),
//     }
//     newState.cs251state.cs251state.set(exchange, newExchangeState)
//     if (BigNumber(amountIn).toFixed(0) == MAX_UINT256 || BigNumber(amountIn).isEqualTo(MAX_UINT256)) {
//       amountIn=(exchangeState.token_reserve);
//     }
//     if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      
//       newState = await updateUserTokenBalance(newState, tokenAddr)
//       newState = await updateUserEthBalance(newState)

//       let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
//       let newTokenBalance = BigNumber(oldTokenBalances).minus(amountIn)
//       appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

//       let oldETHBalances = appState.walletState.ethBalances
//       let newETHBalance = BigNumber(oldETHBalances).plus(amountETH)
//       appState.walletState.ethBalances = newETHBalance.toFixed()

//     } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
    
//       newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
//       newState = await updateSmartWalletEthBalance(newState)

//       let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
//       let newTokenBalance = BigNumber(oldTokenBalances).minus(amountIn)
//       appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

//       let oldETHBalances = appState.smartWalletState.ethBalances
//       let newETHBalance = BigNumber(oldETHBalances).plus(amountETH)
//       appState.smartWalletState.ethBalances = newETHBalance.toFixed()
    
//     } else {
//       new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
//     }
//     if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
      
//       newState = await updateUserTokenBalance(newState, tokenAddr)
//       newState = await updateUserEthBalance(newState)

//       let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
//       let newTokenBalance = BigNumber(oldTokenBalances).minus(amountIn)
//       appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

//       let oldETHBalances = appState.walletState.ethBalances
//       let newETHBalance = BigNumber(oldETHBalances).plus(amountETH)
//       appState.walletState.ethBalances = newETHBalance.toFixed()

//     } else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
  
//       newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
//       newState = await updateSmartWalletEthBalance(newState)

//       let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
//       let newTokenBalance = BigNumber(oldTokenBalances).minus(amountIn)
//       appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());

//       let oldETHBalances = appState.smartWalletState.ethBalances
//       let newETHBalance = BigNumber(oldETHBalances).plus(amountETH)
//       appState.smartWalletState.ethBalances = newETHBalance.toFixed()
  
//     } else {
//     new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
//     }
    
    

//     return newState;
//   } catch (err) {
//     throw err;
//   }
  
// }
export async function swapAssets(
  appState: ApplicationState,
  exchange: EthAddress,
  amountIn: uint256,
  from: EthAddress,
  to: EthAddress,
  tokenAddr: EthAddress,
  isSwapForETH: boolean // true for Token for ETH, false for ETH for Token
): Promise<ApplicationState> {
  try {
    // Update the state with the current exchange details
    appState = await updateCS251State(appState, exchange, false);
    let newState = { ...appState };
    let exchangeState = newState.cs251state.cs251state.get(exchange)!;

    let newTokenBalance, newETHBalance, amountToken, amountETH;

    if (isSwapForETH) {
      // Handling Token for ETH swap
      const tokenBalanceBefore = exchangeState.token_reserve;
      amountETH = BigNumber(amountIn).multipliedBy(exchangeState.eth_reserve).multipliedBy(0.97).dividedBy(BigNumber(tokenBalanceBefore).plus(amountIn));
      newTokenBalance = BigNumber(tokenBalanceBefore).minus(amountIn);
      newETHBalance = BigNumber(exchangeState.eth_reserve).plus(amountETH);
      if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      
        newState = await updateUserTokenBalance(newState, tokenAddr)
        newState = await updateUserEthBalance(newState)
  
        let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
        let newTokenBalance = BigNumber(oldTokenBalances).minus(amountIn)
        appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());
  
        let oldETHBalances = appState.walletState.ethBalances
        let newETHBalance = BigNumber(oldETHBalances).plus(amountETH)
        appState.walletState.ethBalances = newETHBalance.toFixed()
  
       } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      
        newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
        newState = await updateSmartWalletEthBalance(newState)
  
        let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase())!
        let newTokenBalance = BigNumber(oldTokenBalances).minus(amountIn)
        appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());
  
        let oldETHBalances = appState.smartWalletState.ethBalances
        let newETHBalance = BigNumber(oldETHBalances).plus(amountETH)
        appState.smartWalletState.ethBalances = newETHBalance.toFixed()
      
       } else {
        new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
       }
       if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
        
        newState = await updateUserTokenBalance(newState, tokenAddr)
        newState = await updateUserEthBalance(newState)
  
        let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
        let newTokenBalance = BigNumber(oldTokenBalances).minus(amountIn)
        appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());
  
        let oldETHBalances = appState.walletState.ethBalances
        let newETHBalance = BigNumber(oldETHBalances).plus(amountETH)
        appState.walletState.ethBalances = newETHBalance.toFixed()
  
       } else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
    
        newState = await updateSmartWalletTokenBalance(newState, tokenAddr)
        newState = await updateSmartWalletEthBalance(newState)
  
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
      if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      
        newState = await updateUserTokenBalance(newState, tokenAddr)
        newState = await updateUserEthBalance(newState)
  
        let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase())!
        let newTokenBalance = BigNumber(oldTokenBalances).plus(amountToken)
        appState.walletState.tokenBalances.set(tokenAddr.toLowerCase() , newTokenBalance.toFixed());
  
        let oldETHBalances = appState.walletState.ethBalances
        let newETHBalance = BigNumber(oldETHBalances).minus(amountIn)
        appState.walletState.ethBalances = newETHBalance.toFixed()
  
       } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
        amountETH =  BigNumber(amountIn).multipliedBy(exchangeState.token_reserve).multipliedBy(0.97).dividedBy(BigNumber(ethBalanceBefore).plus(amountIn));
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

    // Set the new state for the exchange
    const newExchangeState = {
      eth_reserve: newETHBalance.toFixed(),
      token_reserve: newTokenBalance.toFixed(),
      total_shares: BigNumber(exchangeState.total_shares).toFixed(),
      lps: BigNumber(exchangeState.lps).toFixed(),
    };
    newState.cs251state.cs251state.set(exchange, newExchangeState);
    
   
      
    
    return newState;
  } catch (err) {
    throw err;
  }
}

  

// Example usage
// try {
//   const exchange: EthAddress = "0x32cF813649E43D410E16A7b400A5134E5Aa77837"; 
//   const tokenAddr: EthAddress = "0x345dCB7B8F17D342A3639d1D9bD649189f2D0162";
//   const maxSlippage: uint256 ="";
//   const minSlippage: uint256 ="";
//   const from: EthAddress = "0x13Ef8aDFE85985875007877d3E3B59fCCDc4cb78"; 
//   const amountETH: uint256 ="0.001";
//   const to:EthAddress="0x13Ef8aDFE85985875007877d3E3B59fCCDc4cb78";
//   const amountIn : uint256 = "0.001";
//   AppState = addLiquidity(appState, exchange, tokenAddr, maxSlippage, minSlippage, from, amountETH);
//   console.log("State after adding liquidity:", appState);

//   appState = removeLiquidity(appState, exchange, tokenAddr, maxSlippage, minSlippage, amountETH, to);
//   console.log("Removed Liquidity:", appState);

//   appState = swapTokens(appState, exchange, amountIn, maxSlippage,from, to);
//   console.log("Tokens received for swapping 1 ETH:", appState);
// } catch (error) {
//   console.error(error);
// }
