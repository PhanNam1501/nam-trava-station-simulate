export class WalletTravaLPState {
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
export class TravaLPStakingState {
    constructor() {
        this.deposited = "";
        this.claimableReward = "";
        this.claimedReward = "";
    }
}
export class BaseAccountVault {
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
export class TravaLPState {
}
