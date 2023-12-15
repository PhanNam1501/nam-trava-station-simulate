import { EthAddress, uint256 } from "../../../utils/types";
import { Dapp, Market } from "./ForkedLPState";

export interface ForkedAave{ 
  id: string;
  totalSupplyInUSD: number;
  numberOfLenders: number;
  totalBorrowInUSD: number;
  markets: Array<Market>;
  totalTVL: number;
}

export class ForkedAaveLPState {
    forkAaveLP: Map<string, ForkedAave>;
    isFetch: boolean;
    constructor() {
      this.forkAaveLP = new Map<string,ForkedAave>();
      this.isFetch = false;
    }
}

export interface WalletForkedAaveLPState {
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
}