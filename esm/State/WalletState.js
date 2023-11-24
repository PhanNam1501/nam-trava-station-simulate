"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletState = exports.Ticket = exports.KnightInExpeditionState = exports.CollectionOwned = exports.NFTOwned = void 0;
const TravaNFTState_1 = require("./trava/nft/TravaNFTState");
const TravaDeFiState_1 = require("./trava/lending/TravaDeFiState");
const TravaGovenanceState_1 = require("./trava/lending/TravaGovenanceState");
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
        this.isFetch = false;
    }
}
exports.NFTOwned = NFTOwned;
class CollectionOwned {
    constructor() {
        this.v1 = [];
        this.v2 = [];
        this.specials = [];
        this.isFetch = false;
    }
}
exports.CollectionOwned = CollectionOwned;
class KnightInExpeditionState {
    constructor() {
        this.expedition = new Map();
        this.isFetch = false;
    }
}
exports.KnightInExpeditionState = KnightInExpeditionState;
class Ticket {
    constructor() {
        this.ticket = "";
        this.amount = 0;
    }
}
exports.Ticket = Ticket;
class WalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFTOwned();
        this.collection = new CollectionOwned();
        this.travaLPState = new TravaDeFiState_1.WalletTravaLPState();
        this.ethBalances = "";
        this.sellingNFT = new TravaNFTState_1.NFTSellingState();
        this.auctioningState = new TravaNFTState_1.NFTAuctioningState();
        this.veTravaListState = new TravaGovenanceState_1.VeTravaListState();
        this.knightInExpeditionState = new KnightInExpeditionState();
        this.ticket = new TravaNFTState_1.NFTTicketState();
    }
}
exports.WalletState = WalletState;
