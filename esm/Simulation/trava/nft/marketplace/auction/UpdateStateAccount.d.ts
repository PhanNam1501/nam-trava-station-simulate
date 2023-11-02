import { ApplicationState } from "../../../../../State/ApplicationState";
import { AuctioningNormalKnight } from "../../helpers/global";
import { uint256 } from "../../../../../utils/types";
export declare function _fetchList(auctionOrderIdSlice: any, appState: ApplicationState): Promise<{
    v1: AuctioningNormalKnight[];
    v2: AuctioningNormalKnight[];
    specials: {
        nftSeller: string;
        startingBid: string;
        currentBidder: string;
        currentBid: string;
        startTime: number;
        endTime: number;
        bidSteps: number;
        newStartingBid: string;
        metadataLink: string;
        armorTokenId: number;
        helmetTokenId: number;
        shieldTokenId: number;
        weaponTokenId: number;
        rarity: number;
        id: number;
        setId: number;
        exp: number;
    }[];
}>;
export declare function updateAuctioningNFTFromContract(appState1: ApplicationState, chunk?: number): Promise<ApplicationState>;
export declare function updateOwnedAuctioningNFT(appState1: ApplicationState): Promise<{
    createdTime: number;
    walletState: import("../../../../..").WalletState;
    smartWalletState: import("../../../../..").SmartWalletState;
    NFTSellingState: import("../../../../..").NFTSellingState;
    NFTAuctioningState: import("../../../../..").NFTAuctioningState;
    TravaGovernanceState: import("../../../../..").TravaGovernanceState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function isAuctionOngoing(appState: ApplicationState, _tokenId: uint256): Promise<boolean>;
