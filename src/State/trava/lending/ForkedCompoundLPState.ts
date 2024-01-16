import { EthAddress, uint256 } from "../../../utils/types";
import { UserAsset, Market } from "./ForkedLPState";


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
  dapps: Array<DappCompound>;
  healthFactor: string;
  ltv: number;
  currentLiquidationThreshold: number;
}

export interface ReserveCompound {
  category: string;
  healthFactor: number;
  deposit: Array<UserAsset>;
  borrow: Array<UserAsset>;
  assetsIn: Array<EthAddress>;
}

export interface DappCompound {
  id: string;
  type: string;
  value: number;
  depositInUSD: number;
  borrowInUSD: number;
  claimable: number;
  reserves: Array<ReserveCompound>;
}