import { NFTAuctioningState, NFTSellingState, NFTTicketState } from "./trava/nft/TravaNFTState";
import { WalletTravaLPState } from "./trava/lending/TravaDeFiState";
import { VeTravaListState } from "./trava/lending/TravaGovenanceState";
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
        this.isFetch = false;
    }
}
export class CollectionOwned {
    constructor() {
        this.v1 = [];
        this.v2 = [];
        this.specials = [];
        this.isFetch = false;
    }
}
export class KnightInExpeditionState {
    constructor() {
        this.expedition = new Map();
        this.isFetch = false;
    }
}
export class Ticket {
    constructor() {
        this.ticket = "";
        this.amount = 0;
    }
}
export class WalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new NFTOwned();
        this.collection = new CollectionOwned();
        this.travaLPState = new WalletTravaLPState();
        this.forkedCompoundLPState = new Map();
        this.forkedAaveLPState = new Map();
        this.ethBalances = "";
        this.sellingNFT = new NFTSellingState();
        this.auctioningState = new NFTAuctioningState();
        this.veTravaListState = new VeTravaListState();
        this.knightInExpeditionState = new KnightInExpeditionState();
        this.ticket = new NFTTicketState();
    }
}
