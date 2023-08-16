var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ERC20Mock from "../../abis/ERC20Mock.json";
import MultiCallABI from "../../abis/Multicall.json";
import TravaNFTCoreABI from "../../abis/TravaNFTCore.json";
import TravaNFTSellABI from "../../abis/TravaNFTSell.json";
import NFTManagerABI from "../../abis/NFTManager.json";
import { Contract, Interface } from "ethers";
import { getAddr } from "../../utils/address";
const multiCall = (abi, calls, provider) => __awaiter(void 0, void 0, void 0, function* () {
    let _provider = provider;
    const multi = new Contract(getAddr("MULTI_CALL_ADDRESS"), MultiCallABI, _provider);
    const itf = new Interface(abi);
    const callData = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)]);
    const { returnData } = yield multi.aggregate(callData);
    return returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
});
export function updateTravaBalance(appState) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // K lấy state của smartwallet
            const TravaTokenAddress = "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37"; // Trava Token Address
            const TravaToken = new Contract(TravaTokenAddress, ERC20Mock, appState.web3);
            const travaBalance = yield TravaToken.balanceOf(appState.walletState.address);
            appState.walletState.tokenBalances.set(TravaTokenAddress, travaBalance);
        }
        catch (e) {
            console.log(e);
        }
    });
}
export function updateNFTBalance(appState) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Update mảnh NFT wallet
            const travacore = new Contract(getAddr("NFT_CORE_ADDRESS"), TravaNFTCoreABI, appState.web3);
            const nftCount = yield travacore.balanceOf(appState.walletState.address);
            const [nftIds] = yield Promise.all([
                multiCall(TravaNFTCoreABI, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: getAddr("NFT_CORE_ADDRESS"),
                    name: "tokenOfOwnerByIndex",
                    params: [appState.walletState.address, index],
                })), appState.web3),
            ]);
            const tokenIdsFlattened = nftIds.flat();
            const [data] = yield Promise.all([
                multiCall(NFTManagerABI, tokenIdsFlattened.map((tokenId) => ({
                    address: getAddr("NFT_MANAGER_ADDRESS"),
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
            //   process.env.NFT_COLLECTION_ADDRESS
            // );
            // const nftCount2 = await travacollection.balanceOf(appState.walletState.address);
            appState.walletState.collection.v1.push({ id: "0001" }); // => Fake state cho nhanh
            appState.walletState.collection.v2.push({ id: "0002" });
        }
        catch (e) {
            console.log(e);
        }
    });
}
function _fetchNormal(appState, tokenIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const [tokenOrders, tokenMetadata] = yield Promise.all([
            multiCall(TravaNFTSellABI, tokenIds.map((tokenId) => ({
                address: getAddr("NFT_SELL_ADDRESS"),
                name: "getTokenOrder",
                params: [tokenId],
            })), appState.web3),
            multiCall(TravaNFTCoreABI, tokenIds.map((tokenId) => ({
                address: getAddr("NFT_CORE_ADDRESS"),
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
    });
}
export function updateNFTState(appState) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const nftsell = new Contract(getAddr("NFT_SELL_ADDRESS"), TravaNFTSellABI, appState.web3);
            const nftCount = yield nftsell.getTokenOnSaleCount();
            const [nftIds] = yield Promise.all([
                multiCall(TravaNFTSellABI, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: getAddr("NFT_SELL_ADDRESS"),
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
    });
}
