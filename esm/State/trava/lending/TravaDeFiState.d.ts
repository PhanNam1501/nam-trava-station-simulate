import { EthAddress, uint256 } from "trava-station-sdk";
/**
 *
 * @param
 * @param
 */
export interface LPReward {
    tokenAddress: EthAddress;
    claimableReward: uint256;
}
export declare class WalletTravaLPState {
    totalCollateralUSD: uint256;
    totalDebtUSD: uint256;
    availableBorrowsUSD: uint256;
    currentLiquidationThreshold: uint256;
    ltv: uint256;
    healthFactor: uint256;
    lpReward: LPReward;
    constructor();
}
export declare class TravaLPStakingState {
    deposited: uint256;
    claimableReward: uint256;
    claimedReward: uint256;
    constructor();
}
export interface UnderlyingTokenData {
    underlyingAddress: EthAddress;
    reserveDecimals: string;
    price: string;
}
export interface StakedTokenData {
    id: string;
    name: string;
    code: string;
    stakedTokenAddress: EthAddress;
    eps: uint256;
    reserveDecimals: uint256;
}
export interface RewardTokenData {
    address: EthAddress;
    decimals: uint256;
    price: uint256;
}
export declare class BaseAccountVault {
    claimable: boolean;
    claimableReward: uint256;
    deposited: uint256;
    TVL: uint256;
    APR: uint256;
    underlyingToken: UnderlyingTokenData;
    stakedToken: StakedTokenData;
    rewardToken: RewardTokenData;
    constructor();
}
