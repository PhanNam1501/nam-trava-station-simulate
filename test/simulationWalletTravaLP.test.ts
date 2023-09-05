import {
  updateTravaLPInfo,
  updateLPDebtTokenInfo,
} from "../src/Simulation/market/UpdateStateAccount";
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
  const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  // second update TravaLP state for wallet
  const userData = await TravaLendingPool.getUserAccountData(userAddress);
  console.log("userData", userData.totalCollateralUSD, userData.healthFactor);
  console.log("================= PHASE 1 Supply ========================");
  const appState = new ApplicationState(
    "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1",
    "0x957d84Da98c5Db9e0d3d7FE667D3FA00339f3372",
    provider,
    chainId
  );
  const appState1 = await updateTravaLPInfo(
    appState,
    "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1"
  );

  const appState2 = await updateLPDebtTokenInfo(
    appState1,
    "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435"
  );

  // console.log(
  //   "huhu ",
  //   appState2.smartWalletState.detailTokenInPool.get(
  //     "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435"
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

  // const simulationSupply = await SimulationSupply(
  //   appState,
  //   "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
  //   "10000000000000000000"
  // );

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
  // const simulationBorrow = await SimulationBorrow(
  //   appState,
  //   "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
  //   "100000000000000000"
  // );
  // console.log(
  //   "smartWalletState TravaLP after phase2 : ",
  //   appState.smartWalletState.travaLPState
  // );
  // console.log(
  //   "smartWalletState tokens after phase2 : ",
  //   appState.smartWalletState.tokenBalances
  // );

  // console.log("================= PHASE 3 Repay ==========================");
  // const simulationRepay = await SimulationRepay(
  //   appState,
  //   "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
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
  // const simulationWithdraw = await SimulationWithdraw(
  //   appState,
  //   "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
  //   "1000000000000000000"
  // );
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
