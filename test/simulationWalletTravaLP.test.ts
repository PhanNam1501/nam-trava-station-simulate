import {
  updateTravaLPInfo,
  updateLPDebtTokenInfo,
  updateLPtTokenInfo,
  updateLPtTokenInfoInW
} from "../src/Simulation/trava/market/UpdateStateAccount";
import { updateUserEthBalance, updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";

import {
  SimulationSupply,
  SimulationBorrow,
  SimulationRepay,
  SimulationWithdraw,
  calculateMaxAmountBorrow,
  calculateMaxAmountWithdraw,
  SimulationTransfer
} from "../src/Simulation/trava/market/SimulationWalletTravaLP";

import {
  simulateSendToken
} from "../src/Simulation/basic/SimulationBasic";
import { ApplicationState } from "../src/State/ApplicationState";
import { expect } from "chai";
import { Contract, JsonRpcProvider } from "ethers";
import { getAddr } from "../src/utils/address";
import ABITravaLP from "../src/abis/TravaLendingPool.json";
import { MAX_UINT256 } from "../src/utils/config";
import BigNumber from "bignumber.js";
// start 

const test = async () => {
  const provider = new JsonRpcProvider("https://bsc.publicnode.com");
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);
  // first update token in pool balances
  const TravaLendingPool = new Contract(
    getAddr("TRAVA_LENDING_POOL_MARKET", chainId),
    ABITravaLP,
    provider
  );
  const userAddress = "0x68a6c841040B05D60434d81000f523Bf6355b31D";
  const proxyAddress = "0x72DE03F7828a473A64b4A415bD76820EBAFf2B2C";
  const tokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
  const amount = BigNumber(0)
  // second update TravaLP state for wallet
  const userData = await TravaLendingPool.getUserAccountData(userAddress);
  console.log("userData", userData.totalCollateralUSD, userData.healthFactor);
  console.log("================= PHASE 1 Supply ========================");
  const appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId
  );
  
  const appState11 = await updateUserTokenBalance(
    appState,
    tokenAddress
    );

  const appState12 = await updateSmartWalletTokenBalance(
    appState11,
    tokenAddress
    );

    const appState1 = await updateTravaLPInfo( 
      appState12,
      );
    
  //   console.log("Started: ", appState1.smartWalletState.travaLPState)
  // const appState2 = await updateLPtTokenInfo(
  //   appState1,
  //   tokenAddress
  // );

  // const appState3 = await updateLPDebtTokenInfo(
  //   appState2,
  //   tokenAddress
  // );

  // const appState2 = await updateLPDebtTokenInfo(
  //   appState1,
  //   tokenAddress
  // );

  // const appState3 = await SimulationRepay(
  //   appState2,
  //   userAddress,
  //   tokenAddress,
  //   MAX_UINT256
  // );

  //console.log(appState2.smartWalletState.detailTokenInPool.get(tokenAddress.toLowerCase()));

  // // console.log(
  // //   "banlances before phase1 : ",
  // //   appState.walletState.tokenBalances
  // // );
  // console.log(
  //   "smartWalletState before phase1 : ",
  //   appState.smartWalletState.travaLPState
  // );
  //console.log("Started: ", appState1.smartWalletState.travaLPState, appState1.smartWalletState.tokenBalances.get(tokenAddress.toLowerCase()), calculateMaxAmountWithdraw(appState1, tokenAddress).toFixed())
  // const appState31 = await simulateSendToken(
  //   appState1,
  //   tokenAddress,
  //   userAddress,
  //   proxyAddress,
  //   amount.multipliedBy(2).toFixed(0)
  // )
  // console.log("ahuhu", appState31.smartWalletState.tokenBalances.get(tokenAddress.toLowerCase()));
  // console.log("================= PHASE 2 Supply ==========================");
  const appState4 = await SimulationSupply(
    appState1,
    proxyAddress,
    tokenAddress,
    BigNumber(3e18).toFixed()
  );

  const appState5 = await SimulationTransfer(
    appState4,
    proxyAddress,
    userAddress,
    tokenAddress,
    BigNumber(1e18).toFixed()
  )


  console.log("final");
  console.log(appState5.smartWalletState.detailTokenInPool.get(tokenAddress.toLowerCase())?.tToken);
  console.log(appState5.walletState.detailTokenInPool.get(tokenAddress.toLowerCase())?.tToken);
  

  // console.log("ahuhu1", appState4.smartWalletState.travaLPState, appState4.smartWalletState.tokenBalances.get(tokenAddress.toLowerCase()), calculateMaxAmountBorrow(appState4, tokenAddress).toFixed());

  // // console.log(
  // //   "banlances after phase1 : ",
  // //   appState.walletState.tokenBalances
  // // );
  // console.log(
  //   "smartWalletState TravaLP after phase1 : ",
  //   appState.smartWalletState.travaLPState
  // );
  // // console.log(
  // //   "smartWalletState tokens after phase1 : ",
  // //   appState.smartWalletState.tokenBalances
  // // );

  // console.log("================= PHASE 2 Borrow ==========================");
  // const appState5 = await SimulationBorrow(
  //   appState4,
  //   proxyAddress,
  //   tokenAddress,
  //   BigNumber(10).toFixed(0)
  // );
  // console.log("ahuhu", appState5.smartWalletState.travaLPState);
  // console.log("ahuhu1", appState5.smartWalletState.travaLPState);
  // console.log(
  //   "smartWalletState TravaLP after phase2 : ",
  //   appState.smartWalletState.travaLPState
  // );
  // console.log(
  //   "smartWalletState tokens after phase2 : ",
  //   appState.smartWalletState.tokenBalances
  // );

  // console.log("================= PHASE 3 Repay ==========================");

  // const appState6 = await SimulationRepay(
  //   appState5,
  //   "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1",
  //   tokenAddress,
  //   MAX_UINT256
  // );

  // // console.log("ahuhu", appState6.smartWalletState.detailTokenInPool);
  // console.log("ahuhu2", appState6.smartWalletState.travaLPState);

  // const simulationRepay = await SimulationRepay(
  //   appState4,
  //   userAddress,
  //   tokenAddress,
  //   BigNumber(1e9).toFixed(0)
  // );
  // console.log(
  //   "smartWalletState TravaLP after phase3 : ",
  //   simulationRepay.smartWalletState.travaLPState
  // );
  // console.log(
  //   "smartWalletState tokens after phase3 : ",
  //   appState.smartWalletState.tokenBalances
  // );

  // console.log(
  //   "================= PHASE 4 Withdraw =========================="
  // );
  // const appState7 = await SimulationWithdraw(
  //   appState4,
  //   "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1",
  //   tokenAddress,
  //   BigNumber(1e23).div(3).toFixed(0)
  // );

  // console.log("ahuhu", appState7.smartWalletState.travaLPState, calculateMaxAmountWithdraw(appState7, tokenAddress).toFixed(0));
  // console.log("ahuhu3", appState7.smartWalletState.travaLPState);

  // console.log(
  //   "smartWalletState TravaLP after phase4 : ",
  //   appState.smartWalletState.travaLPState
  // );

  // console.log(
  //   "smartWalletState tokens after phase4 : ",
  //   appState.smartWalletState.tokenBalances
  // );
};
test();
