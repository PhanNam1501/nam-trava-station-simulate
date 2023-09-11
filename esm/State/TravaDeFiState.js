/**
 *
 * @param
 * @param
 */
export class WalletTravaLPState {
    constructor() {
        this.totalCollateralUSD = "";
        this.totalDebtUSD = "";
        this.availableBorrowsUSD = "";
        this.currentLiquidationThreshold = "";
        this.ltv = "";
        this.healthFactor = "";
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
        this.id = "";
        this.name = "";
        this.code = "";
        this.underlyingAddress = "";
        this.stakedTokenAddress = "";
        this.claimable = false;
        this.reserveDecimals = "0";
        this.claimableReward = "0";
        this.claimedReward = "0";
        this.deposited = "0";
    }
}
export class TravaLPState {
}
