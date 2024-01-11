import { EthAddress, uint256 } from "../../../utils/types";
import { Dapp, Market } from "./ForkedLPState";


export interface ForkedCompound{ 
  id: string;
  totalSupplyInUSD: number;
  numberOfLenders: number;
  totalBorrowInUSD: number;
  markets: Array<Market>;
  totalTVL: number;
}

export class ForkedCompoundLPState {
    forkCompoundLP: Map<string, ForkedCompound>;
    isFetch: boolean;
    constructor() {
      this.forkCompoundLP = new Map();
      this.isFetch = false;
    }
}

export interface WalletForkedCompoundLPState {
  id: string;
  address: EthAddress;
  totalAssets: number;
  totalClaimable: number;
  totalDebts: number;
  dapps: Array<Dapp>;
  healthFactor: string;
  ltv: number;
  currentLiquidationThreshold: number;
}