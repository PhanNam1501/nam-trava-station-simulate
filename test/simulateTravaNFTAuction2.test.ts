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

  let ownerState = new ApplicationState(
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    provider,
    chainId
  );
  ownerState = await updateTravaBalance(ownerState);
  console.log("1111111111")
  ownerState = await updateCollectionBalanceFromContract(ownerState, "walletState");
  ownerState = await updateAuctioningNFTFromContract(ownerState);
  ownerState = await updateOwnedAuctioningNFT(ownerState);
  console.log("2222222222", ownerState.NFTAuctioningState)
  
  let bidderState = new ApplicationState(
    "0xCC8FdfC90Ed30aB2Da9b53302C1ba5E976210281",
    "0x3E66FF926474Ceaa438E8ba87F36c4D69FA4792D",
    provider,
    chainId
  )
  console.log("=================AFTER==========================");
  // appState = await simulateTravaNFTCreateAuction(
  //   appState,
  //   105,
  //   BigNumber(1e22).toFixed(),
  //   24 * 60 * 60,
  //   appState.walletState.address
  // )
  // console.log("result", appState.walletState.collection)
  

  // console.log("0k444444444444", JSON.stringify(newState.NFTSellingState));
};

testAuction()
// testSell()
// testTransfer()
