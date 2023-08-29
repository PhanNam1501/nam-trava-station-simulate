"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartWalletState = void 0;
const TravaDeFiState_1 = require("./TravaDeFiState");
const WalletState_1 = require("./WalletState");
class SmartWalletState {
    constructor(address) {
        this.address = address;
        this.tokenBalances = new Map();
        this.nfts = new WalletState_1.NFTOwned();
        this.travaLPState = new TravaDeFiState_1.WalletTravaLPState();
        this.collection = new WalletState_1.CollectionOwned();
        this.ethBalances = "0";
    }
}
exports.SmartWalletState = SmartWalletState;
