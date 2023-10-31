import { Contract } from "ethers";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { getAddr } from "../../../../../utils/address";
import TravaNFTAuctionABI from "../../../../../abis/TravaNFTAuction.json"
import { collectionSort, fetchBasicCollections, fetchNormalItems, shuffleArray } from "../../helpers/utils";
import { AuctioningNormalKnight, ChangeAuctionKnightData } from "../../helpers/global";
import BigNumber from "bignumber.js";
import { BASE18 } from "../../../../../utils";
import { uint256 } from "../../../../../utils/types";
import { multiCall } from "../../../../../utils/helper";

export async function _fetchList(auctionOrderIdSlice: any, appState: ApplicationState) {
    const NFTAuctionContract = new Contract(
        getAddr("NFT_AUCTION_ADDRESS", appState.chainId),
        TravaNFTAuctionABI,
        appState.web3
    );

    const auctionOrder = await multiCall(
        TravaNFTAuctionABI,
        auctionOrderIdSlice.map((idx: any) => ({
            address: getAddr("NFT_AUCTION_ADDRESS", appState.chainId),
            name: "getTokenOrder",
            params: [idx],
        })),
        appState.web3,
        appState.chainId
    );

    let collectionsMetadata = await fetchBasicCollections(auctionOrderIdSlice, appState);
    const auctionOrderFlattened = auctionOrder.flat();

    let changeAuctionKnightData: ChangeAuctionKnightData = {
        newStartingBid: ""
    }
    let normalCollections = collectionsMetadata.normalCollections.map((item, index) => ({
        ...item,
        ...changeAuctionKnightData,
        nftSeller: String(auctionOrderFlattened[index].nftSeller),
        startingBid: String(auctionOrderFlattened[index].startingBid),
        currentBidder: String(auctionOrderFlattened[index].currentBidder),
        currentBid: String(auctionOrderFlattened[index].currentBid),
        startTime: parseInt(auctionOrderFlattened[index].startTime) * 1000,
        endTime: parseInt(auctionOrderFlattened[index].endTime) * 1000,
        bidSteps: parseInt(auctionOrderFlattened[index].bidSteps),
    }))
    normalCollections = normalCollections.map((i) => ({ ...i, price: i.currentBid || i.startingBid }));

    let specialCollections = collectionsMetadata.specialCollections.map((item, index) => ({
        ...item,
        ...changeAuctionKnightData,
        nftSeller: String(auctionOrderFlattened[index + normalCollections.length].nftSeller),
        startingBid: BigNumber(auctionOrderFlattened[index + normalCollections.length].startingBid._hex).dividedBy(BASE18).toFixed(),
        currentBidder: String(auctionOrderFlattened[index + normalCollections.length].currentBidder),
        currentBid: BigNumber(auctionOrderFlattened[index + normalCollections.length].currentBid._hex).dividedBy(BASE18).toFixed(),
        startTime: parseInt(auctionOrderFlattened[index + normalCollections.length].startTime) * 1000,
        endTime: parseInt(auctionOrderFlattened[index + normalCollections.length].endTime) * 1000,
        bidSteps: parseInt(auctionOrderFlattened[index + normalCollections.length].bidSteps),
    }))
    specialCollections = specialCollections.map((i) => ({ ...i, price: i.currentBid || i.startingBid }));

    const armorTokenIdArray: Array<string> = [];
    const helmetTokenIdArray: Array<string> = [];
    const shieldTokenIdArray: Array<string> = [];
    const weaponTokenIdArray: Array<string> = [];
    normalCollections.forEach((item, _) => {
        armorTokenIdArray.push(item.armorTokenId.toString());
        helmetTokenIdArray.push(item.helmetTokenId.toString());
        shieldTokenIdArray.push(item.shieldTokenId.toString());
        weaponTokenIdArray.push(item.weaponTokenId.toString());
    });
    const normalItemsCollections = await fetchNormalItems(
        armorTokenIdArray,
        helmetTokenIdArray,
        shieldTokenIdArray,
        weaponTokenIdArray,
        appState
    );
    const v1: Array<AuctioningNormalKnight> = [];
    const v2: Array<AuctioningNormalKnight> = [];
    let counter = 0;
    for (const rawCollection of normalCollections) {
        if (rawCollection.setId == 1) v1.push({ ...rawCollection, ...normalItemsCollections[counter] });
        else if (rawCollection.setId == 2) v2.push({ ...rawCollection, ...normalItemsCollections[counter] });
        counter++;
    }

    return { v1: v1.sort(collectionSort), v2: v2.sort(collectionSort), specials: specialCollections };
}

export async function updateAuctioningNFTFromContract(
    appState1: ApplicationState,
    chunk: number = 500
): Promise<ApplicationState> {
    const appState = { ...appState1 };
    try {
        const NFTAuctionContract = new Contract(
            getAddr("NFT_AUCTION_ADDRESS", appState.chainId),
            TravaNFTAuctionABI,
            appState.web3
        );

        const total = parseInt(await NFTAuctionContract.getTokenOnAunctionCount());
        const [auctionOrderIds] = await Promise.all([
            multiCall(
                TravaNFTAuctionABI,
                new Array(total).fill(1).map((_, idx) => ({
                    address: getAddr("NFT_AUCTION_ADDRESS", appState.chainId),
                    name: "getTokenOnAunctionAtIndex",
                    params: [idx],
                })),
                appState.web3,
                appState.chainId
            ),
        ]);

        const auctionOrderIdsFlattened = auctionOrderIds.flat();
        shuffleArray(auctionOrderIdsFlattened);
        const n = auctionOrderIdsFlattened.length;
        let promises = [];
        for (let i = 0; i < n; i += chunk) {
            let _slice = auctionOrderIdsFlattened.slice(i, i + chunk);
            promises.push(_fetchList(_slice, appState));
        }
        const result = await Promise.all(promises);
        if (result.length > 0) {
            const mergedObject = result.reduce(
                (result, element) => ({
                    v1: [...result.v1, ...element.v1],
                    v2: [...result.v2, ...element.v2],
                    specials: [...result.specials, ...element.specials],
                    isFetch: true
                }),
                { v1: [], v2: [], specials: [], isFetch: false }
            );
            appState.NFTAuctioningState = mergedObject;
        
        }
        else {
            appState.NFTAuctioningState.v1 = [];
            appState.NFTAuctioningState.v2 = [];
            appState.NFTAuctioningState.specials = [];
        }

    } catch (e) {
        console.log(e);
    }
    return appState;
}

export async function updateOwnedAuctioningNFT(
    appState1: ApplicationState
) {
    const appState = { ...appState1 };
    try {
        if (!appState?.NFTSellingState?.isFetch) {
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
    } catch (e) {
        console.log(e);
    }
    return appState;
}

export async function isAuctionOngoing(
    appState: ApplicationState,
    _tokenId: uint256
): Promise<boolean> {
    const NFTAuctionContract = new Contract(
        getAddr("NFT_AUCTION_ADDRESS", appState.chainId),
        TravaNFTAuctionABI,
        appState.web3
    );
    const isAuctioning: boolean = await NFTAuctionContract.isAuctionOngoing(_tokenId);
    return isAuctioning;
}