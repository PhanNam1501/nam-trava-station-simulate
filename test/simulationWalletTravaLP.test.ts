import { updateTravaLPInfo } from "../Simulation/market/UpdateStateAccount";
import { SimulationSupply } from "../Simulation/market/SimulationWalletTravaLP";
import { ApplicationState } from "../State/ApplicationState";
import { expect } from "chai";

// start test

describe("Test SimulationWalletTravaLP", () => {
  it("Test Simulation Supply", async () => {
    console.log("=================PHASE 1==========================");
    const appState = new ApplicationState(
      "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1",
      "0x957d84Da98c5Db9e0d3d7FE667D3FA00339f3372"
    );
    await updateTravaLPInfo(
      appState,
      "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1"
    );

    console.log(
      "banlances before phase1 : ",
      appState.walletState.tokenBalances
    );
    console.log(
      "smartWalletState before phase1 : ",
      appState.smartWalletState.travaLPState
    );

    const simulationSupply = await SimulationSupply(
      appState,
      "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
      1000000000000000
    );

    console.log(
      "banlances after phase1 : ",
      appState.walletState.tokenBalances
    );
    console.log(
      "smartWalletState after phase1 : ",
      appState.smartWalletState.travaLPState
    );

    console.log("=================PHASE 2==========================");

    const simulationSupply2 = await SimulationSupply(
      appState,
      "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
      1000000000000000
    );

    console.log(
      "banlances after phase2 : ",
      appState.walletState.tokenBalances
    );

    console.log(
      "smartWalletState after phase2 : ",
      appState.smartWalletState.travaLPState
    );
  });
});
