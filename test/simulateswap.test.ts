import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
import { simulateSwap } from "../src/Simulation/swap/SimulationSwap";
import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers"
async function test() {
  const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com")
  const chainId = Number((await provider.getNetwork()).chainId)
  let appState = new ApplicationState(
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    provider,
    chainId
  );
  console.log("Web3 is", appState.web3)
  console.log("===Before swap===")
  appState = await updateUserTokenBalance(appState,"0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37")
  appState = await updateSmartWalletTokenBalance(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6")
  appState = await updateUserTokenBalance(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6");
  appState = await updateSmartWalletTokenBalance(appState,"0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37");
  console.log("TRAVA Balance", appState.walletState.tokenBalances.get("0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37".toLowerCase()))
  console.log("WBNB Balance", appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6".toLowerCase()))
  //Swap 1000 TRAVA for 0.01 WBNB
  appState=await simulateSwap(appState, "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37", "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6", "1000000000000000000000", "100000000000000000","0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43","0x826D824BE55A403859A6Db67D5EeC5aC386307fE")
  console.log("===After swap===")
  console.log("TRAVA Balance", appState.walletState.tokenBalances.get("0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37".toLowerCase()))
  console.log("WBNB Balance", appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6".toLowerCase()))
}
test();