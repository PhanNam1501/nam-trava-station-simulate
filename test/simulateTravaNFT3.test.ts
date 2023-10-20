import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers";
import { updateNFTBalanceFromContract, updateOwnedSellingNFTFromContract, updateSellingNFTFromContract } from "../src/Simulation/trava/nft/marketplace/sell/UpdateStateAccount"
import { simulateTravaNFTBuy, simulateTravaNFTCancelSale } from "../src/Simulation/trava/nft/marketplace/sell/SimulationTravaNFT";
import {SwapUtil} from "trava-station-sdk";
const testBuy =async () => {
  // let a = actions.NAC()
  console.log("=================BEFORE==========================");
  const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com")
  // const swap = new SwapUtil("https://bsc-testnet.publicnode.com");
  // let res = swap.getInformationFromInput(
  //   "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
  //   "0x780397E17dBF97259F3b697Ca3a394fa483A1419",
  //   0.5 / 100, 
  //   "10000000"
  // );
  // console.log(res)
  const userAddress = "0xCC8FdfC90Ed30aB2Da9b53302C1ba5E976210281";
  const proxyAddress = "0x3E66FF926474Ceaa438E8ba87F36c4D69FA4792D";
  const chainId = Number((await provider.getNetwork()).chainId)
  console.log(chainId)
  const appState = new ApplicationState(
    userAddress,
    proxyAddress,
    new JsonRpcProvider("https://bsc-testnet.publicnode.com"),
    chainId
  );
  let oldState = await updateSellingNFTFromContract(appState);
  oldState = await updateNFTBalanceFromContract(oldState, "smartWalletState");
  console.log(JSON.stringify(oldState.NFTSellingState));
  oldState = await simulateTravaNFTBuy(oldState, "4296", userAddress, proxyAddress);
  
  // let newState = await simulateTravaNFTCancelSale(
  //   oldState,
  //   oldState.walletState.address,
  //   "4296" // k test đươc vì k bán gì cả
  // );

  console.log("=================AFTER==========================");
  console.log(JSON.stringify(oldState.smartWalletState.nfts));
};
testBuy()