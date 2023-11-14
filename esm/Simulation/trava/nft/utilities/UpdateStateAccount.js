var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ERC20Mock from "../../../../abis/ERC20Mock.json";
import TravaNFTCoreABI from "../../../../abis/TravaNFTCore.json";
import NFTCollectionABI from "../../../../abis/NFTCollection.json";
import NFTManagerABI from "../../../../abis/NFTManager.json";
import { Contract } from "ethers";
import { getAddr } from "../../../../utils/address";
import { RarityMapping, TypeMapping } from "../helpers/KnightConfig";
import CollectionOwnedGraphQuery from "../helpers/CollectionOwnedGraphQuery";
import { collectionSort, fetchBasicCollections, fetchNormalItems } from "../helpers/utils";
import { multiCall } from "../../../../utils/helper";
// Update balance of trava
export function updateTravaBalance(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            let TravaTokenAddress = getAddr("TRAVA_TOKEN", appState1.chainId); // Trava Token Address
            const TravaToken = new Contract(TravaTokenAddress, ERC20Mock, appState.web3);
            TravaTokenAddress = TravaTokenAddress.toLowerCase();
            const travaBalance = yield TravaToken.balanceOf(appState.walletState.address);
            const travaBalance2 = yield TravaToken.balanceOf(appState.smartWalletState.address);
            appState.walletState.tokenBalances.set(TravaTokenAddress, travaBalance);
            appState.smartWalletState.tokenBalances.set(TravaTokenAddress, travaBalance2);
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
// Update mảnh NFT owned cho wallet
export function updateNFTBalanceFromContract(appState1, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const travacore = new Contract(getAddr("NFT_CORE_ADDRESS", appState.chainId), TravaNFTCoreABI, appState.web3);
            const nftCount = yield travacore.balanceOf(appState[mode].address);
            const [nftIds] = yield Promise.all([
                multiCall(TravaNFTCoreABI, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                    name: "tokenOfOwnerByIndex",
                    params: [appState[mode].address, index],
                })), appState.web3, appState.chainId),
            ]);
            const tokenIdsFlattened = nftIds.flat();
            const [data] = yield Promise.all([
                multiCall(NFTManagerABI, tokenIdsFlattened.map((tokenId) => ({
                    address: getAddr("NFT_MANAGER_ADDRESS", appState.chainId),
                    name: "checkIfChestOpenedAndSet",
                    params: [tokenId],
                })), appState.web3, appState.chainId),
            ]);
            const openedTokens = [];
            tokenIdsFlattened.forEach((tokenId, index) => {
                const version = parseInt(data[index][0]);
                const isOpen = data[index][1];
                if (isOpen)
                    openedTokens.push({ tokenId, version });
            });
            let [tokensMetadata] = yield Promise.all([
                multiCall(TravaNFTCoreABI, openedTokens.map((item, _) => ({
                    address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                    name: 'getTokenMetadata',
                    params: [item.tokenId],
                })), appState.web3, appState.chainId),
            ]);
            tokensMetadata = tokensMetadata.flat();
            tokensMetadata = tokensMetadata.map((item, index) => (Object.assign(Object.assign({}, item), openedTokens[index])));
            tokensMetadata.forEach((item) => {
                if (parseInt(item.collectionId) !== 0) {
                    const data = {
                        tokenId: parseInt(item.tokenId),
                        version: item.version,
                        set: parseInt(item[3]),
                        nRarity: parseInt(item[1]),
                        nType: parseInt(item[2]),
                        rarity: RarityMapping[parseInt(item[1]) - 1],
                        type: TypeMapping[parseInt(item[2]) - 1],
                        exp: parseInt(item[4]),
                    };
                    if (item.version == 1)
                        appState[mode].nfts.v1[item.tokenId] = data;
                    else if (item.version == 2)
                        appState[mode].nfts.v2[item.tokenId] = data;
                    appState[mode].nfts.isFetch = true;
                }
            });
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
// Update collection owned cho wallet
export function updateCollectionBalanceFromContract(appState1, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const travaCollection = new Contract(getAddr("NFT_COLLECTION_ADDRESS", appState.chainId), NFTCollectionABI, appState.web3);
            const collectionLen = parseInt(yield travaCollection.balanceOf(appState[mode].address));
            const [collectionIds] = yield Promise.all([
                multiCall(NFTCollectionABI, new Array(collectionLen).fill(1).map((_, index) => ({
                    address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
                    name: 'tokenOfOwnerByIndex',
                    params: [appState[mode].address, index],
                })), appState.web3, appState.chainId),
            ]);
            const collectionIdsFlattened = collectionIds.flat();
            const { normalCollections, specialCollections } = yield fetchBasicCollections(collectionIdsFlattened, appState);
            const armorTokenIdArray = [];
            const helmetTokenIdArray = [];
            const shieldTokenIdArray = [];
            const weaponTokenIdArray = [];
            normalCollections.forEach((item, _) => {
                armorTokenIdArray.push(item.armorTokenId.toString());
                helmetTokenIdArray.push(item.helmetTokenId.toString());
                shieldTokenIdArray.push(item.shieldTokenId.toString());
                weaponTokenIdArray.push(item.weaponTokenId.toString());
            });
            const normalItemsCollections = yield fetchNormalItems(armorTokenIdArray, helmetTokenIdArray, shieldTokenIdArray, weaponTokenIdArray, appState);
            const v1 = [];
            const v2 = [];
            let counter = 0;
            for (const rawCollection of normalCollections) {
                if (rawCollection.setId == 1)
                    v1.push(Object.assign(Object.assign({}, rawCollection), normalItemsCollections[counter]));
                else if (rawCollection.setId == 2)
                    v2.push(Object.assign(Object.assign({}, rawCollection), normalItemsCollections[counter]));
                counter++;
            }
            appState[mode].collection.v1 = v1.sort(collectionSort);
            appState[mode].collection.v2 = v2;
            appState[mode].collection.specials = specialCollections;
            appState[mode].collection.isFetch = true;
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
export function updateCollectionBalanceFromGraph(appState1, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const a = yield CollectionOwnedGraphQuery.fetchData(appState[mode].address);
            console.log(a);
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
