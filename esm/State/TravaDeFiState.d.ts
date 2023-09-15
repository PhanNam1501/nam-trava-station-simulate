/**
 *
 * @param
 * @param
 */
export declare class WalletTravaLPState {
    totalCollateralUSD: string;
    totalDebtUSD: string;
    availableBorrowsUSD: string;
    currentLiquidationThreshold: string;
    ltv: string;
    healthFactor: string;
    constructor();
}
export declare class TravaLPStakingState {
    deposited: string;
    claimableReward: string;
    claimedReward: string;
    constructor();
}
export declare class BaseAccountVault {
    id: string;
    name: string;
    code: string;
    underlyingAddress: string;
    stakedTokenAddress: string;
    claimable: boolean;
    reserveDecimals: string;
    claimableReward: string;
    claimedReward: string;
    deposited: string;
    constructor();
}
export declare class TravaLPState {
}
