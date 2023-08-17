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
exports.updateNFTState = exports.updateNFTBalance = exports.updateTravaBalance = void 0;
const ERC20Mock_json_1 = __importDefault(require("../../abis/ERC20Mock.json"));
const Multicall_json_1 = __importDefault(require("../../abis/Multicall.json"));
const TravaNFTCore_json_1 = __importDefault(require("../../abis/TravaNFTCore.json"));
const TravaNFTSell_json_1 = __importDefault(require("../../abis/TravaNFTSell.json"));
const NFTManager_json_1 = __importDefault(require("../../abis/NFTManager.json"));
const ethers_1 = require("ethers");
const address_1 = require("../../utils/address");
const multiCall = (abi, calls, provider) => __awaiter(void 0, void 0, void 0, function* () {
    let _provider = provider;
    const multi = new ethers_1.Contract((0, address_1.getAddr)("MULTI_CALL_ADDRESS"), Multicall_json_1.default, _provider);
    const itf = new ethers_1.Interface(abi);
    const callData = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)]);
    const { returnData } = yield multi.aggregate(callData);
    return returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
});
function updateTravaBalance(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            // K lấy state của smartwallet
            const TravaTokenAddress = (0, address_1.getAddr)("TRAVA_TOKEN"); // Trava Token Address
            const TravaToken = new ethers_1.Contract(TravaTokenAddress, ERC20Mock_json_1.default, appState.web3);
            const travaBalance = yield TravaToken.balanceOf(appState.walletState.address);
            appState.walletState.tokenBalances.set(TravaTokenAddress, travaBalance);
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateTravaBalance = updateTravaBalance;
function updateNFTBalance(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            // Update mảnh NFT wallet
            const travacore = new ethers_1.Contract((0, address_1.getAddr)("NFT_CORE_ADDRESS"), TravaNFTCore_json_1.default, appState.web3);
            const nftCount = yield travacore.balanceOf(appState.walletState.address);
            const [nftIds] = yield Promise.all([
                multiCall(TravaNFTCore_json_1.default, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: (0, address_1.getAddr)("NFT_CORE_ADDRESS"),
                    name: "tokenOfOwnerByIndex",
                    params: [appState.walletState.address, index],
                })), appState.web3),
            ]);
            const tokenIdsFlattened = nftIds.flat();
            const [data] = yield Promise.all([
                multiCall(NFTManager_json_1.default, tokenIdsFlattened.map((tokenId) => ({
                    address: (0, address_1.getAddr)("NFT_MANAGER_ADDRESS"),
                    name: "checkIfChestOpenedAndSet",
                    params: [tokenId],
                })), appState.web3),
            ]);
            const openedTokens = [];
            tokenIdsFlattened.forEach((tokenId, index) => {
                const version = parseInt(data[index][0]);
                const isOpen = data[index][1];
                if (isOpen) {
                    openedTokens.push({ tokenId, version });
                    if (version == 1) {
                        appState.walletState.nfts.v1.push({ id: tokenId.toString() });
                    }
                    else {
                        appState.walletState.nfts.v2.push({ id: tokenId.toString() });
                    }
                }
            });
            // Update NFT Collection 
            // const travacollection = await ethers.getContractAt(
            //   NFTCollectionABI,
            //   CONTRACT_NETWORK.bsc.NFT_COLLECTION
            // );
            // const nftCount2 = await travacollection.balanceOf(appState.walletState.address);
            appState.walletState.collection.v1.push({ id: "0001" }); // => Fake state cho nhanh
            appState.walletState.collection.v2.push({ id: "0002" });
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateNFTBalance = updateNFTBalance;
function _fetchNormal(appState1, tokenIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        const [tokenOrders, tokenMetadata] = yield Promise.all([
            multiCall(TravaNFTSell_json_1.default, tokenIds.map((tokenId) => ({
                address: (0, address_1.getAddr)("NFT_SELL_ADDRESS"),
                name: "getTokenOrder",
                params: [tokenId],
            })), appState.web3),
            multiCall(TravaNFTCore_json_1.default, tokenIds.map((tokenId) => ({
                address: (0, address_1.getAddr)("NFT_CORE_ADDRESS"),
                name: "getTokenMetadata",
                params: [tokenId],
            })), appState.web3),
        ]);
        const tokenOrdersFlattened = tokenOrders.flat();
        const tokensMetadataFlattened = tokenMetadata.flat();
        let v1 = [];
        let v2 = [];
        let counter = 0;
        const CollectionName = ["genesis", "triumph"];
        for (const tokenData of tokensMetadataFlattened) {
            const collectionId = parseInt(tokenData.collectionId);
            const collectionName = CollectionName[collectionId - 1];
            const rarity = parseInt(tokenData.tokenRarity);
            if (collectionName && rarity >= 1) {
                const id = parseInt(tokenIds[counter]);
                const price = BigInt(tokenOrdersFlattened[counter].price).toString();
                const seller = tokenOrdersFlattened[counter].nftSeller;
                if (collectionId == 1) {
                    appState.NFTState.nfts.v1.push({ id, data: { price, seller } });
                }
                else if (collectionId == 2) {
                    appState.NFTState.nfts.v2.push({ id, data: { price, seller } });
                }
            }
            counter++;
        }
        return appState;
    });
}
function updateNFTState(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            const nftsell = new ethers_1.Contract((0, address_1.getAddr)("NFT_SELL_ADDRESS"), TravaNFTSell_json_1.default, appState.web3);
            const nftCount = yield nftsell.getTokenOnSaleCount();
            const [nftIds] = yield Promise.all([
                multiCall(TravaNFTSell_json_1.default, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: (0, address_1.getAddr)("NFT_SELL_ADDRESS"),
                    name: "getTokenOnSaleAtIndex",
                    params: [index],
                })), appState.web3),
            ]);
            const tokenIdsFlattened = nftIds.flat();
            const promises = [];
            for (var i = 0; i < tokenIdsFlattened.length; i += 500) {
                const _tokenSlice = tokenIdsFlattened.slice(i, i + 500);
                promises.push(_fetchNormal(appState, _tokenSlice));
            }
            yield Promise.all(promises);
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateNFTState = updateNFTState;
