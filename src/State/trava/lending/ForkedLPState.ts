import { EthAddress } from "../../../utils/types";


export interface Asset {
    // key: string;
    id: string;
    type: string;
    // name: string;
    address: EthAddress;
    symbol: string;
    // imgUrl: string;
    price: number;
    totalSupplyInUSD: number;
    // supplyAPY: number;
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
  // projectType: string;
  // name: string;
  // imgUrl: string;
  // key: string;
  // chainId: string;
  value: number;
  assets: Array<Asset>;
}

export interface UserAsset {
    // key: string;
    id: string;
    // name: string;
    type: string;
    address: EthAddress;
    symbol: string;
    amount: number;
    valueInUSD: number;
    // imgUrl: string;
    totalValue: number;
  }
  
  export interface Reserve {
    category: string;
    healthFactor: number;
    deposit: Array<UserAsset>;
    borrow: Array<UserAsset>;
  }
  
  export interface Dapp {
    // key: string;
    id: string;
    type: string;
    // projectType: string;
    // chainId: string;
    // name: string;
    // imgUrl: string;
    value: number;
    depositInUSD: number;
    borrowInUSD: number;
    claimable: number;
    // claimable24hAgo: number;
    reserves: Array<Reserve>;
  }