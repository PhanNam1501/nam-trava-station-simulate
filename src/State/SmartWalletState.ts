import { EthAddress } from "../utils/types";
import { NFTAuctioningState, NFTSellingState } from "./TravaNFTState";
import {
  BaseAccountVault,
  WalletTravaLPState,
} from "./TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";
import { VeTravaState } from "./TravaGovenanceState"
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
  auctioningState: NFTAuctioningState;
  detailTokenInPool: Map<string, DetailTokenInPool>;
  travaLPStakingStateList: Map<string, BaseAccountVault>;
  veTravaListState: Map<string, VeTravaState>;
  constructor(address: EthAddress) {
    this.address = address;
    this.tokenBalances = new Map<string, string>();
    this.nfts = new NFTOwned();
    this.travaLPState = new WalletTravaLPState();
    this.collection = new CollectionOwned();
    this.ethBalances = "";
    this.sellingNFT = new NFTSellingState();
    this.auctioningState = new NFTAuctioningState();
    this.detailTokenInPool = new Map();
    this.travaLPStakingStateList = new Map();
    this.veTravaListState = new Map();
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
