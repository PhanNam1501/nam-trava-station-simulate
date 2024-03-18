import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers";
import { updateTravaBalance, updateNFTBalanceFromContract, updateCollectionBalanceFromContract, updateSellingNFTFromContract, updateSellingNFTFromGraph, updateCollectionBalanceFromGraph, updateOwnedSellingNFTFromContract, updateOwnedSellingNFT } from "../src/Simulation"
import { simulateTravaNFTBuy, simulateTravaNFTCancelSale, simulateTravaNFTSell } from "../src/Simulation";
import { getAddr } from "../src/utils/address";

const testBuy =async () => {
  console.log("=================BEFORE==========================");
  const provider = new JsonRpcProvider("https://bsc.publicnode.com")
  const chainId = Number((await provider.getNetwork()).chainId)
  // console.log("chainId",await (await (new JsonRpcProvider("https://bsc-testnet.publicnode.com")).getNetwork()).chainId)
  let appState = new ApplicationState(
    "0xFA5aB4faF47d3515048b8a030b1e2146F637691C",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    provider,
    chainId
  );
  appState = await updateCollectionBalanceFromContract(appState, "walletState");
  console.log(appState.walletState.collection)

  // console.log("=================AFTER==========================");
  // console.log(JSON.stringify(newState.smartWalletState.sellingNFT));
  // console.log(JSON.stringify(newState.smartWalletState.nfts));
};
testBuy()