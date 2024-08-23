import BigNumber from "bignumber.js";
import { EthAddress } from "../../utils/types";


export class PancakeFarmState {
    PancakeFarmState: Map<string, PancakeFarmStateChange>;
    isFetch: boolean;
    
  
    constructor() {
      this.PancakeFarmState = new Map<string, PancakeFarmStateChange>();
      this.isFetch = false;

    }
}

export interface PancakeFarmStateChange {
    stakedAmount: string;
    rewardPerSecond:string;
    pendingReward:string;
}