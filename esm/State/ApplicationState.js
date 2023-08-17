"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationState = void 0;
const WalletState_1 = require("./WalletState");
const SmartWalletState_1 = require("./SmartWalletState");
const NFTState_1 = require("./NFTState");
class ApplicationState {
    constructor(userAddress, smartWalletAddress, web3) {
        this.walletState = new WalletState_1.WalletState(userAddress);
        this.smartWalletState = new SmartWalletState_1.SmartWalletState(smartWalletAddress);
        this.NFTState = new NFTState_1.NFTState();
        this.web3 = web3;
    }
}
exports.ApplicationState = ApplicationState;
