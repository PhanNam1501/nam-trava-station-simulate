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
exports._fetchList = _fetchList;
exports.updateAuctioningNFTFromContract = updateAuctioningNFTFromContract;
exports.updateOwnedAuctioningNFT = updateOwnedAuctioningNFT;
exports.isAuctionOngoing = isAuctionOngoing;
const ethers_1 = require("ethers");
const address_1 = require("../../../../../utils/address");
const TravaNFTAuction_json_1 = __importDefault(require("../../../../../abis/TravaNFTAuction.json"));
const utils_1 = require("../../helpers/utils");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const utils_2 = require("../../../../../utils");
const helper_1 = require("../../../../../utils/helper");
function _fetchList(auctionOrderIdSlice, appState) {
    return __awaiter(this, void 0, void 0, function* () {
        const NFTAuctionContract = new ethers_1.Contract((0, address_1.getAddr)("NFT_AUCTION_ADDRESS", appState.chainId), TravaNFTAuction_json_1.default, appState.web3);
        const auctionOrder = yield (0, helper_1.multiCall)(TravaNFTAuction_json_1.default, auctionOrderIdSlice.map((idx) => ({
            address: (0, address_1.getAddr)("NFT_AUCTION_ADDRESS", appState.chainId),
            name: "getTokenOrder",
            params: [idx],
        })), appState.web3, appState.chainId);
        let collectionsMetadata = yield (0, utils_1.fetchBasicCollections)(auctionOrderIdSlice, appState);
        const auctionOrderFlattened = auctionOrder.flat();
        let changeAuctionKnightData = {
            newStartingBid: ""
        };
        let normalCollections = collectionsMetadata.normalCollections.map((item, index) => (Object.assign(Object.assign(Object.assign({}, item), changeAuctionKnightData), { nftSeller: String(auctionOrderFlattened[index].nftSeller), startingBid: String(auctionOrderFlattened[index].startingBid), currentBidder: String(auctionOrderFlattened[index].currentBidder), currentBid: String(auctionOrderFlattened[index].currentBid), startTime: parseInt(auctionOrderFlattened[index].startTime) * 1000, endTime: parseInt(auctionOrderFlattened[index].endTime) * 1000, bidSteps: parseInt(auctionOrderFlattened[index].bidSteps) })));
        normalCollections = normalCollections.map((i) => (Object.assign(Object.assign({}, i), { price: i.currentBid || i.startingBid })));
        let specialCollections = collectionsMetadata.specialCollections.map((item, index) => (Object.assign(Object.assign(Object.assign({}, item), changeAuctionKnightData), { nftSeller: String(auctionOrderFlattened[index + normalCollections.length].nftSeller), startingBid: (0, bignumber_js_1.default)(auctionOrderFlattened[index + normalCollections.length].startingBid._hex).dividedBy(utils_2.BASE18).toFixed(), currentBidder: String(auctionOrderFlattened[index + normalCollections.length].currentBidder), currentBid: (0, bignumber_js_1.default)(auctionOrderFlattened[index + normalCollections.length].currentBid._hex).dividedBy(utils_2.BASE18).toFixed(), startTime: parseInt(auctionOrderFlattened[index + normalCollections.length].startTime) * 1000, endTime: parseInt(auctionOrderFlattened[index + normalCollections.length].endTime) * 1000, bidSteps: parseInt(auctionOrderFlattened[index + normalCollections.length].bidSteps) })));
        specialCollections = specialCollections.map((i) => (Object.assign(Object.assign({}, i), { price: i.currentBid || i.startingBid })));
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
        const normalItemsCollections = yield (0, utils_1.fetchNormalItems)(armorTokenIdArray, helmetTokenIdArray, shieldTokenIdArray, weaponTokenIdArray, appState);
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
        return { v1: v1.sort(utils_1.collectionSort), v2: v2.sort(utils_1.collectionSort), specials: specialCollections };
    });
}
function updateAuctioningNFTFromContract(appState1_1) {
    return __awaiter(this, arguments, void 0, function* (appState1, chunk = 500) {
        const appState = Object.assign({}, appState1);
        try {
            const NFTAuctionContract = new ethers_1.Contract((0, address_1.getAddr)("NFT_AUCTION_ADDRESS", appState.chainId), TravaNFTAuction_json_1.default, appState.web3);
            const total = parseInt(yield NFTAuctionContract.getTokenOnAunctionCount());
            const [auctionOrderIds] = yield Promise.all([
                (0, helper_1.multiCall)(TravaNFTAuction_json_1.default, new Array(total).fill(1).map((_, idx) => ({
                    address: (0, address_1.getAddr)("NFT_AUCTION_ADDRESS", appState.chainId),
                    name: "getTokenOnAunctionAtIndex",
                    params: [idx],
                })), appState.web3, appState.chainId),
            ]);
            const auctionOrderIdsFlattened = auctionOrderIds.flat();
            (0, utils_1.shuffleArray)(auctionOrderIdsFlattened);
            const n = auctionOrderIdsFlattened.length;
            let promises = [];
            for (let i = 0; i < n; i += chunk) {
                let _slice = auctionOrderIdsFlattened.slice(i, i + chunk);
                promises.push(_fetchList(_slice, appState));
            }
            const result = yield Promise.all(promises);
            if (result.length > 0) {
                const mergedObject = result.reduce((result, element) => ({
                    v1: [...result.v1, ...element.v1],
                    v2: [...result.v2, ...element.v2],
                    specials: [...result.specials, ...element.specials],
                    isFetch: true
                }), { v1: [], v2: [], specials: [], isFetch: false });
                appState.NFTAuctioningState = mergedObject;
            }
            else {
                appState.NFTAuctioningState.v1 = [];
                appState.NFTAuctioningState.v2 = [];
                appState.NFTAuctioningState.specials = [];
            }
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
function updateOwnedAuctioningNFT(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const appState = Object.assign({}, appState1);
        try {
            if (!((_a = appState === null || appState === void 0 ? void 0 : appState.NFTSellingState) === null || _a === void 0 ? void 0 : _a.isFetch)) {
                updateAuctioningNFTFromContract(appState1);
            }
            appState.smartWalletState.auctioningState.v1 = appState.NFTAuctioningState.v1.filter(x => x.nftSeller.toLowerCase() == appState.smartWalletState.address.toLowerCase());
            appState.smartWalletState.auctioningState.v2 = appState.NFTAuctioningState.v2.filter(x => x.nftSeller.toLowerCase() == appState.smartWalletState.address.toLowerCase());
            appState.smartWalletState.auctioningState.specials = appState.NFTAuctioningState.specials.filter(x => x.nftSeller.toLowerCase() == appState.smartWalletState.address.toLowerCase());
            appState.smartWalletState.auctioningState.isFetch = true;
            appState.walletState.auctioningState.v1 = appState.NFTAuctioningState.v1.filter(x => x.nftSeller.toLowerCase() == appState.walletState.address.toLowerCase());
            appState.walletState.auctioningState.v2 = appState.NFTAuctioningState.v2.filter(x => x.nftSeller.toLowerCase() == appState.walletState.address.toLowerCase());
            appState.walletState.auctioningState.specials = appState.NFTAuctioningState.specials.filter(x => x.nftSeller.toLowerCase() == appState.walletState.address.toLowerCase());
            appState.walletState.auctioningState.isFetch = true;
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
function isAuctionOngoing(appState, _tokenId) {
    return __awaiter(this, void 0, void 0, function* () {
        const NFTAuctionContract = new ethers_1.Contract((0, address_1.getAddr)("NFT_AUCTION_ADDRESS", appState.chainId), TravaNFTAuction_json_1.default, appState.web3);
        const isAuctioning = yield NFTAuctionContract.isAuctionOngoing(_tokenId);
        return isAuctioning;
    });
}
