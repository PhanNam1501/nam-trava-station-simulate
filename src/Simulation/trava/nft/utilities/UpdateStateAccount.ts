import { ApplicationState } from "../../../../State/ApplicationState";
import ERC20Mock from "../../../../abis/ERC20Mock.json";
import TravaNFTCoreABI from "../../../../abis/TravaNFTCore.json";
import NFTCollectionABI from "../../../../abis/NFTCollection.json";
import NFTManagerABI from "../../../../abis/NFTManager.json";
import { Contract } from "ethers";
import { getAddr } from "../../../../utils/address";
import _ from "lodash";
import { ArmouryType, NormalKnight } from "../helpers/global";
import { RarityMapping, TypeMapping } from "../helpers/KnightConfig";
import CollectionOwnedGraphQuery from "../helpers/CollectionOwnedGraphQuery";
import { _fetchNormal, collectionSort, fetchBasicCollections, fetchNormalItems } from "../helpers/utils"
import { getMode, multiCall } from "../../../../utils/helper";
import { EthAddress } from "../../../../utils/types";
import TicketABI from "../../../../abis/NFTTicketABI.json";
import { Ticket } from "../../../../State";

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
          nRarity: parseInt(item[1]),
          nType: parseInt(item[2]),
          rarity: RarityMapping[parseInt(item[1]) - 1],
          type: TypeMapping[parseInt(item[2]) - 1],
          exp: parseInt(item[4]),
        };
        if (item.version == 1) appState[mode].nfts.v1[item.tokenId] = data;
        else if (item.version == 2) appState[mode].nfts.v2[item.tokenId] = data;
        appState[mode].nfts.isFetch = true;
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
    appState[mode].collection.isFetch = true;
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
    const a = await CollectionOwnedGraphQuery.fetchData(appState[mode].address);
    console.log(a);
  } catch (e) {
    console.log(e);
  }
  return appState;
}


export async function updateOwnerTicketState(appState1: ApplicationState, _from: EthAddress, force = false) {
  let appState = { ...appState1 };
  try {
    _from = _from.toLowerCase();
    let mode = getMode(appState, _from);
    if (!appState[mode].ticket.isFetch || force) {
      const TICKET_IDS = ['100001', '100002', '100003'];
      const [ticketOfOwner]
        = await Promise.all([
          multiCall(
            TicketABI,
            TICKET_IDS.map((ticket_id: string) => ({
              address: getAddr("NFT_TICKET", appState.chainId),
              name: "balanceOf",
              params: [_from, ticket_id],
            })),
            appState.web3,
            appState.chainId
          )]);
      let Ticket1: Ticket = {
        ticket: "counter",
        amount: parseInt(ticketOfOwner[0])
      }
      let Ticket2: Ticket = {
        ticket: "presale",
        amount: parseInt(ticketOfOwner[1])
      }
      let Ticket3: Ticket = {
        ticket: "incentive",
        amount: parseInt(ticketOfOwner[2])
      }
      appState[mode].ticket.ticketState.set(TICKET_IDS[0], Ticket1);
      appState[mode].ticket.ticketState.set(TICKET_IDS[1], Ticket2);
      appState[mode].ticket.ticketState.set(TICKET_IDS[2], Ticket3);
      appState[mode].ticket.isFetch = true;
    }
  } catch (err) {
    console.log(err)
  }
  return appState;
}
