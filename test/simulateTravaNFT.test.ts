import { updateTravaBalance, updateNFTBalance, updateNFTState } from "../Simulation/nft/UpdateStateAccount";
import { simulateTravaNFTBuy, simulateTravaNFTSell, simulateTravaNFTTransfer } from "../Simulation/nft/SimulationTravaNFT";
import { ApplicationState } from "../State/ApplicationState";
import {JsonRpcProvider} from "ethers";

 const testBuy =async () => {
    console.log("=================BEFORE==========================");
    const appState = new ApplicationState(
      "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
      "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
      new JsonRpcProvider("https://bsc-testnet.publicnode.com"),
      
    );
    await updateTravaBalance(appState);
    await updateNFTBalance(appState);
    await updateNFTState(appState);
    console.log(JSON.stringify(appState));

    const newState = await simulateTravaNFTBuy(
      appState,
      "4210",
      appState.walletState.address, // from
      appState.walletState.address, // to
    );

    console.log("=================AFTER==========================");
    console.log(JSON.stringify(newState));
  };
const testSell =async () => {
    console.log("=================BEFORE==========================");
    const appState = new ApplicationState(
      "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
      "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
      new JsonRpcProvider("https://bsc-testnet.publicnode.com"),
    );
    await updateTravaBalance(appState);
    await updateNFTBalance(appState);
    await updateNFTState(appState);
    console.log(JSON.stringify(appState));

    const newState = await simulateTravaNFTSell(
      appState,
      "4006",
      "10000000000000000000",
      appState.walletState.address
    );

    console.log("=================AFTER==========================");
    console.log(JSON.stringify(newState));
  };
  
  const testTransfer = async () => {
    console.log("=================BEFORE==========================");
    const appState = new ApplicationState(
      "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
      "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
      new JsonRpcProvider("https://bsc-testnet.publicnode.com"),
    );
    await updateTravaBalance(appState);
    await updateNFTBalance(appState);
    await updateNFTState(appState);
    console.log(JSON.stringify(appState));

    const newState = await simulateTravaNFTTransfer(
      appState,
      appState.walletState.address, // from
      "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1", // to
      "0001", // Token ID
      "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1" // NFT_CORE
    );

    console.log("=================AFTER==========================");
    console.log(JSON.stringify(newState));
  };
testBuy()
testSell()
testTransfer()
