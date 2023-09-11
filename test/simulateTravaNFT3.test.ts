import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers";
import { updateOwnedSellingNFTFromContract } from "../src/Simulation/nft/UpdateStateAccount"
import { simulateTravaNFTCancelSale } from "../src/Simulation/nft/SimulationTravaNFT";
// import {actions} from "trava-station-sdk";
const testBuy =async () => {
  // let a = actions.NAC()
  console.log("=================BEFORE==========================");
  const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com")
  const chainId = Number((await provider.getNetwork()).chainId)
  const appState = new ApplicationState(
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    new JsonRpcProvider("https://bsc-testnet.publicnode.com"),
    chainId
  );
  let oldState = await updateOwnedSellingNFTFromContract(appState, "walletState");
  oldState = await updateOwnedSellingNFTFromContract(appState, "smartWalletState");
  console.log(JSON.stringify(oldState.smartWalletState.sellingNFT));
  
  // let newState = await simulateTravaNFTCancelSale(
  //   oldState,
  //   oldState.walletState.address,
  //   "4625" // k test đươc vì k bán gì cả
  // );

  console.log("=================AFTER==========================");
  // console.log(JSON.stringify(newState));
};
testBuy()