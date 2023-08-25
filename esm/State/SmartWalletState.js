import { WalletTravaLPState } from "./TravaDeFiState";
import { NFT } from "./WalletState";
export class SmartWalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFT();
        this.travaLPState = new WalletTravaLPState();
        this.collection = new NFT();
        this.ethBalances = "0";
    }
}
