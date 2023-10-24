import BigNumber from "bignumber.js";
import { simulateTravaNFTCreateAuction, updateAuctioningNFTFromContract, updateCollectionBalanceFromContract, updateNFTBalanceFromContract, updateOwnedAuctioningNFT, updateSellingNFTFromContract, updateTravaBalance } from "../src/Simulation";
import { simulateTravaNFTBuy, simulateTravaNFTSell, simulateTravaNFTTransfer } from "../src/Simulation";
import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers";

// import {} from "trava-station-sdk"
const testAuction = async () => {
  // let a = new action
  console.log("=================BEFORE==========================");
  const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com")
  const chainId = Number((await provider.getNetwork()).chainId)
  let appState = new ApplicationState(
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    provider,
    chainId
  );
  appState = await updateTravaBalance(appState);
  console.log("1111111111")
  appState = await updateCollectionBalanceFromContract(appState, "walletState");
  console.log("2222222222", appState.walletState.collection)
  appState = await updateAuctioningNFTFromContract(appState);
  appState = await updateOwnedAuctioningNFT(appState);
  
  console.log("=================AFTER==========================");
  appState = await simulateTravaNFTCreateAuction(
    appState,
    105,
    BigNumber(1e22).toFixed(),
    24 * 60 * 60,
    appState.walletState.address
  )
  console.log("result", appState.walletState.collection)
  // const newState = await simulateTravaNFTBuy(
  //   appState,
  //   "4210",
  //   appState.walletState.address, // from
  //   appState.walletState.address, // to
  // );

  // console.log("0k444444444444", JSON.stringify(newState.NFTSellingState));
};

testAuction()
// testSell()
// testTransfer()
