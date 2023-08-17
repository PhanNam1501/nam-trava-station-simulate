"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravaLPState = exports.WalletTravaLPState = void 0;
/**
 *
 * @param
 * @param
 */
class WalletTravaLPState {
    constructor() {
        this.totalCollateralUSD = "";
        this.totalDebtUSD = "";
        this.availableBorrowsUSD = "";
        this.currentLiquidationThreshold = "";
        this.ltv = "";
        this.healthFactor = "";
    }
}
exports.WalletTravaLPState = WalletTravaLPState;
class TravaLPState {
}
exports.TravaLPState = TravaLPState;
