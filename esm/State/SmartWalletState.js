import { NFTAuctioningState, NFTSellingState } from "./TravaNFTState";
import { WalletTravaLPState, } from "./TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";
import { VeTravaListState } from "./TravaGovenanceState";
export class SmartWalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFTOwned();
        this.travaLPState = new WalletTravaLPState();
        this.collection = new CollectionOwned();
        this.ethBalances = "";
        this.sellingNFT = new NFTSellingState();
        this.auctioningState = new NFTAuctioningState();
        this.detailTokenInPool = new Map();
        this.travaLPStakingStateList = new Map();
        this.veTravaListState = new VeTravaListState();
    }
}
