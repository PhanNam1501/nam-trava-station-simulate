/**
 *
 * @param
 * @param
 */
export interface LPReward {
    tokenAddress: string;
    claimableReward: string;
}
export declare class WalletTravaLPState {
    totalCollateralUSD: string;
    totalDebtUSD: string;
    availableBorrowsUSD: string;
    currentLiquidationThreshold: string;
    ltv: string;
    healthFactor: string;
    lpReward: LPReward;
    constructor();
}
export declare class TravaLPStakingState {
    deposited: string;
    claimableReward: string;
    claimedReward: string;
    constructor();
}
export interface UnderlyingTokenData {
    underlyingAddress: string;
    reserveDecimals: string;
    price: string;
}
export interface StakedTokenData {
    id: string;
    name: string;
    code: string;
    stakedTokenAddress: string;
    eps: string;
    reserveDecimals: string;
}
export interface RewardTokenData {
    address: string;
    decimals: string;
    price: string;
}
export declare class BaseAccountVault {
    claimable: boolean;
    claimableReward: string;
    deposited: string;
    TVL: string;
    APR: string;
    underlyingToken: UnderlyingTokenData;
    stakedToken: StakedTokenData;
    rewardToken: RewardTokenData;
    constructor();
}
