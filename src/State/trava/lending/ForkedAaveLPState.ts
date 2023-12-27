import { EthAddress, uint256 } from "../../../utils/types";
import { DetailTokenInPool } from "../../SmartWalletState";
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
<<<<<<< HEAD
      this.forkAaveLP = new Map();
=======
      this.forkAaveLP = new Map<string,ForkedAave>();
>>>>>>> refs/remotes/origin/main
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
  detailTokenInPool: Map<string, DetailTokenInPool>;
  healthFactor: string;
  ltv: number;
  currentLiquidationThreshold: number;
}