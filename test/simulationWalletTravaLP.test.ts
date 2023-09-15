import {
  updateTravaLPInfo,
  updateLPDebtTokenInfo,
  updateLPtTokenInfo,
} from "../src/Simulation/market/UpdateStateAccount";
import { updateUserEthBalance, updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";

import {
  SimulationSupply,
  SimulationBorrow,
  SimulationRepay,
  SimulationWithdraw,
} from "../src/Simulation/market/SimulationWalletTravaLP";
import { ApplicationState } from "../src/State/ApplicationState";
import { expect } from "chai";
import { Contract, JsonRpcProvider } from "ethers";
import { getAddr } from "../src/utils/address";
import ABITravaLP from "../src/abis/TravaLendingPool.json";
import { MAX_UINT256 } from "../src/utils/config";
// start test

const test = async () => {
  const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com");
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);
  // first update token in pool balances
  const TravaLendingPool = new Contract(
    getAddr("TRAVA_LENDING_POOL_MARKET", chainId),
    ABITravaLP,
    provider
  );
  const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43";
  const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE";
  const tokenAddress = "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435";
  const amount = BigInt(10**23).toString()
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
    userAddress
  );
  const appState2 = await updateLPtTokenInfo(
    appState1,
    tokenAddress
  );

  const appState3 = await updateLPDebtTokenInfo(
    appState2,
    tokenAddress
  );

  // const appState2 = await updateLPDebtTokenInfo(
  //   appState1,
  //   tokenAddress
  // );

  // const appState3 = await SimulationRepay(
  //   appState2,
  //   tokenAddress,
  //   MAX_UINT256
  // );

  // console.log(
  //   "huhu ",
  //   appState2.smartWalletState.detailTokenInPool.get(
  //     tokenAddress
  //   )
  // );

  // // console.log(
  // //   "banlances before phase1 : ",
  // //   appState.walletState.tokenBalances
  // // );
  // console.log(
  //   "smartWalletState before phase1 : ",
  //   appState.smartWalletState.travaLPState
  // );
  console.log("Started: ", appState3.smartWalletState.travaLPState.availableBorrowsUSD)
  console.log("================= PHASE 2 Supply ==========================");
  const appState4 = await SimulationSupply(
    appState3,
    proxyAddress,
    tokenAddress,
    amount
  );

  console.log("ahuhu", appState4.smartWalletState.travaLPState);

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

  console.log("================= PHASE 2 Borrow ==========================");
  const appState5 = await SimulationBorrow(
    appState4,
    proxyAddress,
    tokenAddress,
    amount
  );
  // // console.log("ahuhu", appState5.smartWalletState.detailTokenInPool);
  console.log("ahuhu1", appState5.smartWalletState.travaLPState);
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
  //   appState,
  //   tokenAddress,
  //   "100000000000000000"
  // );
  // console.log(
  //   "smartWalletState TravaLP after phase3 : ",
  //   appState.smartWalletState.travaLPState
  // );
  // console.log(
  //   "smartWalletState tokens after phase3 : ",
  //   appState.smartWalletState.tokenBalances
  // );

  // console.log(
  //   "================= PHASE 4 Withdraw =========================="
  // );
  // const appState7 = await SimulationWithdraw(
  //   appState6,
  //   "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1",
  //   tokenAddress,
  //   "1000000000000000000"
  // );

  // // console.log("ahuhu", appState7.smartWalletState.detailTokenInPool);
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
