import { ApplicationState } from "../src/State/ApplicationState";
import { JsonRpcProvider } from "ethers";
import { updateTravaBalance, updateNFTBalanceFromContract, updateCollectionBalanceFromContract, updateSellingNFTFromContract, updateSellingNFTFromGraph, updateCollectionBalanceFromGraph, updateOwnedSellingNFTFromContract, updateOwnedSellingNFT } from "../src/Simulation/trava/nft/marketplace/sell/UpdateStateAccount"
import { simulateTravaNFTBuy, simulateTravaNFTCancelSale, simulateTravaNFTSell } from "../src/Simulation/trava/nft/marketplace/sell/SimulationTravaNFT";
import { getAddr } from "../src/utils/address";

const testBuy =async () => {
  console.log("=================BEFORE==========================");
  const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com")
  const chainId = Number((await provider.getNetwork()).chainId)
  // console.log("chainId",await (await (new JsonRpcProvider("https://bsc-testnet.publicnode.com")).getNetwork()).chainId)
  const appState = new ApplicationState(
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    new JsonRpcProvider("https://bsc-testnet.publicnode.com"),
    chainId
  );
  let oldState = await updateTravaBalance(appState);
  oldState = await updateNFTBalanceFromContract(oldState, "walletState");
  oldState = await updateCollectionBalanceFromContract(oldState, "walletState"); // Lấy từ contract
  // oldState = await updateCollectionBalanceFromGraph(oldState, "walletState"); // Lấy từ graph => lỗi
  oldState = await updateSellingNFTFromContract(oldState); // Lấy từ contract
  oldState = await updateOwnedSellingNFT(oldState);
  // oldState = await updateSellingNFTFromGraph(oldState); // Lấy từ graph
  console.log((JSON.stringify(oldState.smartWalletState.sellingNFT)));
  
  let tokenId = oldState.NFTSellingState.v2[0].id || oldState.NFTSellingState.v1[0].id
  console.log(tokenId)
  let newState = await simulateTravaNFTBuy(
    oldState,
    tokenId,
    oldState.walletState.address, // from
    oldState.smartWalletState.address, // to
  );
  console.log("AFTER BUYING.....")
  console.log(JSON.stringify(newState.smartWalletState.sellingNFT));
  // newState = await simulateTravaNFTSell(
  //   newState,
  //   tokenId,
  //   BigInt(2 * 10**19).toString(),
  //   newState.smartWalletState.address
  //   );
  // console.log("AFTER SELLING.....")
  // console.log(JSON.stringify(newState.NFTSellingState.v2), (JSON.stringify(newState.NFTSellingState.v1)));
  // newState = await simulateTravaNFTCancelSale(
  //     newState,
  //   newState.walletState.address,
  //   tokenId
  // );

  // console.log("=================AFTER==========================");
  // console.log(JSON.stringify(newState.smartWalletState.sellingNFT));
  // console.log(JSON.stringify(newState.smartWalletState.nfts));
};
testBuy()