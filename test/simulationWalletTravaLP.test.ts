import { updateTravaLPInfo } from "../Simulation/market/UpdateStateAccount";
import {
  SimulationSupply,
  SimulationBorrow,
  SimulationRepay,
  SimulationWithdraw,
} from "../Simulation/market/SimulationWalletTravaLP";
import { ApplicationState } from "../State/ApplicationState";
import { expect } from "chai";
import {JsonRpcProvider} from "ethers";

// start test

const test = async () => {
    console.log("================= PHASE 1 Supply ========================");
    const appState = new ApplicationState(
      "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1",
      "0x957d84Da98c5Db9e0d3d7FE667D3FA00339f3372",
      new JsonRpcProvider("https://bsc-testnet.publicnode.com"),
    );
    await updateTravaLPInfo(
      appState,
      "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1"
    );

    // console.log(
    //   "banlances before phase1 : ",
    //   appState.walletState.tokenBalances
    // );
    // console.log(
    //   "smartWalletState before phase1 : ",
    //   appState.smartWalletState.travaLPState
    // );

    const simulationSupply = await SimulationSupply(
      appState,
      "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
      "10000000000000000000"
    );

    // console.log(
    //   "banlances after phase1 : ",
    //   appState.walletState.tokenBalances
    // );
    console.log(
      "smartWalletState TravaLP after phase1 : ",
      appState.smartWalletState.travaLPState
    );
    // console.log(
    //   "smartWalletState tokens after phase1 : ",
    //   appState.smartWalletState.tokenBalances
    // );

    console.log("================= PHASE 2 Borrow ==========================");
    const simulationBorrow = await SimulationBorrow(
      appState,
      "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
      "100000000000000000"
    );
    console.log(
      "smartWalletState TravaLP after phase2 : ",
      appState.smartWalletState.travaLPState
    );
    console.log(
      "smartWalletState tokens after phase2 : ",
      appState.smartWalletState.tokenBalances
    );

    console.log("================= PHASE 3 Repay ==========================");
    const simulationRepay = await SimulationRepay(
      appState,
      "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
      "100000000000000000"
    );
    console.log(
      "smartWalletState TravaLP after phase3 : ",
      appState.smartWalletState.travaLPState
    );
    console.log(
      "smartWalletState tokens after phase3 : ",
      appState.smartWalletState.tokenBalances
    );

    console.log(
      "================= PHASE 4 Withdraw =========================="
    );
    const simulationWithdraw = await SimulationWithdraw(
      appState,
      "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
      "1000000000000000000"
    );
    console.log(
      "smartWalletState TravaLP after phase4 : ",
      appState.smartWalletState.travaLPState
    );

    console.log(
      "smartWalletState tokens after phase4 : ",
      appState.smartWalletState.tokenBalances
    );
    }
    test()