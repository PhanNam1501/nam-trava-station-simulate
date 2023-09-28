import { EthAddress } from "../utils/types";
import { NFTSellingState } from "./NFTSellingState";
import {
  BaseAccountVault,
  TravaLPStakingState,
  WalletTravaLPState,
} from "./TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";

export interface OriginTokenData {
  balances: string;
}

export interface TokenInPoolData {
  address: string;
  balances: string;
  decimals: string;
  totalSupply: string;
  originToken: OriginTokenData;
}

export interface DetailTokenInPool {
  decimals: string;
  dToken: TokenInPoolData;
  tToken: TokenInPoolData;
  maxLTV: string;
  liqThres: string;
  price: string;
}

export class SmartWalletState {
  address: EthAddress;
  tokenBalances: Map<string, string>;
  nfts: NFTOwned;
  collection: CollectionOwned;
  travaLPState: WalletTravaLPState;
  ethBalances: string;
  sellingNFT: NFTSellingState;
  detailTokenInPool: Map<string, DetailTokenInPool>;
  travaLPStakingStateList: Map<string, BaseAccountVault>;

  constructor(address: EthAddress) {
    this.address = address;
    this.tokenBalances = new Map<string, string>();
    this.nfts = new NFTOwned();
    this.travaLPState = new WalletTravaLPState();
    this.collection = new CollectionOwned();
    this.ethBalances = "";
    this.sellingNFT = new NFTSellingState();
    this.detailTokenInPool = new Map();
    this.travaLPStakingStateList = new Map();
  }

  // async getTokenAmount(tokenAddress: string): Promise<string> {
  //   // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
  //   if (this.tokenBalances.length > 0) {
  //     // check tokenAddress is exist on appState.walletState.tokenBalances
  //     for (let i = 0; i < this.tokenBalances.length; i++) {
  //       // console.log(appState.walletState.tokenBalances[i].has(tokenAddress));
  //       if (this.tokenBalances[i].has(tokenAddress)) {
  //         return this.tokenBalances[i].get(tokenAddress)!;
  //       }
  //     }
  //   }
  //   return "0";
  // }

  // async getTokenBalances(tokenAddress: string): Promise<any> {
  //   // find tokenAddress in tokenBalances
  //   for (let i = 0; i < this.tokenBalances.length; i++) {
  //     if (this.tokenBalances[i].has(tokenAddress)) {
  //       return this.tokenBalances[i];
  //     }
  //   }
  //   return null;
  // }
}
