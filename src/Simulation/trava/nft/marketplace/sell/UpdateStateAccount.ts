import { ApplicationState } from "../../../../../State/ApplicationState";
import TravaNFTCoreABI from "../../../../../abis/TravaNFTCore.json";
import TravaNFTSellABI from "../../../../../abis/TravaNFTSell.json";
import { Contract } from "ethers";
import { getAddr } from "../../../../../utils/address";
import _ from "lodash";
import { SellingArmouryType } from "../../helpers/global";
import { CollectionName, RarityMapping, TypeMapping } from "../../helpers/KnightConfig";
import BigNumber from "bignumber.js";
import { NFTSellingState } from "../../../../../State/TravaNFTState";
import SellGraphQuery from "../../helpers/SellGraphQuery";
import { _fetchNormal } from "../../helpers/utils"
import { multiCall } from "../../../../../utils/helper";

export async function updateSellingNFTFromContract(
    appState1: ApplicationState,
): Promise<ApplicationState> {
    const appState = { ...appState1 };
    try {
        const nftsell = new Contract(
            getAddr("NFT_SELL_ADDRESS", appState.chainId),
            TravaNFTSellABI,
            appState.web3
        );
        const nftCount = await nftsell.getTokenOnSaleCount();
        const [nftIds] = await Promise.all([
            multiCall(
                TravaNFTSellABI,
                new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
                    address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOnSaleAtIndex",
                    params: [index],
                })),
                appState.web3,
                appState.chainId
            ),
        ]);
        const tokenIdsFlattened = nftIds.flat();

        const promises = new Array<NFTSellingState>;
        for (var i = 0; i < tokenIdsFlattened.length; i += 500) {
            const _tokenSlice = tokenIdsFlattened.slice(i, i + 500);
            let nftSellingState = await _fetchNormal(appState, _tokenSlice)
            promises.push(nftSellingState);
        }
        const result = await Promise.all(promises);
        if (result.length > 0) {
            const mergedObject = result.reduce(
                (result, element) => ({
                    v1: [...result.v1, ...element.v1],
                    v2: [...result.v2, ...element.v2],
                    isFetch: true
                }),
                { v1: [], v2: [], isFetch: false }
            );
            appState.NFTSellingState = mergedObject;
        }
        else {
            appState.NFTSellingState.v1 = [];
            appState.NFTSellingState.v2 = [];
        }
    } catch (e) {
        console.log(e);
    }
    return appState;
}
// Graph
export async function updateSellingNFTFromGraph(
    appState1: ApplicationState,
): Promise<ApplicationState> {
    const appState = { ...appState1 };
    try {
        const a = await SellGraphQuery.fetchData();
        appState.NFTSellingState.v1 = a.v1;
        appState.NFTSellingState.v2 = a.v2;
        appState.NFTSellingState.isFetch = true;
    } catch (e) {
        console.log(e);
    }
    return appState;
}


export async function updateOwnedSellingNFTFromContract(
    appState1: ApplicationState,
    mode: "walletState" | "smartWalletState"
) {
    const appState = { ...appState1 };
    try {
        const nftsell = new Contract(
            getAddr("NFT_SELL_ADDRESS", appState.chainId),
            TravaNFTSellABI,
            appState.web3
        );
        const tokenLength = await nftsell.getTokenOfOwnerBalance(appState[mode].address);
        const [tokenIds] = await Promise.all([
            multiCall(
                TravaNFTSellABI,
                new Array(parseInt(tokenLength)).fill(1).map((_, idx) => ({
                    address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOfOwnerAtIndex",
                    params: [appState[mode].address, idx],
                })),
                appState.web3,
                appState.chainId
            ),
        ]);
        const tokenIdsFlattened = tokenIds.flat();
        const [tokensMetadata, ordersMetadata] = await Promise.all([
            multiCall(
                TravaNFTCoreABI,
                tokenIdsFlattened.map((tokenId: string) => ({
                    address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                    name: "getTokenMetadata",
                    params: [tokenId],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                TravaNFTSellABI,
                tokenIdsFlattened.map((tokenId: string) => ({
                    address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
                    name: "getTokenOrder",
                    params: [tokenId],
                })),
                appState.web3,
                appState.chainId
            ),
        ]);
        const tokensMetadataFlattened = tokensMetadata.flat();
        const ordersMetadataFlattened = ordersMetadata.flat();
        let v1 = [] as Array<SellingArmouryType>;
        let v2 = [] as Array<SellingArmouryType>;
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
                const data: SellingArmouryType = {
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
                if (collectionId == 1) v1.push(data);
                else if (collectionId == 2) v2.push(data);
            }
            counter++;
        }
        v1 = v1.sort((item1, item2) => item2.nRarity - item1.nRarity || item2.exp - item1.exp);
        v2 = v2.sort((item1, item2) => item2.nRarity - item1.nRarity || item2.exp - item1.exp);

        appState[mode].sellingNFT.v1 = v1;
        appState[mode].sellingNFT.v2 = v2;
        appState[mode].sellingNFT.isFetch = true;
    } catch (e) {
        console.log(e);
    }
    return appState;
}

export async function updateOwnedSellingNFT(
    appState1: ApplicationState
) {
    const appState = { ...appState1 };
    try {
        if (!appState?.NFTSellingState?.v1 && !appState?.NFTSellingState?.v2) {
            updateSellingNFTFromContract(appState1);
        }
        appState.smartWalletState.sellingNFT.v1 = appState.NFTSellingState.v1.filter(x => x.seller.toLowerCase() == appState.smartWalletState.address.toLowerCase());
        appState.smartWalletState.sellingNFT.v2 = appState.NFTSellingState.v2.filter(x => x.seller.toLowerCase() == appState.smartWalletState.address.toLowerCase());
        appState.smartWalletState.sellingNFT.isFetch = true;
        
        appState.walletState.sellingNFT.v1 = appState.NFTSellingState.v1.filter(x => x.seller.toLowerCase() == appState.walletState.address.toLowerCase());
        appState.walletState.sellingNFT.v2 = appState.NFTSellingState.v2.filter(x => x.seller.toLowerCase() == appState.walletState.address.toLowerCase());
        appState.walletState.sellingNFT.isFetch = true;
    } catch (e) {
        console.log(e);
    }
    return appState;
}