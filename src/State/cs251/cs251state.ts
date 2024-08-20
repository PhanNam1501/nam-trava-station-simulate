import BigNumber from "bignumber.js";
import { EthAddress } from "../../utils/types";


export class cs251state {
    cs251state: Map<string, cs251statechange>;
    isFetch: boolean;
    //  eth_reserve: string;
    //  token_reserve:string;
    //  total_shares:string;
    //  lps:string;
    //  exchange: EthAddress;
  
    constructor() {
      this.cs251state = new Map<string, cs251statechange>();
      this.isFetch = false;

    }
}

export interface cs251statechange {
    eth_reserve: string;
    token_reserve:string;
    total_shares:string;
    lps:string;
}
