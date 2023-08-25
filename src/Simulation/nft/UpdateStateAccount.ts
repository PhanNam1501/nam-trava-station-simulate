import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import ERC20Mock from "../../abis/ERC20Mock.json";
import MultiCallABI from "../../abis/Multicall.json";
import TravaNFTCoreABI from "../../abis/TravaNFTCore.json";
import TravaNFTSellABI from "../../abis/TravaNFTSell.json";
import NFTManagerABI from "../../abis/NFTManager.json";
import { Contract, Interface } from "ethers";
import { getAddr } from "../../utils/address";
import _ from "lodash";

const multiCall = async (abi: any, calls: any, provider: any, chainId: any) => {
  let _provider = provider;
  const multi = new Contract(
    getAddr("MULTI_CALL_ADDRESS", chainId),
    MultiCallABI,
    _provider
  );
  const itf = new Interface(abi);

  const callData = calls.map((call: any) => [
    call.address.toLowerCase(),
    itf.encodeFunctionData(call.name as string, call.params),
  ]);
  const { returnData } = await multi.aggregate(callData);
  return returnData.map((call: any, i: any) =>
    itf.decodeFunctionResult(calls[i].name, call)
  );
};

export async function updateTravaBalance(
  appState1: ApplicationState
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    // K lấy state của smartwallet
    const TravaTokenAddress = getAddr("TRAVA_TOKEN", appState1.chainId); // Trava Token Address
    const TravaToken = new Contract(
      TravaTokenAddress,
      ERC20Mock,
      appState.web3
    );
    const travaBalance = await TravaToken.balanceOf(
      appState.walletState.address
    );
    appState.walletState.tokenBalances.set(TravaTokenAddress, travaBalance);
  } catch (e) {
    console.log(e);
  }
  return appState;
}

export async function updateNFTBalance(
  appState1: ApplicationState
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    // Update mảnh NFT wallet
    const travacore = new Contract(
      getAddr("NFT_CORE_ADDRESS", appState1.chainId),
      TravaNFTCoreABI,
      appState.web3
    );
    const nftCount = await travacore.balanceOf(appState.walletState.address);
    const [nftIds] = await Promise.all([
      multiCall(
        TravaNFTCoreABI,
        new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
          address: getAddr("NFT_CORE_ADDRESS", appState1.chainId),
          name: "tokenOfOwnerByIndex",
          params: [appState.walletState.address, index],
        })),
        appState.web3,
        appState1.chainId
      ),
    ]);
    const tokenIdsFlattened = nftIds.flat();
    const [data] = await Promise.all([
      multiCall(
        NFTManagerABI,
        tokenIdsFlattened.map((tokenId: any) => ({
          address: getAddr("NFT_MANAGER_ADDRESS", appState1.chainId),
          name: "checkIfChestOpenedAndSet",
          params: [tokenId],
        })),
        appState.web3,
        appState1.chainId
      ),
    ]);
    const openedTokens: any = [];
    tokenIdsFlattened.forEach((tokenId: any, index: any) => {
      const version = parseInt(data[index][0]);
      const isOpen = data[index][1];
      if (isOpen) {
        openedTokens.push({ tokenId, version });
        if (version == 1) {
          appState.walletState.nfts.v1.push({ id: tokenId.toString() });
        } else {
          appState.walletState.nfts.v2.push({ id: tokenId.toString() });
        }
      }
    });

    // Update NFT Collection
    // const travacollection = await ethers.getContractAt(
    //   NFTCollectionABI,
    //   CONTRACT_NETWORK.bsc.NFT_COLLECTION
    // );
    // const nftCount2 = await travacollection.balanceOf(appState.walletState.address);
    appState.walletState.collection.v1.push({ id: "0001" }); // => Fake state cho nhanh
    appState.walletState.collection.v2.push({ id: "0002" });
  } catch (e) {
    console.log(e);
  }
  return appState;
}

async function _fetchNormal(
  appState1: ApplicationState,
  tokenIds: any
): Promise<ApplicationState> {
  const appState = { ...appState1 };

  const [tokenOrders, tokenMetadata] = await Promise.all([
    multiCall(
      TravaNFTSellABI,
      tokenIds.map((tokenId: any) => ({
        address: getAddr("NFT_SELL_ADDRESS", appState1.chainId),
        name: "getTokenOrder",
        params: [tokenId],
      })),
      appState.web3,
      appState1.chainId
    ),
    multiCall(
      TravaNFTCoreABI,
      tokenIds.map((tokenId: any) => ({
        address: getAddr("NFT_CORE_ADDRESS", appState1.chainId),
        name: "getTokenMetadata",
        params: [tokenId],
      })),
      appState.web3,
      appState1.chainId
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
      const price = BigInt(tokenOrdersFlattened[counter].price).toString();
      const seller = tokenOrdersFlattened[counter].nftSeller;
      if (collectionId == 1) {
        appState.NFTState.nfts.v1.push({ id, data: { price, seller } });
      } else if (collectionId == 2) {
        appState.NFTState.nfts.v2.push({ id, data: { price, seller } });
      }
    }
    counter++;
  }
  return appState;
}

export async function updateNFTState(
  appState1: ApplicationState
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    const nftsell = new Contract(
      getAddr("NFT_SELL_ADDRESS", appState1.chainId),
      TravaNFTSellABI,
      appState.web3
    );
    const nftCount = await nftsell.getTokenOnSaleCount();
    const [nftIds] = await Promise.all([
      multiCall(
        TravaNFTSellABI,
        new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
          address: getAddr("NFT_SELL_ADDRESS", appState1.chainId),
          name: "getTokenOnSaleAtIndex",
          params: [index],
        })),
        appState.web3,
        appState1.chainId
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
  return appState;
}
