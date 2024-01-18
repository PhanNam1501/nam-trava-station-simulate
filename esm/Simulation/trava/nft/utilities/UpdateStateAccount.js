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
exports.updateOwnerTicketState = exports.updateCollectionBalanceFromGraph = exports.updateCollectionBalanceFromContract = exports.updateNFTBalanceFromContract = exports.updateTravaBalance = void 0;
const ERC20Mock_json_1 = __importDefault(require("../../../../abis/ERC20Mock.json"));
const TravaNFTCore_json_1 = __importDefault(require("../../../../abis/TravaNFTCore.json"));
const NFTCollection_json_1 = __importDefault(require("../../../../abis/NFTCollection.json"));
const NFTManager_json_1 = __importDefault(require("../../../../abis/NFTManager.json"));
const ethers_1 = require("ethers");
const address_1 = require("../../../../utils/address");
const KnightConfig_1 = require("../helpers/KnightConfig");
const CollectionOwnedGraphQuery_1 = __importDefault(require("../helpers/CollectionOwnedGraphQuery"));
const utils_1 = require("../helpers/utils");
const helper_1 = require("../../../../utils/helper");
const NFTTicketABI_json_1 = __importDefault(require("../../../../abis/NFTTicketABI.json"));
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
            if (!appState[mode].nfts.isFetch) {
                const travacore = new ethers_1.Contract((0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId), TravaNFTCore_json_1.default, appState.web3);
                const nftCount = yield travacore.balanceOf(appState[mode].address);
                const [nftIds] = yield Promise.all([
                    (0, helper_1.multiCall)(TravaNFTCore_json_1.default, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                        address: (0, address_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId),
                        name: "tokenOfOwnerByIndex",
                        params: [appState[mode].address, index],
                    })), appState.web3, appState.chainId),
                ]);
                const tokenIdsFlattened = nftIds.flat();
                const [data] = yield Promise.all([
                    (0, helper_1.multiCall)(NFTManager_json_1.default, tokenIdsFlattened.map((tokenId) => ({
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
                    (0, helper_1.multiCall)(TravaNFTCore_json_1.default, openedTokens.map((item, _) => ({
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
            if (!appState[mode].collection.isFetch) {
                const travaCollection = new ethers_1.Contract((0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId), NFTCollection_json_1.default, appState.web3);
                const collectionLen = parseInt(yield travaCollection.balanceOf(appState[mode].address));
                const [collectionIds] = yield Promise.all([
                    (0, helper_1.multiCall)(NFTCollection_json_1.default, new Array(collectionLen).fill(1).map((_, index) => ({
                        address: (0, address_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId),
                        name: 'tokenOfOwnerByIndex',
                        params: [appState[mode].address, index],
                    })), appState.web3, appState.chainId),
                ]);
                const collectionIdsFlattened = collectionIds.flat();
                const { normalCollections, specialCollections } = yield (0, utils_1.fetchBasicCollections)(collectionIdsFlattened, appState);
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
                appState[mode].collection.v1 = v1.sort(utils_1.collectionSort);
                appState[mode].collection.v2 = v2;
                appState[mode].collection.specials = specialCollections;
                appState[mode].collection.isFetch = true;
            }
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateCollectionBalanceFromContract = updateCollectionBalanceFromContract;
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
function updateOwnerTicketState(appState1, _from, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            _from = _from.toLowerCase();
            let mode = (0, helper_1.getMode)(appState, _from);
            if (!appState[mode].ticket.isFetch || force) {
                const TICKET_IDS = ['100001', '100002', '100003'];
                const [ticketOfOwner] = yield Promise.all([
                    (0, helper_1.multiCall)(NFTTicketABI_json_1.default, TICKET_IDS.map((ticket_id) => ({
                        address: (0, address_1.getAddr)("NFT_TICKET", appState.chainId),
                        name: "balanceOf",
                        params: [_from, ticket_id],
                    })), appState.web3, appState.chainId)
                ]);
                let Ticket1 = {
                    ticket: "counter",
                    amount: parseInt(ticketOfOwner[0])
                };
                let Ticket2 = {
                    ticket: "presale",
                    amount: parseInt(ticketOfOwner[1])
                };
                let Ticket3 = {
                    ticket: "incentive",
                    amount: parseInt(ticketOfOwner[2])
                };
                appState[mode].ticket.ticketState.set(TICKET_IDS[0], Ticket1);
                appState[mode].ticket.ticketState.set(TICKET_IDS[1], Ticket2);
                appState[mode].ticket.ticketState.set(TICKET_IDS[2], Ticket3);
                appState[mode].ticket.isFetch = true;
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.updateOwnerTicketState = updateOwnerTicketState;
