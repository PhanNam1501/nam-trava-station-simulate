import { simulateSendToken, simulateUnwrap, simulateWrap } from "../src/Simulation/basic/SimulationBasic";
import { updateUserEthBalance, updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers"
const test = async () => {
  console.log("=================BEFORE==========================");
  const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com")
  const chainId = Number((await provider.getNetwork()).chainId)
  let appState = await new ApplicationState(
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    provider,
    chainId
  );
  console.log("Web3 is", appState.web3)
  console.log(await appState.web3?.getBalance("0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"));
  //await Promise.all([updateUserEthBalance(appState),updateSmartWalletEthBalance(appState),updateUserTokenBalance(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"),updateSmartWalletTokenBalance(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6")]);
  appState = await updateUserEthBalance(appState);
  console.log("User Balance is", (appState.walletState.ethBalances))
  console.log("User WBNB is ", appState.walletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"));
  console.log("Smart Wallet Balance is", (appState.smartWalletState.ethBalances));
  console.log("Smart Wallet WBNB is ", appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"));

  //Wrap 0.02 BNB
  await simulateWrap(appState,"57896044618658097711785492504343953926634992332820282019728792003956564819967");

  console.log("User Balance after wrap 0.02 BNB",appState.walletState.ethBalances);
  console.log("Smart wallet WBNB after wrap",appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))

  // await simulateSendToken(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6","0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43","20000000000000000")
  // console.log("Smart wallet WBNB after send 0.02 WBNB",appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))
  // console.log("User WBNB after receive 0.02 WBNB",appState.walletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))

  // await simulateUnwrap(appState,"20000000000000000")
  // console.log("User BNB after unwrap",appState.walletState.ethBalances);

}
test()
