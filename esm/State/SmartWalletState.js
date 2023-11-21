"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartWalletState = void 0;
const TravaNFTState_1 = require("./trava/nft/TravaNFTState");
const TravaDeFiState_1 = require("./trava/lending/TravaDeFiState");
const WalletState_1 = require("./WalletState");
const TravaGovenanceState_1 = require("./trava/lending/TravaGovenanceState");
class SmartWalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new WalletState_1.NFTOwned();
        this.travaLPState = new TravaDeFiState_1.WalletTravaLPState();
        this.collection = new WalletState_1.CollectionOwned();
        this.ethBalances = "";
        this.sellingNFT = new TravaNFTState_1.NFTSellingState();
        this.auctioningState = new TravaNFTState_1.NFTAuctioningState();
        this.NFTFarmingsState = new TravaNFTState_1.NFTFarmingsState();
        this.detailTokenInPool = new Map();
        this.travaLPStakingStateList = new Map();
        this.veTravaListState = new TravaGovenanceState_1.VeTravaListState();
        this.knightInExpeditionState = new WalletState_1.KnightInExpeditionState();
        this.ticketState = new Map();
    }
}
exports.SmartWalletState = SmartWalletState;
