import BigNumber from "bignumber.js";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/";
import { simulateSwap } from "../src/Simulation/swap/SimulationSwap";
import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers"
// start test
async function test() {
  const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com")
  const chainId = Number((await provider.getNetwork()).chainId)
  
  let userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43";
  let proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE";
  let fromToken = "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6";
  let toToken = "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435";

  let appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId
  );
  console.log("Web3 is", appState.web3)
  console.log("===Before swap===")

  appState = await updateUserTokenBalance(appState, toToken)
  appState = await updateSmartWalletTokenBalance(appState, fromToken)
  appState = await updateUserTokenBalance(appState, fromToken);
  appState = await updateSmartWalletTokenBalance(appState, toToken);

  console.log("WBNB Balance", appState.walletState.tokenBalances.get(fromToken.toLowerCase()), appState.smartWalletState.tokenBalances.get(fromToken.toLowerCase()))
  console.log("TRAVA Balance", appState.walletState.tokenBalances.get(toToken.toLowerCase()), appState.smartWalletState.tokenBalances.get(toToken.toLowerCase()))
  //Swap 1000 TRAVA for 0.01 WBNB
  appState = await simulateSwap(appState, fromToken, toToken, BigNumber(1e18).toFixed(0), BigNumber(1e21).toFixed(0), userAddress, proxyAddress)
  console.log("===After swap===")
  console.log("WBNB Balance", appState.walletState.tokenBalances.get(fromToken.toLowerCase()), appState.smartWalletState.tokenBalances.get(fromToken.toLowerCase()))
  console.log("TRAVA Balance", appState.walletState.tokenBalances.get(toToken.toLowerCase()), appState.smartWalletState.tokenBalances.get(toToken.toLowerCase()))
}
test();