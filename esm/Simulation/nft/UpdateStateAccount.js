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
exports.updateOwnedSellingNFT = exports.updateOwnedSellingNFTFromContract = exports.updateCollectionBalanceFromGraph = exports.updateSellingNFTFromGraph = exports.updateSellingNFTFromContract = exports.updateCollectionBalanceFromContract = exports.updateNFTBalanceFromContract = exports.updateTravaBalance = void 0;
const ERC20Mock_json_1 = __importDefault(require("../../abis/ERC20Mock.json"));
const Multicall_json_1 = __importDefault(require("../../abis/Multicall.json"));
const TravaNFTCore_json_1 = __importDefault(require("../../abis/TravaNFTCore.json"));
const NFTCollection_json_1 = __importDefault(require("../../abis/NFTCollection.json"));
const TravaNFTSell_json_1 = __importDefault(require("../../abis/TravaNFTSell.json"));
const NFTManager_json_1 = __importDefault(require("../../abis/NFTManager.json"));
const ethers_1 = require("ethers");
const address_1 = require("../../utils/address");
const KnightConfig_1 = require("./KnightConfig");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const SellGraphQuery_1 = __importDefault(require("./SellGraphQuery"));
const CollectionOwnedGraphQuery_1 = __importDefault(require("./CollectionOwnedGraphQuery"));
const BASE18 = (0, bignumber_js_1.default)('1000000000000000000');
const multiCall = (abi, calls, provider, chainId) => __awaiter(void 0, void 0, void 0, function* () {
    let _provider = provider;
    const multi = new ethers_1.Contract((0, address_1.getAddr)("MULTI_CALL_ADDRESS", chainId), Multicall_json_1.default, _provider);
    const itf = new ethers_1.Interface(abi);
    const callData = calls.map((call) => [
        call.address.toLowerCase(),
        itf.encodeFunctionData(call.name, call.params),
    ]);
    const { returnData } = yield multi.aggregate(callData);
    return returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
});
// Update balance of trava
function updateTravaBalance(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            let TravaTokenAddress = (0, address_1.getAddr)("TRAVA_TOKEN", appState1.chainId); // Trava Token Address
            const TravaToken = new ethers_1.Contract(TravaTokenAddress, ERC20Mock_json_1.default, appState.web3);
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
exports.updateTravaBalance = updateTravaBalance;
// Update mảnh NFT owned cho wallet
function updateNFTBalanceFromContract(appState1, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const travacore = new ethers_1.Contract((0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId), TravaNFTCore_json_1.default, appState.web3);
            const nftCount = yield travacore.balanceOf(appState[mode].address);
            const [nftIds] = yield Promise.all([
                multiCall(TravaNFTCore_json_1.default, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
                    name: "tokenOfOwnerByIndex",
                    params: [appState[mode].address, index],
                })), appState.web3, appState.chainId),
            ]);
            const tokenIdsFlattened = nftIds.flat();
            const [data] = yield Promise.all([
                multiCall(NFTManager_json_1.default, tokenIdsFlattened.map((tokenId) => ({
                    address: (0, address_1.getAddr)("NFT_MANAGER_ADDRESS", appState.chainId),
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
                multiCall(TravaNFTCore_json_1.default, openedTokens.map((item, _) => ({
                    address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
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
                        rarity: KnightConfig_1.RarityMapping[parseInt(item[1]) - 1],
                        type: KnightConfig_1.TypeMapping[parseInt(item[2]) - 1],
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
exports.updateNFTBalanceFromContract = updateNFTBalanceFromContract;
// Update collection owned cho wallet
function updateCollectionBalanceFromContract(appState1, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const travaCollection = new ethers_1.Contract((0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId), NFTCollection_json_1.default, appState.web3);
            const collectionLen = parseInt(yield travaCollection.balanceOf(appState[mode].address));
            const [collectionIds] = yield Promise.all([
                multiCall(NFTCollection_json_1.default, new Array(collectionLen).fill(1).map((_, index) => ({
                    address: (0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId),
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
exports.updateCollectionBalanceFromContract = updateCollectionBalanceFromContract;
function collectionSort(item1, item2) {
    if (item1.rarity < item2.rarity)
        return 1;
    else
        return -1;
}
const fetchNormalItems = (armorTokenIds, helmetTokenIds, shieldTokenIds, weaponTokenIds, appState) => __awaiter(void 0, void 0, void 0, function* () {
    let [armorTokensMetadata, helmetTokensMetadata, shieldTokensMetadata, weaponTokensMetadata] = yield Promise.all([
        multiCall(TravaNFTCore_json_1.default, armorTokenIds.map((tokenId) => ({
            address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
            name: 'getTokenMetadata',
            params: [tokenId],
        })), appState.web3, appState.chainId),
        multiCall(TravaNFTCore_json_1.default, helmetTokenIds.map((tokenId) => ({
            address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
            name: 'getTokenMetadata',
            params: [tokenId],
        })), appState.web3, appState.chainId),
        multiCall(TravaNFTCore_json_1.default, shieldTokenIds.map((tokenId) => ({
            address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
            name: 'getTokenMetadata',
            params: [tokenId],
        })), appState.web3, appState.chainId),
        multiCall(TravaNFTCore_json_1.default, weaponTokenIds.map((tokenId) => ({
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
const fetchBasicCollections = (collectionIds, appState) => __awaiter(void 0, void 0, void 0, function* () {
    const [collectionSetIds, collectionsMetadata, collectionsExp] = yield Promise.all([
        multiCall(NFTCollection_json_1.default, collectionIds.map((collectionId) => ({
            address: (0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId),
            name: 'getCollectionSetId',
            params: [collectionId],
        })), appState.web3, appState.chainId),
        multiCall(NFTCollection_json_1.default, collectionIds.map((collectionId) => ({
            address: (0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId),
            name: 'getCollectionMetadata',
            params: [collectionId],
        })), appState.web3, appState.chainId),
        multiCall(NFTCollection_json_1.default, collectionIds.map((collectionId) => ({
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
        multiCall(NFTCollection_json_1.default, specialCollections.map((item) => ({
            address: (0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId),
            name: 'tokenURI',
            params: [item.id],
        })), appState.web3, appState.chainId),
    ]);
    tokenURIList = tokenURIList.flat();
    specialCollections = specialCollections.map((item, index) => (Object.assign(Object.assign({}, item), { metadataLink: tokenURIList[index] })));
    return { normalCollections, specialCollections };
});
// Fetch tất cả nft đang bán trên chợ
function _fetchNormal(appState, tokenIds) {
    return __awaiter(this, void 0, void 0, function* () {
        let [tokenOrders, tokenMetadata] = yield Promise.all([
            multiCall(TravaNFTSell_json_1.default, tokenIds.map((tokenId) => ({
                address: (0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId),
                name: "getTokenOrder",
                params: [tokenId],
            })), appState.web3, appState.chainId),
            multiCall(TravaNFTCore_json_1.default, tokenIds.map((tokenId) => ({
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
function updateSellingNFTFromContract(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const nftsell = new ethers_1.Contract((0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId), TravaNFTSell_json_1.default, appState.web3);
            const nftCount = yield nftsell.getTokenOnSaleCount();
            const [nftIds] = yield Promise.all([
                multiCall(TravaNFTSell_json_1.default, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: (0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOnSaleAtIndex",
                    params: [index],
                })), appState.web3, appState.chainId),
            ]);
            const tokenIdsFlattened = nftIds.flat();
            const promises = [];
            for (var i = 0; i < tokenIdsFlattened.length; i += 500) {
                const _tokenSlice = tokenIdsFlattened.slice(i, i + 500);
                promises.push(_fetchNormal(appState, _tokenSlice));
            }
            const result = yield Promise.all(promises);
            if (result.length > 0) {
                const mergedObject = result.reduce((result, element) => ({
                    v1: [...result.v1, ...element.v1],
                    v2: [...result.v2, ...element.v2],
                    isFetch: true
                }), { v1: [], v2: [], isFetch: false });
                appState.NFTSellingState = mergedObject;
            }
            else {
                appState.NFTSellingState.v1 = [];
                appState.NFTSellingState.v2 = [];
            }
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateSellingNFTFromContract = updateSellingNFTFromContract;
// Graph
function updateSellingNFTFromGraph(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const a = yield SellGraphQuery_1.default.fetchData();
            appState.NFTSellingState.v1 = a.v1;
            appState.NFTSellingState.v2 = a.v2;
            appState.NFTSellingState.isFetch = true;
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateSellingNFTFromGraph = updateSellingNFTFromGraph;
function updateCollectionBalanceFromGraph(appState1, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const a = yield CollectionOwnedGraphQuery_1.default.fetchData(appState[mode].address);
            console.log(a);
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateCollectionBalanceFromGraph = updateCollectionBalanceFromGraph;
function updateOwnedSellingNFTFromContract(appState1, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const nftsell = new ethers_1.Contract((0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId), TravaNFTSell_json_1.default, appState.web3);
            const tokenLength = yield nftsell.getTokenOfOwnerBalance(appState[mode].address);
            const [tokenIds] = yield Promise.all([
                multiCall(TravaNFTSell_json_1.default, new Array(parseInt(tokenLength)).fill(1).map((_, idx) => ({
                    address: (0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOfOwnerAtIndex",
                    params: [appState[mode].address, idx],
                })), appState.web3, appState.chainId),
            ]);
            const tokenIdsFlattened = tokenIds.flat();
            const [tokensMetadata, ordersMetadata] = yield Promise.all([
                multiCall(TravaNFTCore_json_1.default, tokenIdsFlattened.map((tokenId) => ({
                    address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
                    name: "getTokenMetadata",
                    params: [tokenId],
                })), appState.web3, appState.chainId),
                multiCall(TravaNFTSell_json_1.default, tokenIdsFlattened.map((tokenId) => ({
                    address: (0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOrder",
                    params: [tokenId],
                })), appState.web3, appState.chainId),
            ]);
            const tokensMetadataFlattened = tokensMetadata.flat();
            const ordersMetadataFlattened = ordersMetadata.flat();
            let v1 = [];
            let v2 = [];
            let counter = 0;
            for (const tokenData of tokensMetadataFlattened) {
                const collectionId = parseInt(tokenData[3]);
                const collectionName = KnightConfig_1.CollectionName[collectionId - 1];
                if (collectionName) {
                    const id = parseInt(tokenIdsFlattened[counter]);
                    const rarity = parseInt(tokenData[1]);
                    const type = parseInt(tokenData[2]);
                    const exp = parseInt(tokenData[4]);
                    const tRarity = KnightConfig_1.RarityMapping[rarity - 1];
                    const tType = KnightConfig_1.TypeMapping[type - 1];
                    const price = (0, bignumber_js_1.default)(ordersMetadataFlattened[counter][1]).toFixed(0);
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
                        seller: ordersMetadataFlattened[counter][0],
                    };
                    if (collectionId == 1)
                        v1.push(data);
                    else if (collectionId == 2)
                        v2.push(data);
                }
                counter++;
            }
            v1 = v1.sort((item1, item2) => item2.nRarity - item1.nRarity || item2.exp - item1.exp);
            v2 = v2.sort((item1, item2) => item2.nRarity - item1.nRarity || item2.exp - item1.exp);
            appState[mode].sellingNFT.v1 = v1;
            appState[mode].sellingNFT.v2 = v2;
            appState[mode].sellingNFT.isFetch = true;
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateOwnedSellingNFTFromContract = updateOwnedSellingNFTFromContract;
function updateOwnedSellingNFT(appState1) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            if (!((_a = appState === null || appState === void 0 ? void 0 : appState.NFTSellingState) === null || _a === void 0 ? void 0 : _a.v1) && !((_b = appState === null || appState === void 0 ? void 0 : appState.NFTSellingState) === null || _b === void 0 ? void 0 : _b.v2)) {
                updateSellingNFTFromContract(appState1);
            }
            appState.smartWalletState.sellingNFT.v1 = appState.NFTSellingState.v1.filter(x => x.seller.toLowerCase() == appState.smartWalletState.address.toLowerCase());
            appState.smartWalletState.sellingNFT.v2 = appState.NFTSellingState.v2.filter(x => x.seller.toLowerCase() == appState.smartWalletState.address.toLowerCase());
            appState.walletState.sellingNFT.v1 = appState.NFTSellingState.v1.filter(x => x.seller.toLowerCase() == appState.walletState.address.toLowerCase());
            appState.walletState.sellingNFT.v2 = appState.NFTSellingState.v2.filter(x => x.seller.toLowerCase() == appState.walletState.address.toLowerCase());
            appState.walletState.sellingNFT.isFetch = true;
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateOwnedSellingNFT = updateOwnedSellingNFT;
