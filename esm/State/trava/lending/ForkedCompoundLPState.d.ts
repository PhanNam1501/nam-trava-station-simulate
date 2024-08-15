import { EthAddress } from "../../../utils/types";
import { TokenInPoolData } from "../../SmartWalletState";
import { UserAsset, Market } from "./ForkedLPState";
export interface ForkedCompound {
    id: string;
    totalSupplyInUSD: number;
    numberOfLenders: number;
    totalBorrowInUSD: number;
    markets: Array<Market>;
    totalTVL: number;
}
export declare class ForkedCompoundLPState {
    forkCompoundLP: Map<string, ForkedCompound>;
    isFetch: boolean;
    constructor();
}
export interface DetailTokenInPoolCompound {
    decimals: string;
    cToken: TokenInPoolData;
    maxLTV: string;
    liqThres: string;
    price: string;
}
export interface WalletForkedCompoundLPState {
    id: string;
    address: EthAddress;
    totalAssets: number;
    totalClaimable: number;
    totalDebts: number;
    dapps: Array<DappCompound>;
    detailTokenInPool: Map<string, DetailTokenInPoolCompound>;
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
export interface inputCollateral {
    tokenAddress: EthAddress;
    enableAsColl: number;
}
