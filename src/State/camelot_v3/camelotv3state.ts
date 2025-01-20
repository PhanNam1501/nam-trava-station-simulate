import BigNumber from "bignumber.js";
import { EthAddress } from "../../utils/types";


export class camelotv3state {
    camelotv3state: Map<string, camelotv3statechange>;
    globalstate: Map<string, globalstatechange>;
    poolstate: Map<string, poolstatechange>;
    ticklowerstate: Map<string, ticklowerstatechange>;
    tickupperstate: Map<string, tickupperstatechange>;
    isFetch: boolean;
  
    constructor() {
      this.camelotv3state = new Map<string, camelotv3statechange>();
      this.isFetch = false;
      this.globalstate = new Map<string, globalstatechange>();
      this.poolstate = new Map<string , poolstatechange>();
      this.ticklowerstate = new Map<string, ticklowerstatechange>();
      this.tickupperstate = new Map<string, tickupperstatechange>();
    }
}

export interface camelotv3statechange {
    nonce: number;
    operator: EthAddress;
    token0: EthAddress;
    token1: EthAddress;
    tickLower: number;
    tickUpper: number;
    liquidity: number;
    feeGrowthInside0LastX128: number;
    feeGrowthInside1LastX128: number;
    tokensOwed0: number;
    tokensOwed1: number;
}

export interface globalstatechange {
  price: number;
  tick: number;
  fee: number;
  timepointIndex: number;
  communityFeeToken0: number;
  communityFeeToken1: number;
}

export interface poolstatechange {
  totalFeeGrowth0Token: number;
  totalFeeGrowth1Token: number;
  liquidity: number;
}

export interface ticklowerstatechange {
  liquidityTotal: number;
  liquidityDelta: number;
  outerFeeGrowth0Token: number;
  outerFeeGrowth1Token: number;
}

export interface tickupperstatechange {
  liquidityTotal: number;
  liquidityDelta: number;
  outerFeeGrowth0Token: number;
  outerFeeGrowth1Token: number;
}

