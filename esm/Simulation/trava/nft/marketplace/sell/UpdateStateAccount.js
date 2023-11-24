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
exports.updateOwnedSellingNFT = exports.updateOwnedSellingNFTFromContract = exports.updateSellingNFTFromGraph = exports.updateSellingNFTFromContract = void 0;
const TravaNFTCore_json_1 = __importDefault(require("../../../../../abis/TravaNFTCore.json"));
const TravaNFTSell_json_1 = __importDefault(require("../../../../../abis/TravaNFTSell.json"));
const ethers_1 = require("ethers");
const address_1 = require("../../../../../utils/address");
const KnightConfig_1 = require("../../helpers/KnightConfig");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const SellGraphQuery_1 = __importDefault(require("../../helpers/SellGraphQuery"));
const utils_1 = require("../../helpers/utils");
const helper_1 = require("../../../../../utils/helper");
function updateSellingNFTFromContract(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const nftsell = new ethers_1.Contract((0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId), TravaNFTSell_json_1.default, appState.web3);
            const nftCount = yield nftsell.getTokenOnSaleCount();
            const [nftIds] = yield Promise.all([
                (0, helper_1.multiCall)(TravaNFTSell_json_1.default, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: (0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOnSaleAtIndex",
                    params: [index],
                })), appState.web3, appState.chainId),
            ]);
            const tokenIdsFlattened = nftIds.flat();
            const promises = new Array;
            for (var i = 0; i < tokenIdsFlattened.length; i += 500) {
                const _tokenSlice = tokenIdsFlattened.slice(i, i + 500);
                let nftSellingState = yield (0, utils_1._fetchNormal)(appState, _tokenSlice);
                promises.push(nftSellingState);
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
function updateOwnedSellingNFTFromContract(appState1, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const nftsell = new ethers_1.Contract((0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId), TravaNFTSell_json_1.default, appState.web3);
            const tokenLength = yield nftsell.getTokenOfOwnerBalance(appState[mode].address);
            const [tokenIds] = yield Promise.all([
                (0, helper_1.multiCall)(TravaNFTSell_json_1.default, new Array(parseInt(tokenLength)).fill(1).map((_, idx) => ({
                    address: (0, address_1.getAddr)("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOfOwnerAtIndex",
                    params: [appState[mode].address, idx],
                })), appState.web3, appState.chainId),
            ]);
            const tokenIdsFlattened = tokenIds.flat();
            const [tokensMetadata, ordersMetadata] = yield Promise.all([
                (0, helper_1.multiCall)(TravaNFTCore_json_1.default, tokenIdsFlattened.map((tokenId) => ({
                    address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
                    name: "getTokenMetadata",
                    params: [tokenId],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(TravaNFTSell_json_1.default, tokenIdsFlattened.map((tokenId) => ({
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
            appState.smartWalletState.sellingNFT.isFetch = true;
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
