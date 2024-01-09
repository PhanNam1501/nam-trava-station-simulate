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
    constructor() {
      this.forkAaveLP = new Map();
    }
}

export interface WalletForkedAaveLPState {
  id: string;
  address: EthAddress;
  totalAssets: number;
  totalClaimable: number;
  totalDebts: number;
  dapps: Array<Dapp>;
  detailTokenInPool: Map<string, DetailTokenInPool>;
  healthFactor: string;
  ltv: number;
  currentLiquidationThreshold: number;
}