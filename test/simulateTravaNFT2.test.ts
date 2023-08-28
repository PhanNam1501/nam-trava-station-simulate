import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers";
import { updateTravaBalance, updateNFTBalanceFromContract, updateCollectionBalanceFromContract, updateSellingNFTFromContract, updateSellingNFTFromGraph, updateCollectionBalanceFromGraph } from "../src/Simulation/nft/UpdateStateAccount"
import { simulateTravaNFTBuy, simulateTravaNFTSell, simulateTravaNFTTransfer } from "../src/Simulation/nft/SimulationTravaNFT";
import { getAddr } from "../src/utils/address";

const testBuy =async () => {
  console.log("=================BEFORE==========================");
  const appState = new ApplicationState(
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    new JsonRpcProvider("https://bsc-testnet.publicnode.com"),
    97
  );
  let oldState = await updateTravaBalance(appState);
  oldState = await updateNFTBalanceFromContract(oldState, "walletState");
  oldState = await updateCollectionBalanceFromContract(oldState, "walletState"); // Lấy từ contract
  // oldState = await updateCollectionBalanceFromGraph(oldState, "walletState"); // Lấy từ graph => lỗi
  oldState = await updateSellingNFTFromContract(oldState); // Lấy từ contract
  // oldState = await updateSellingNFTFromGraph(oldState); // Lấy từ graph
  console.log(JSON.stringify(oldState));
  
  let newState = await simulateTravaNFTBuy(
    oldState,
    "5536",
    oldState.walletState.address, // from
    oldState.walletState.address, // to
  );
  newState = await simulateTravaNFTSell(
    newState,
    "4006",
    "10",
    newState.walletState.address
  );
  newState = await simulateTravaNFTTransfer(
    newState,
    newState.walletState.address,
    newState.smartWalletState.address,
    "4062",
    getAddr("NFT_CORE_ADDRESS", newState.chainId)
  );

  console.log("=================AFTER==========================");
  console.log(JSON.stringify(newState));
};
testBuy()