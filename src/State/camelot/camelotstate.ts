import BigNumber from "bignumber.js";
import { EthAddress } from "../../utils/types";


export class camelotstate {
    camelotstate: Map<string, camelotstatechange>;
    isFetch: boolean;
  
    constructor() {
      this.camelotstate = new Map<string, camelotstatechange>();
      this.isFetch = false;

    }
}

export interface camelotstatechange {
    token0addr: EthAddress;
    token1addr: EthAddress;
    pairaddr: EthAddress;
    reserves0: number;
    reserves1: number;
    liquidity: number;
    totalSupply: number;
}

