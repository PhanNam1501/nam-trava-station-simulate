"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTState = exports.NFT = exports.NFTData = void 0;
class NFTData {
    constructor() {
        this.id = '0';
        this.data = {
            price: "0",
            seller: "0x0000000000000000000000000000000000000000"
        };
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
class NFTState {
    constructor() {
        this.nfts = new NFT();
    }
}
exports.NFTState = NFTState;
