import { EthAddress } from "../../../utils/types";
export type TokenAPY = {
    supplyAPY: number;
    borrowAPY: number;
};
export interface Asset {
    id: string;
    type: string;
    address: EthAddress;
    symbol: string;
    price: number;
    totalSupplyInUSD: number;
    supplyAPY: number;
    numberOfLenders: number;
    totalBorrowInUSD: number;
    borrowAPY: number;
    numberOfBorrows: number;
    liquidationThreshold: number;
    loanToValue: number;
}
export interface Market {
    id: string;
    type: string;
    value: number;
    assets: Array<Asset>;
}
export interface UserAsset {
    id: string;
    type: string;
    address: EthAddress;
    symbol: string;
    amount: number;
    valueInUSD: number;
    totalValue: number;
    isCollateral: boolean;
}
export interface Reserve {
    category: string;
    healthFactor: number;
    deposit: Array<UserAsset>;
    borrow: Array<UserAsset>;
}
export interface Dapp {
    id: string;
    type: string;
    value: number;
    depositInUSD: number;
    borrowInUSD: number;
    claimable: number;
    reserves: Array<Reserve>;
}
