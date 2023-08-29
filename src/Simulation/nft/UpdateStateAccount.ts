import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import ERC20Mock from "../../abis/ERC20Mock.json";
import MultiCallABI from "../../abis/Multicall.json";
import TravaNFTCoreABI from "../../abis/TravaNFTCore.json";
import NFTCollectionABI from "../../abis/NFTCollection.json";
import TravaNFTSellABI from "../../abis/TravaNFTSell.json";
import NFTManagerABI from "../../abis/NFTManager.json";
import { Contract, Interface } from "ethers";
import { getAddr } from "../../utils/address";
import _ from "lodash";
import { ArmouryObject, ArmouryType, CollectionArmoury, NormalKnight, SellingArmouryType, SpecialKnight } from "../../global";
import { CollectionName, RarityMapping, TypeMapping } from "./KnightConfig";
import BigNumber from "bignumber.js";
import { NFTSellingState } from "../../State/NFTSellingState";
import SellGraphQuery from "./SellGraphQuery";
import CollectionOwnedGraphQuery from "./CollectionOwnedGraphQuery";

const BASE18 = BigNumber('1000000000000000000');

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

// Update balance of trava
export async function updateTravaBalance(
  appState1: ApplicationState
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    let TravaTokenAddress = getAddr("TRAVA_TOKEN", appState1.chainId); // Trava Token Address
    const TravaToken = new Contract(
      TravaTokenAddress,
      ERC20Mock,
      appState.web3
    );
    TravaTokenAddress = TravaTokenAddress.toLowerCase();
    const travaBalance = await TravaToken.balanceOf(
      appState.walletState.address
    );
    const travaBalance2 = await TravaToken.balanceOf(
      appState.smartWalletState.address
    );
    appState.walletState.tokenBalances.set(TravaTokenAddress, travaBalance);
    appState.smartWalletState.tokenBalances.set(TravaTokenAddress, travaBalance2);
  } catch (e) {
    console.log(e);
  }
  return appState;
}

// Update mảnh NFT owned cho wallet
export async function updateNFTBalanceFromContract(
  appState1: ApplicationState,
  mode: "walletState" | "smartWalletState"
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    const travacore = new Contract(
      getAddr("NFT_CORE_ADDRESS", appState.chainId),
      TravaNFTCoreABI,
      appState.web3
    );
    const nftCount = await travacore.balanceOf(appState[mode].address);
    const [nftIds] = await Promise.all([
      multiCall(
        TravaNFTCoreABI,
        new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
          address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
          name: "tokenOfOwnerByIndex",
          params: [appState[mode].address, index],
        })),
        appState.web3,
        appState.chainId
      ),
    ]);
    const tokenIdsFlattened = nftIds.flat();
    const [data] = await Promise.all([
      multiCall(
        NFTManagerABI,
        tokenIdsFlattened.map((tokenId: string) => ({
          address: getAddr("NFT_MANAGER_ADDRESS", appState.chainId),
          name: "checkIfChestOpenedAndSet",
          params: [tokenId],
        })),
        appState.web3,
        appState.chainId
      ),
    ]);
    const openedTokens = [] as Array<{ tokenId: string; version: number }>;
    tokenIdsFlattened.forEach((tokenId: string, index: number) => {
      const version = parseInt(data[index][0]);
      const isOpen = data[index][1];
      if (isOpen) openedTokens.push({ tokenId, version });
    });
    let [tokensMetadata] = await Promise.all([
      multiCall(
        TravaNFTCoreABI,
        openedTokens.map((item, _) => ({
          address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
          name: 'getTokenMetadata',
          params: [item.tokenId],
        })),
        appState.web3,
        appState.chainId
      ),
    ]);
    tokensMetadata = tokensMetadata.flat();

    tokensMetadata = tokensMetadata.map((item: any, index: number) => ({
      ...item,
      ...openedTokens[index],
    }));
    tokensMetadata.forEach((item: any) => {
      if (parseInt(item.collectionId) !== 0) {
        const data: ArmouryType = {
          tokenId: parseInt(item.tokenId),
          version: item.version,
          set: parseInt(item[3]),
          rarity: parseInt(item[1]),
          type: parseInt(item[2]),
          exp: parseInt(item[4]),
        };
        if (item.version == 1) appState[mode].nfts.v1[item.tokenId] = data;
        else if (item.version == 2) appState[mode].nfts.v2[item.tokenId] = data;
      }
    });
  } catch (e) {
    console.log(e);
  }
  return appState;
}

// Update collection owned cho wallet
export async function updateCollectionBalanceFromContract(
  appState1: ApplicationState,
  mode: "walletState" | "smartWalletState"
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    const travaCollection = new Contract(
      getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
      NFTCollectionABI,
      appState.web3
    );
    const collectionLen = parseInt(await travaCollection.balanceOf(appState[mode].address));
    const [collectionIds] = await Promise.all([
      multiCall(
        NFTCollectionABI,
        new Array(collectionLen).fill(1).map((_, index) => ({
          address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
          name: 'tokenOfOwnerByIndex',
          params: [appState[mode].address, index],
        })),
        appState.web3,
        appState.chainId
      ),
    ]);
    const collectionIdsFlattened = collectionIds.flat();
    const { normalCollections, specialCollections } = await fetchBasicCollections(
      collectionIdsFlattened, appState
    );
    const armorTokenIdArray: Array<string> = [];
    const helmetTokenIdArray: Array<string> = [];
    const shieldTokenIdArray: Array<string> = [];
    const weaponTokenIdArray: Array<string> = [];
    normalCollections.forEach((item, _) => {
      armorTokenIdArray.push(item.armorTokenId.toString());
      helmetTokenIdArray.push(item.helmetTokenId.toString());
      shieldTokenIdArray.push(item.shieldTokenId.toString());
      weaponTokenIdArray.push(item.weaponTokenId.toString());
    });
    const normalItemsCollections = await fetchNormalItems(
      armorTokenIdArray,
      helmetTokenIdArray,
      shieldTokenIdArray,
      weaponTokenIdArray,
      appState
    );
    const v1: Array<NormalKnight> = [];
    const v2: Array<NormalKnight> = [];
    let counter = 0;
    for (const rawCollection of normalCollections) {
      if (rawCollection.setId == 1)
        v1.push({ ...rawCollection, ...normalItemsCollections[counter] });
      else if (rawCollection.setId == 2)
        v2.push({ ...rawCollection, ...normalItemsCollections[counter] });
      counter++;
    }
    appState[mode].collection.v1 = v1.sort(collectionSort);
    appState[mode].collection.v2 = v2;
    appState[mode].collection.specials = specialCollections;
  } catch (e) {
    console.log(e);
  }
  return appState;
}

function collectionSort(item1: NormalKnight, item2: NormalKnight) {
  if (item1.rarity < item2.rarity) return 1;
  else return -1;
}

const fetchNormalItems = async (
  armorTokenIds: Array<string>,
  helmetTokenIds: Array<string>,
  shieldTokenIds: Array<string>,
  weaponTokenIds: Array<string>,
  appState: ApplicationState
) => {
  let [armorTokensMetadata, helmetTokensMetadata, shieldTokensMetadata, weaponTokensMetadata] =
    await Promise.all([
      multiCall(
        TravaNFTCoreABI,
        armorTokenIds.map((tokenId) => ({
          address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
          name: 'getTokenMetadata',
          params: [tokenId],
        })),
        appState.web3,
        appState.chainId
      ),
      multiCall(
        TravaNFTCoreABI,
        helmetTokenIds.map((tokenId) => ({
          address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
          name: 'getTokenMetadata',
          params: [tokenId],
        })),
        appState.web3,
        appState.chainId
      ),
      multiCall(
        TravaNFTCoreABI,
        shieldTokenIds.map((tokenId) => ({
          address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
          name: 'getTokenMetadata',
          params: [tokenId],
        })),
        appState.web3,
        appState.chainId
      ),
      multiCall(
        TravaNFTCoreABI,
        weaponTokenIds.map((tokenId) => ({
          address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
          name: 'getTokenMetadata',
          params: [tokenId],
        })),
        appState.web3,
        appState.chainId
      ),
    ]);
  armorTokensMetadata = armorTokensMetadata.flat();
  helmetTokensMetadata = helmetTokensMetadata.flat();
  shieldTokensMetadata = shieldTokensMetadata.flat();
  weaponTokensMetadata = weaponTokensMetadata.flat();
  const collections = [] as Array<{
    armor: CollectionArmoury;
    helmet: CollectionArmoury;
    shield: CollectionArmoury;
    weapon: CollectionArmoury;
  }>;
  for (let i = 0; i < armorTokenIds.length; i++) {
    collections[i] = {
      armor: {
        tokenId: parseInt(armorTokenIds[i]),
        rarity: parseInt(armorTokensMetadata[i].tokenRarity),
        exp: parseInt(armorTokensMetadata[i].experiencePoint),
      },
      helmet: {
        tokenId: parseInt(helmetTokenIds[i]),
        rarity: parseInt(helmetTokensMetadata[i].tokenRarity),
        exp: parseInt(helmetTokensMetadata[i].experiencePoint),
      },
      shield: {
        tokenId: parseInt(shieldTokenIds[i]),
        rarity: parseInt(shieldTokensMetadata[i].tokenRarity),
        exp: parseInt(shieldTokensMetadata[i].experiencePoint),
      },
      weapon: {
        tokenId: parseInt(weaponTokenIds[i]),
        rarity: parseInt(weaponTokensMetadata[i].tokenRarity),
        exp: parseInt(weaponTokensMetadata[i].experiencePoint),
      },
    };
  }
  return collections;
};

const fetchBasicCollections = async (collectionIds: Array<string>, appState: ApplicationState) => {
  const [collectionSetIds, collectionsMetadata, collectionsExp] = await Promise.all([
    multiCall(
      NFTCollectionABI,
      collectionIds.map((collectionId) => ({
        address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
        name: 'getCollectionSetId',
        params: [collectionId],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      NFTCollectionABI,
      collectionIds.map((collectionId) => ({
        address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
        name: 'getCollectionMetadata',
        params: [collectionId],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      NFTCollectionABI,
      collectionIds.map((collectionId) => ({
        address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
        name: 'getCollectionExperience',
        params: [collectionId],
      })),
      appState.web3,
      appState.chainId
    ),
  ]);
  const _collectionsExp = collectionsExp.flat();
  const _collectionsMetadata = collectionsMetadata
    .map(([components, tokenRarity]: any, index: number) => ({
      armorTokenId: parseInt(components.armorTokenId),
      helmetTokenId: parseInt(components.helmetTokenId),
      shieldTokenId: parseInt(components.shieldTokenId),
      weaponTokenId: parseInt(components.swordTokenId),
      rarity: parseInt(tokenRarity),
      id: parseInt(collectionIds[index]),
      setId: parseInt(collectionSetIds[index]),
      exp: parseInt(_collectionsExp[index]),
    }))
    .filter((item: any) => item.rarity >= 1);
  const normalCollections = _collectionsMetadata.filter((item: any) => item.rarity <= 5);
  let specialCollections = _collectionsMetadata.filter((item: any) => item.rarity > 5);
  
  // fetch special collections metadata
  let [tokenURIList] = await Promise.all([
    multiCall(
      NFTCollectionABI,
      specialCollections.map((item: any) => ({
        address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
        name: 'tokenURI',
        params: [item.id],
      })),
      appState.web3,
      appState.chainId
    ),
  ]);
  tokenURIList = tokenURIList.flat();
  specialCollections = specialCollections.map((item: any, index: number) => ({
    ...item,
    metadataLink: tokenURIList[index],
  }));
  return { normalCollections, specialCollections } as {
    normalCollections: Array<NormalKnight>;
    specialCollections: Array<SpecialKnight>;
  };
};

// Fetch tất cả nft đang bán trên chợ
async function _fetchNormal(
  appState: ApplicationState,
  tokenIds: any
): Promise<NFTSellingState> {
  let [tokenOrders, tokenMetadata] = await Promise.all([
    multiCall(
      TravaNFTSellABI,
      tokenIds.map((tokenId: any) => ({
        address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
        name: "getTokenOrder",
        params: [tokenId],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      TravaNFTCoreABI,
      tokenIds.map((tokenId: any) => ({
        address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
        name: "getTokenMetadata",
        params: [tokenId],
      })),
      appState.web3,
      appState.chainId
    ),
  ]);
  tokenOrders = tokenOrders.flat();
  tokenMetadata = tokenMetadata.flat();
  let v1 = [] as Array<SellingArmouryType>;
  let v2 = [] as Array<SellingArmouryType>;
  let counter = 0;
  for (const tokenData of tokenMetadata) {
    const collectionId = parseInt(tokenData.collectionId);
    const collectionName = CollectionName[collectionId - 1];
    const rarity = parseInt(tokenData.tokenRarity);
    if (rarity >= 1 && collectionName) {
      const type = parseInt(tokenData.tokenType);
      const tType = TypeMapping[type - 1];
      const tRarity = RarityMapping[rarity - 1];
      const id = parseInt(tokenIds[counter]);
      const exp = parseInt(tokenData.experiencePoint);
      const price = BigNumber(tokenOrders[counter].price).dividedBy(BASE18).toNumber();
      const seller = tokenOrders[counter].nftSeller;
      const data: SellingArmouryType = {
        id,
        collectionName,
        collectionId,
        nRarity: rarity,
        nType: type,
        rarity: tRarity,
        type: tType,
        exp,
        price,
        seller,
      };
      if (collectionId == 1) v1.push(data);
      else if (collectionId == 2) v2.push(data);
    }
    counter++;
  }
  v1 = v1.sort(armourySort);
  v2 = v2.sort(armourySort);
  return { v1, v2 } as NFTSellingState;
}

function armourySort(item1: SellingArmouryType, item2: SellingArmouryType) {
  return item2.nRarity - item1.nRarity || item2.exp - item1.exp || item1.nType - item2.nType;
}

export async function updateSellingNFTFromContract(
  appState1: ApplicationState,
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    const nftsell = new Contract(
      getAddr("NFT_SELL_ADDRESS", appState.chainId),
      TravaNFTSellABI,
      appState.web3
    );
    const nftCount = await nftsell.getTokenOnSaleCount();
    const [nftIds] = await Promise.all([
      multiCall(
        TravaNFTSellABI,
        new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
          address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
          name: "getTokenOnSaleAtIndex",
          params: [index],
        })),
        appState.web3,
        appState.chainId
      ),
    ]);
    const tokenIdsFlattened = nftIds.flat();

    const promises = [];
    for (var i = 0; i < tokenIdsFlattened.length; i += 500) {
      const _tokenSlice = tokenIdsFlattened.slice(i, i + 500);
      promises.push(_fetchNormal(appState, _tokenSlice));
    }
    const result = await Promise.all(promises);
    if (result.length > 0) {
      const mergedObject = result.reduce(
        (result, element) => ({
          v1: [...result.v1, ...element.v1],
          v2: [...result.v2, ...element.v2],
        }),
        { v1: [], v2: [] }
      );
      appState.NFTSellingState = mergedObject;
    } 
    else {
      appState.NFTSellingState.v1 = [];
      appState.NFTSellingState.v2 = [];
    }
  } catch (e) {
    console.log(e);
  }
  return appState;
}

// Graph
export async function updateSellingNFTFromGraph(
  appState1: ApplicationState,
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    const a = await SellGraphQuery.fetchData();
    appState.NFTSellingState.v1 = a.v1;
    appState.NFTSellingState.v2 = a.v2;
  } catch (e) {
    console.log(e);
  }
  return appState;
}

export async function updateCollectionBalanceFromGraph(
  appState1: ApplicationState,
  mode: "walletState" | "smartWalletState"
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    const a = await CollectionOwnedGraphQuery.fetchData("0xc715bbe707d39524173c0635611cd69c250c59cb");
    console.log(a);
  } catch (e) {
    console.log(e);
  }
  return appState;
}
