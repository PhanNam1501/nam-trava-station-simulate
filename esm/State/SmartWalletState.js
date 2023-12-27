import { NFTAuctioningState, NFTFarmingsState, NFTSellingState, NFTTicketState } from "./trava/nft/TravaNFTState";
import { WalletTravaLPState, } from "./trava/lending/TravaDeFiState";
import { CollectionOwned, KnightInExpeditionState, NFTOwned } from "./WalletState";
import { VeTravaListState } from "./trava/lending/TravaGovenanceState";
import { LiquidityCampainState } from "./trava";
export class SmartWalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFTOwned();
        this.travaLPState = new WalletTravaLPState();
        this.forkedCompoundLPState = new Map();
        this.forkedAaveLPState = new Map();
        this.collection = new CollectionOwned();
        this.ethBalances = "";
        this.sellingNFT = new NFTSellingState();
        this.auctioningState = new NFTAuctioningState();
        this.NFTFarmingsState = new NFTFarmingsState();
        this.detailTokenInPool = new Map();
        this.travaLPStakingStateList = new Map();
        this.veTravaListState = new VeTravaListState();
        this.knightInExpeditionState = new KnightInExpeditionState();
        this.ticket = new NFTTicketState();
        this.liquidityCampainState = new LiquidityCampainState();
    }
}
