import { updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
import { simulateSwap } from "../src/Simulation/swap/SimulationSwap";
import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers"
import {
  updateTravaLPInfo,
  updateLPDebtTokenInfo,
  updateLPtTokenInfo,
} from "../src/Simulation/market/UpdateStateAccount";
import {
  SimulationSupply,
  SimulationBorrow,
  SimulationRepay,
  SimulationWithdraw,
} from "../src/Simulation/market/SimulationWalletTravaLP";
import { expect } from "chai";
import { getAddr } from "../src/utils/address";
import ABITravaLP from "../src/abis/TravaLendingPool.json";
import { MAX_UINT256 } from "../src/utils/config";
// start test
async function test() {
  const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com");
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);

  console.log(provider, chainId)
  const appState = new ApplicationState(
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    provider,
    chainId
  );
  console.log("Web3 is", appState)
  await Promise.all([updateUserTokenBalance(appState, "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435"), updateUserTokenBalance(appState, "0xFca3Cf5E82F595D4f20C24D007ae5E2e94fab2f0")])
  console.log("===Before swap===")
  console.log("TRAVA Balance", appState.walletState.tokenBalances.get("0xE1F005623934D3D8C724EC68Cc9bFD95498D4435".toLowerCase()))
  console.log("WBNB Balance", appState.walletState.tokenBalances.get("0xFca3Cf5E82F595D4f20C24D007ae5E2e94fab2f0".toLowerCase()))
  //Swap 1000 TRAVA for 0.01 WBNB
  await simulateSwap(appState, "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435", "0xFca3Cf5E82F595D4f20C24D007ae5E2e94fab2f0", "1000000000000000000000", "100000000000000000")
  console.log("===After swap===")
  console.log("TRAVA Balance", appState.walletState.tokenBalances.get("0xE1F005623934D3D8C724EC68Cc9bFD95498D4435".toLowerCase()))
  console.log("WBNB Balance", appState.walletState.tokenBalances.get("0xFca3Cf5E82F595D4f20C24D007ae5E2e94fab2f0".toLowerCase()))
}
test();