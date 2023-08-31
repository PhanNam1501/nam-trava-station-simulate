import { WalletTravaLPState } from "./TravaDeFiState";
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
export class NFTOwned {
    constructor() {
        this.v1 = {};
        this.v2 = {};
    }
}
export class CollectionOwned {
    constructor() {
        this.v1 = [];
        this.v2 = [];
        this.specials = [];
    }
}
export class WalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFTOwned();
        this.collection = new CollectionOwned();
        this.travaLPState = new WalletTravaLPState();
        this.ethBalances = "";
    }
}
