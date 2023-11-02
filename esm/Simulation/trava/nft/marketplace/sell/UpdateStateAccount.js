var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import TravaNFTCoreABI from "../../../../../abis/TravaNFTCore.json";
import TravaNFTSellABI from "../../../../../abis/TravaNFTSell.json";
import { Contract } from "ethers";
import { getAddr } from "../../../../../utils/address";
import { CollectionName, RarityMapping, TypeMapping } from "../../helpers/KnightConfig";
import BigNumber from "bignumber.js";
import SellGraphQuery from "../../helpers/SellGraphQuery";
import { _fetchNormal } from "../../helpers/utils";
import { multiCall } from "../../../../../utils/helper";
export function updateSellingNFTFromContract(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const nftsell = new Contract(getAddr("NFT_SELL_ADDRESS", appState.chainId), TravaNFTSellABI, appState.web3);
            const nftCount = yield nftsell.getTokenOnSaleCount();
            const [nftIds] = yield Promise.all([
                multiCall(TravaNFTSellABI, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOnSaleAtIndex",
                    params: [index],
                })), appState.web3, appState.chainId),
            ]);
            const tokenIdsFlattened = nftIds.flat();
            const promises = new Array;
            for (var i = 0; i < tokenIdsFlattened.length; i += 500) {
                const _tokenSlice = tokenIdsFlattened.slice(i, i + 500);
                let nftSellingState = yield _fetchNormal(appState, _tokenSlice);
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
// Graph
export function updateSellingNFTFromGraph(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const a = yield SellGraphQuery.fetchData();
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
export function updateOwnedSellingNFTFromContract(appState1, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const nftsell = new Contract(getAddr("NFT_SELL_ADDRESS", appState.chainId), TravaNFTSellABI, appState.web3);
            const tokenLength = yield nftsell.getTokenOfOwnerBalance(appState[mode].address);
            const [tokenIds] = yield Promise.all([
                multiCall(TravaNFTSellABI, new Array(parseInt(tokenLength)).fill(1).map((_, idx) => ({
                    address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOfOwnerAtIndex",
                    params: [appState[mode].address, idx],
                })), appState.web3, appState.chainId),
            ]);
            const tokenIdsFlattened = tokenIds.flat();
            const [tokensMetadata, ordersMetadata] = yield Promise.all([
                multiCall(TravaNFTCoreABI, tokenIdsFlattened.map((tokenId) => ({
                    address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                    name: "getTokenMetadata",
                    params: [tokenId],
                })), appState.web3, appState.chainId),
                multiCall(TravaNFTSellABI, tokenIdsFlattened.map((tokenId) => ({
                    address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
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
                const collectionName = CollectionName[collectionId - 1];
                if (collectionName) {
                    const id = parseInt(tokenIdsFlattened[counter]);
                    const rarity = parseInt(tokenData[1]);
                    const type = parseInt(tokenData[2]);
                    const exp = parseInt(tokenData[4]);
                    const tRarity = RarityMapping[rarity - 1];
                    const tType = TypeMapping[type - 1];
                    const price = BigNumber(ordersMetadataFlattened[counter][1]).toFixed(0);
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
export function updateOwnedSellingNFT(appState1) {
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
