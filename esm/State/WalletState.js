"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletState = exports.NFT = exports.NFTData = void 0;
const TravaDeFiState_1 = require("./TravaDeFiState");
class NFTData {
    constructor() {
        this.id = '0';
        this.data = {};
    }
}
exports.NFTData = NFTData;
class NFT {
    constructor() {
        this.v1 = new Array();
        this.v2 = new Array();
    }
}
exports.NFT = NFT;
class WalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFT();
        this.travaLPState = new TravaDeFiState_1.WalletTravaLPState();
        this.collection = new NFT();
        this.ethBalances = "0";
    }
}
exports.WalletState = WalletState;
