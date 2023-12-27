import { EthAddress, uint256 } from "../../../utils/types";
import { Dapp, Market } from "./ForkedLPState";


export interface ForkedCompound{ 
  id: string;
  // chain: string;
  // numberOfUsers: number;
  // realUsersRatio: number;
  totalSupplyInUSD: number;
  numberOfLenders: number;
  totalBorrowInUSD: number;
  // numberOfBorrowers: number;
  markets: Array<Market>;
  totalTVL: number;
  // tvlChangeRate: number;
  // lastUpdatedAt: number;
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
  // chain: string;
  totalAssets: number;
  // totalAssets24hAgo: number;
  totalClaimable: number;
  // totalClaimable24hAgo: number;
  totalDebts: number;
  // totalDebts24hAgo: number;
  dapps: Array<Dapp>;
  healthFactor: string;
  ltv: number;
  currentLiquidationThreshold: number;
}