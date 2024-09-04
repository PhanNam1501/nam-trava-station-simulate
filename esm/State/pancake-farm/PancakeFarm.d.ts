import { uint256 } from "../../utils/types";
import { TokenInFarm } from "../../utils";
export declare class PancakeFarmState {
    PancakeFarmState: Map<string, PancakeFarmStateChange>;
    isFetch: boolean;
    constructor();
}
export declare class UserPancakeFarmState {
    userPancakeFarmState: Map<string, UserPancakeFarmStateChange>;
    isFetch: boolean;
    constructor();
}
export interface UserPancakeFarmStateChange {
    stakedAmount: string;
    pendingReward: string;
}
export interface PancakeFarmStateChange {
    rewardPerSecond: string;
    totalStakeAmount: uint256;
    rewardToken: TokenInFarm;
    stakedToken: TokenInFarm;
}
