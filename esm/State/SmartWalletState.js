import { NFTAuctioningState, NFTFarmingsState, NFTSellingState } from "./trava/nft/TravaNFTState";
import { WalletTravaLPState, } from "./trava/lending/TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";
import { VeTravaListState } from "./trava/lending/TravaGovenanceState";
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
        this.NFTFarmingsState = new NFTFarmingsState();
        this.farmingState = new Array();
        this.detailTokenInPool = new Map();
        this.travaLPStakingStateList = new Map();
        this.veTravaListState = new VeTravaListState();
    }
}
