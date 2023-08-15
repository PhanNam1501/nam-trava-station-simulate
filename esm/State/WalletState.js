import { WalletTravaLPState } from "./TravaDeFiState";
export class NFTData {
    constructor() {
        this.id = '0';
        this.data = {};
    }
}
export class NFT {
    constructor() {
        this.v1 = new Array();
        this.v2 = new Array();
    }
}
export class WalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFT();
        this.travaLPState = new WalletTravaLPState();
        this.collection = new NFT();
        this.ethBalances = "0";
    }
}
