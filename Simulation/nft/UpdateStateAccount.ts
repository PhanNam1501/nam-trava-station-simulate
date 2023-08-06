import { ethers } from "hardhat";
import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { abi as ABITravaLP } from "../../abis/TravaLendingPool.json";
import { abi as ERC20Mock } from "../../abis/ERC20Mock.json";
import MultiCallABI from "../../abis/Multicall.json";
import TravaNFTCoreABI from "../../abis/TravaNFTCore.json";
import TravaNFTSellABI from "../../abis/TravaNFTSell.json";
import NFTManagerABI from "../../abis/NFTManager.json";
import BEP20ABI from "../../abis/BEP20.json";
import NFTCollectionABI from "../../abis/NFTCollection.json";
import dotenv from "dotenv";
import { Interface } from "@ethersproject/abi";

const multiCall = async (abi: any, calls: any) => {
  let _provider = ethers.provider;
  const multi = new ethers.Contract(process.env.MULTI_CALL_ADDRESS, MultiCallABI, _provider);
  const itf = new Interface(abi);

  const callData = calls.map((call: any) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name as string, call.params)]);
  const { returnData } = await multi.aggregate(callData);
  return returnData.map((call: any, i: any) => itf.decodeFunctionResult(calls[i].name, call));
};

dotenv.config();

export async function updateTravaBalance(
  appState: ApplicationState
) {
  try {
    // K lấy state của smartwallet
    const TravaTokenAddress = "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37"; // Trava Token Address
    const TravaToken = await ethers.getContractAt(
      ERC20Mock,
      TravaTokenAddress
    );
    const travaBalance = await TravaToken.balanceOf(appState.walletState.address);
    appState.walletState.tokenBalances.set(TravaTokenAddress, travaBalance);
  } catch (e) {
    console.log(e);
  }
}

export async function updateNFTBalance(
  appState: ApplicationState
) {
  try {
    // Update mảnh NFT wallet
    const travacore = await ethers.getContractAt(
      TravaNFTCoreABI,
      process.env.NFT_CORE_ADDRESS
    );
    const nftCount = await travacore.balanceOf(appState.walletState.address);
    const [nftIds] = await Promise.all([
      multiCall(
        TravaNFTCoreABI,
        new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
          address: process.env.NFT_CORE_ADDRESS,
          name: "tokenOfOwnerByIndex",
          params: [appState.walletState.address, index],
        }))
      ),
    ]);
    const tokenIdsFlattened = nftIds.flat();
    const [data] = await Promise.all([
      multiCall(
        NFTManagerABI,
        tokenIdsFlattened.map((tokenId: any) => ({
          address: process.env.NFT_MANAGER_ADDRESS,
          name: "checkIfChestOpenedAndSet",
          params: [tokenId],
        }))
      ),
    ]);
    const openedTokens: any = [];
    tokenIdsFlattened.forEach((tokenId: any, index: any) => {
      const version = parseInt(data[index][0]);
      const isOpen = data[index][1];
      if (isOpen) {
        openedTokens.push({ tokenId, version });
        if(version == 1){
          appState.walletState.nfts.v1.push({id: tokenId.toString()});
        } else {
          appState.walletState.nfts.v2.push({id: tokenId.toString()});
        }
      }
    });

    // Update NFT Collection 
    // const travacollection = await ethers.getContractAt(
    //   NFTCollectionABI,
    //   process.env.NFT_COLLECTION_ADDRESS
    // );
    // const nftCount2 = await travacollection.balanceOf(appState.walletState.address);
    appState.walletState.collection.v1.push({id: "0001"}); // => Fake state cho nhanh
    appState.walletState.collection.v2.push({id: "0002"});

  } catch (e) {
    console.log(e);
  }
}

async function _fetchNormal(appState: ApplicationState, tokenIds: any) {
  const [tokenOrders, tokenMetadata] = await Promise.all([
    multiCall(
      TravaNFTSellABI,
      tokenIds.map((tokenId: any) => ({
        address: process.env.NFT_SELL_ADDRESS,
        name: "getTokenOrder",
        params: [tokenId],
      }))
    ),
    multiCall(
      TravaNFTCoreABI,
      tokenIds.map((tokenId: any) => ({
        address: process.env.NFT_CORE_ADDRESS,
        name: "getTokenMetadata",
        params: [tokenId],
      }))
    ),
  ]);
  const tokenOrdersFlattened = tokenOrders.flat();
  const tokensMetadataFlattened = tokenMetadata.flat();
  let v1 = [];
  let v2 = [];
  let counter = 0;
  const CollectionName = ["genesis", "triumph"];
  for (const tokenData of tokensMetadataFlattened) {
    const collectionId = parseInt(tokenData.collectionId);
    const collectionName = CollectionName[collectionId - 1];
    const rarity = parseInt(tokenData.tokenRarity);
    if (collectionName && rarity >= 1) {
      const id = parseInt(tokenIds[counter]);
      const price = BigInt(tokenOrdersFlattened[counter].price._hex).toString();
      const seller = tokenOrdersFlattened[counter].nftSeller;
      if (collectionId == 1) {
        appState.NFTState.nfts.v1.push({id, data: {price, seller}});
      }
      else if (collectionId == 2) {
        appState.NFTState.nfts.v2.push({id, data: {price, seller}});
      }
    }
    counter++;
  }
}

export async function updateNFTState(
  appState: ApplicationState
) {
  try {
    const nftsell = await ethers.getContractAt(
      TravaNFTSellABI,
      process.env.NFT_SELL_ADDRESS
    );
    const nftCount = await nftsell.getTokenOnSaleCount();
    const [nftIds] = await Promise.all([
      multiCall(
        TravaNFTSellABI,
        new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
          address: process.env.NFT_SELL_ADDRESS,
          name: "getTokenOnSaleAtIndex",
          params: [index],
        }))
      ),
    ]);
    const tokenIdsFlattened = nftIds.flat();

    const promises = [];
    for (var i = 0; i < tokenIdsFlattened.length; i += 500) {
      const _tokenSlice = tokenIdsFlattened.slice(i, i + 500);
      promises.push(_fetchNormal(appState, _tokenSlice));
    }
    await Promise.all(promises);
  } catch (e) {
    console.log(e);
  }
}
