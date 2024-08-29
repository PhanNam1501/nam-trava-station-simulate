import BigNumber from "bignumber.js";
import { EthAddress, uint256 } from "../../utils/types";
import { TokenInFarm } from "../../utils";

export class PancakeFarmState {
  PancakeFarmState: Map<string, PancakeFarmStateChange>;
  isFetch: boolean;
  

  constructor() {
    this.PancakeFarmState = new Map<string, PancakeFarmStateChange>();
    this.isFetch = false;

  }
}
export class UserPancakeFarmState {
    userPancakeFarmState: Map<string, UserPancakeFarmStateChange>;
    isFetch: boolean;
    
  
    constructor() {
      this.userPancakeFarmState = new Map<string, UserPancakeFarmStateChange>();
      this.isFetch = false;

    }
}

export interface UserPancakeFarmStateChange {
    stakedAmount: string;
    pendingReward:string;
}

export interface PancakeFarmStateChange {
  rewardPerSecond:string;
  totalStakeAmount: uint256;
  rewardToken: TokenInFarm;
  stakedToken: TokenInFarm;
}