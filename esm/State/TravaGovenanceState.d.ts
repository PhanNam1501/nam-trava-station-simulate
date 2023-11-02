import { EthAddress, uint256 } from "trava-station-sdk";
import { TokenLockOption } from './../Simulation/trava/governance/travaGovernanceConfig';
export declare class TravaGovernanceState {
    totalSupply: uint256;
    rewardTokenInfo: rewardTokenInfo;
    tokensInGovernance: Map<string, TokenLock>;
    constructor();
}
export interface TokenLock extends TokenLockOption {
    ratio: uint256;
}
export interface TokenInVeTrava {
    balances: uint256;
    tokenLockOption: TokenLockOption;
}
export interface RewardTokenBalance {
    compoundAbleRewards: uint256;
    compoundedRewards: uint256;
    balances: uint256;
}
export interface rewardTokenInfo {
    address: EthAddress;
    decimals: uint256;
}
export interface VeTravaState {
    id: uint256;
    votingPower: uint256;
    tokenInVeTrava: TokenInVeTrava;
    unlockTime: uint256;
    rewardTokenBalance: RewardTokenBalance;
}
export declare class VeTravaListState {
    veTravaList: Map<string, VeTravaState>;
    isFetch: boolean;
    constructor();
}
