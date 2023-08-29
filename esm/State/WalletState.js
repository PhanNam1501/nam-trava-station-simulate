"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletState = exports.CollectionOwned = exports.NFTOwned = void 0;
const TravaDeFiState_1 = require("./TravaDeFiState");
// export class NFTData {
//   id: string | number;
//   data?: any;
//   constructor() {
//     this.id = '0';
//     this.data = {};
//   }
// }
// export class NFT {
//   v1: Array<NFTData>;
//   v2: Array<NFTData>;
//   constructor() {
//     this.v1 = new Array<NFTData>();
//     this.v2 = new Array<NFTData>();
//   }
// }
class NFTOwned {
    constructor() {
        this.v1 = {};
        this.v2 = {};
    }
}
exports.NFTOwned = NFTOwned;
class CollectionOwned {
    constructor() {
        this.v1 = [];
        this.v2 = [];
        this.specials = [];
    }
}
exports.CollectionOwned = CollectionOwned;
class WalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFTOwned();
        this.collection = new CollectionOwned();
        this.travaLPState = new TravaDeFiState_1.WalletTravaLPState();
        this.ethBalances = "0";
    }
}
exports.WalletState = WalletState;
