"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAccountVault = exports.TravaLPStakingState = exports.WalletTravaLPState = void 0;
class WalletTravaLPState {
    constructor() {
        this.totalCollateralUSD = "";
        this.totalDebtUSD = "";
        this.availableBorrowsUSD = "";
        this.currentLiquidationThreshold = "";
        this.ltv = "";
        this.healthFactor = "";
        this.lpReward = {
            tokenAddress: "",
            claimableReward: "",
        };
    }
}
exports.WalletTravaLPState = WalletTravaLPState;
class TravaLPStakingState {
    constructor() {
        this.deposited = "";
        this.claimableReward = "";
        this.claimedReward = "";
    }
}
exports.TravaLPStakingState = TravaLPStakingState;
class BaseAccountVault {
    constructor() {
        this.claimable = false;
        this.claimableReward = "0";
        this.deposited = "0";
        this.TVL = "0";
        this.APR = "0";
        this.underlyingToken = {
            underlyingAddress: "",
            reserveDecimals: "",
            price: "0",
        };
        this.stakedToken = {
            id: "",
            name: "",
            code: "",
            stakedTokenAddress: "",
            eps: "",
            reserveDecimals: "",
        };
        this.rewardToken = {
            address: "",
            decimals: "",
            price: ""
        };
    }
}
exports.BaseAccountVault = BaseAccountVault;
