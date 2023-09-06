import { WalletTravaLPState } from "./TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";
export class SmartWalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFTOwned();
        this.travaLPState = new WalletTravaLPState();
        this.collection = new CollectionOwned();
        this.ethBalances = "";
        this.detailTokenInPool = new Map();
    }
}
