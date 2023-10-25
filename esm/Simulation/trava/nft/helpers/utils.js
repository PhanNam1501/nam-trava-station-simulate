var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import MultiCallABI from "../../../../abis/Multicall.json";
import TravaNFTCoreABI from "../../../../abis/TravaNFTCore.json";
import NFTCollectionABI from "../../../../abis/NFTCollection.json";
import TravaNFTSellABI from "../../../../abis/TravaNFTSell.json";
import { Contract, Interface } from "ethers";
import { getAddr } from "../../../../utils/address";
import { CollectionName, RarityMapping, TypeMapping } from "./../helpers/KnightConfig";
import BigNumber from "bignumber.js";
export function multiCall(abi, calls, provider, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        let _provider = provider;
        const multi = new Contract(getAddr("MULTI_CALL_ADDRESS", chainId), MultiCallABI, _provider);
        const itf = new Interface(abi);
        const callData = calls.map((call) => [
            call.address.toLowerCase(),
            itf.encodeFunctionData(call.name, call.params),
        ]);
        const { returnData } = yield multi.aggregate(callData);
        return returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
    });
}
;
export function fetchNormalItems(armorTokenIds, helmetTokenIds, shieldTokenIds, weaponTokenIds, appState) {
    return __awaiter(this, void 0, void 0, function* () {
        let [armorTokensMetadata, helmetTokensMetadata, shieldTokensMetadata, weaponTokensMetadata] = yield Promise.all([
            multiCall(TravaNFTCoreABI, armorTokenIds.map((tokenId) => ({
                address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                name: 'getTokenMetadata',
                params: [tokenId],
            })), appState.web3, appState.chainId),
            multiCall(TravaNFTCoreABI, helmetTokenIds.map((tokenId) => ({
                address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                name: 'getTokenMetadata',
                params: [tokenId],
            })), appState.web3, appState.chainId),
            multiCall(TravaNFTCoreABI, shieldTokenIds.map((tokenId) => ({
                address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                name: 'getTokenMetadata',
                params: [tokenId],
            })), appState.web3, appState.chainId),
            multiCall(TravaNFTCoreABI, weaponTokenIds.map((tokenId) => ({
                address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                name: 'getTokenMetadata',
                params: [tokenId],
            })), appState.web3, appState.chainId),
        ]);
        armorTokensMetadata = armorTokensMetadata.flat();
        helmetTokensMetadata = helmetTokensMetadata.flat();
        shieldTokensMetadata = shieldTokensMetadata.flat();
        weaponTokensMetadata = weaponTokensMetadata.flat();
        const collections = [];
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
    });
}
;
export function fetchBasicCollections(collectionIds, appState) {
    return __awaiter(this, void 0, void 0, function* () {
        const [collectionSetIds, collectionsMetadata, collectionsExp] = yield Promise.all([
            multiCall(NFTCollectionABI, collectionIds.map((collectionId) => ({
                address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'getCollectionSetId',
                params: [collectionId],
            })), appState.web3, appState.chainId),
            multiCall(NFTCollectionABI, collectionIds.map((collectionId) => ({
                address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'getCollectionMetadata',
                params: [collectionId],
            })), appState.web3, appState.chainId),
            multiCall(NFTCollectionABI, collectionIds.map((collectionId) => ({
                address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'getCollectionExperience',
                params: [collectionId],
            })), appState.web3, appState.chainId),
        ]);
        const _collectionsExp = collectionsExp.flat();
        const _collectionsMetadata = collectionsMetadata
            .map(([components, tokenRarity], index) => ({
            armorTokenId: parseInt(components.armorTokenId),
            helmetTokenId: parseInt(components.helmetTokenId),
            shieldTokenId: parseInt(components.shieldTokenId),
            weaponTokenId: parseInt(components.swordTokenId),
            rarity: parseInt(tokenRarity),
            id: parseInt(collectionIds[index]),
            setId: parseInt(collectionSetIds[index]),
            exp: parseInt(_collectionsExp[index]),
        }))
            .filter((item) => item.rarity >= 1);
        const normalCollections = _collectionsMetadata.filter((item) => item.rarity <= 5);
        let specialCollections = _collectionsMetadata.filter((item) => item.rarity > 5);
        // fetch special collections metadata
        let [tokenURIList] = yield Promise.all([
            multiCall(NFTCollectionABI, specialCollections.map((item) => ({
                address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'tokenURI',
                params: [item.id],
            })), appState.web3, appState.chainId),
        ]);
        tokenURIList = tokenURIList.flat();
        specialCollections = specialCollections.map((item, index) => (Object.assign(Object.assign({}, item), { metadataLink: tokenURIList[index] })));
        return { normalCollections, specialCollections };
    });
}
;
// Fetch tất cả nft đang bán trên chợ
export function _fetchNormal(appState, tokenIds) {
    return __awaiter(this, void 0, void 0, function* () {
        let [tokenOrders, tokenMetadata] = yield Promise.all([
            multiCall(TravaNFTSellABI, tokenIds.map((tokenId) => ({
                address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
                name: "getTokenOrder",
                params: [tokenId],
            })), appState.web3, appState.chainId),
            multiCall(TravaNFTCoreABI, tokenIds.map((tokenId) => ({
                address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                name: "getTokenMetadata",
                params: [tokenId],
            })), appState.web3, appState.chainId),
        ]);
        tokenOrders = tokenOrders.flat();
        tokenMetadata = tokenMetadata.flat();
        let v1 = [];
        let v2 = [];
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
                const price = BigNumber(tokenOrders[counter].price).toFixed(0);
                const seller = tokenOrders[counter].nftSeller;
                const data = {
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
                if (collectionId == 1)
                    v1.push(data);
                else if (collectionId == 2)
                    v2.push(data);
            }
            counter++;
        }
        v1 = v1.sort(armourySort);
        v2 = v2.sort(armourySort);
        return { v1, v2 };
    });
}
export function armourySort(item1, item2) {
    return item2.nRarity - item1.nRarity || item2.exp - item1.exp || item1.nType - item2.nType;
}
export function collectionSort(item1, item2) {
    if (item1.rarity < item2.rarity)
        return 1;
    else
        return -1;
}
export function shuffleArray(array) {
    const n = array.length;
    for (let i = n - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
