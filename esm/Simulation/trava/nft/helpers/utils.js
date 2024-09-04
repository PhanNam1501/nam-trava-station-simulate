"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNormalItems = fetchNormalItems;
exports.fetchBasicCollections = fetchBasicCollections;
exports._fetchNormal = _fetchNormal;
exports.armourySort = armourySort;
exports.collectionSort = collectionSort;
exports.shuffleArray = shuffleArray;
const TravaNFTCore_json_1 = __importDefault(require("../../../../abis/TravaNFTCore.json"));
const NFTCollection_json_1 = __importDefault(require("../../../../abis/NFTCollection.json"));
const TravaNFTSell_json_1 = __importDefault(require("../../../../abis/TravaNFTSell.json"));
const address_1 = require("../../../../utils/address");
const KnightConfig_1 = require("./KnightConfig");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const helper_1 = require("../../../../utils/helper");
function fetchNormalItems(armorTokenIds, helmetTokenIds, shieldTokenIds, weaponTokenIds, appState) {
    return __awaiter(this, void 0, void 0, function* () {
        let [armorTokensMetadata, helmetTokensMetadata, shieldTokensMetadata, weaponTokensMetadata] = yield Promise.all([
            (0, helper_1.multiCall)(TravaNFTCore_json_1.default, armorTokenIds.map((tokenId) => ({
                address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
                name: 'getTokenMetadata',
                params: [tokenId],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(TravaNFTCore_json_1.default, helmetTokenIds.map((tokenId) => ({
                address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
                name: 'getTokenMetadata',
                params: [tokenId],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(TravaNFTCore_json_1.default, shieldTokenIds.map((tokenId) => ({
                address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
                name: 'getTokenMetadata',
                params: [tokenId],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(TravaNFTCore_json_1.default, weaponTokenIds.map((tokenId) => ({
                address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
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
function fetchBasicCollections(collectionIds, appState) {
    return __awaiter(this, void 0, void 0, function* () {
        const [collectionSetIds, collectionsMetadata, collectionsExp] = yield Promise.all([
            (0, helper_1.multiCall)(NFTCollection_json_1.default, collectionIds.map((collectionId) => ({
                address: (0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'getCollectionSetId',
                params: [collectionId],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(NFTCollection_json_1.default, collectionIds.map((collectionId) => ({
                address: (0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'getCollectionMetadata',
                params: [collectionId],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(NFTCollection_json_1.default, collectionIds.map((collectionId) => ({
                address: (0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId),
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
            (0, helper_1.multiCall)(NFTCollection_json_1.default, specialCollections.map((item) => ({
                address: (0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId),
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
function _fetchNormal(appState, tokenIds) {
    return __awaiter(this, void 0, void 0, function* () {
        let [tokenOrders, tokenMetadata] = yield Promise.all([
            (0, helper_1.multiCall)(TravaNFTSell_json_1.default, tokenIds.map((tokenId) => ({
                address: (0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId),
                name: "getTokenOrder",
                params: [tokenId],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(TravaNFTCore_json_1.default, tokenIds.map((tokenId) => ({
                address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
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
            const collectionName = KnightConfig_1.CollectionName[collectionId - 1];
            const rarity = parseInt(tokenData.tokenRarity);
            if (rarity >= 1 && collectionName) {
                const type = parseInt(tokenData.tokenType);
                const tType = KnightConfig_1.TypeMapping[type - 1];
                const tRarity = KnightConfig_1.RarityMapping[rarity - 1];
                const id = parseInt(tokenIds[counter]);
                const exp = parseInt(tokenData.experiencePoint);
                const price = (0, bignumber_js_1.default)(tokenOrders[counter].price).toFixed(0);
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
function armourySort(item1, item2) {
    return item2.nRarity - item1.nRarity || item2.exp - item1.exp || item1.nType - item2.nType;
}
function collectionSort(item1, item2) {
    if (item1.rarity < item2.rarity)
        return 1;
    else
        return -1;
}
function shuffleArray(array) {
    const n = array.length;
    for (let i = n - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
