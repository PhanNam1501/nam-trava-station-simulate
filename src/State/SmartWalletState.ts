import { EthAddress } from "../utils/types";
import { NFTSellingState } from "./NFTSellingState";
import { WalletTravaLPState } from "./TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";

export interface TokenData {
  address: string;
  balances: string;
}

export interface DetailTokenInPool {
  dToken: TokenData;
  tToken: TokenData;
}

export class SmartWalletState {
  address: EthAddress;
  tokenBalances: Map<string, string>;
  nfts: NFTOwned;
  collection: CollectionOwned;
  travaLPState: WalletTravaLPState;
  ethBalances: string;
  sellingNFT: NFTSellingState;
  detailTokenInPool: Map<any, any>;
  sellingNFT: NFTSellingState;

  constructor(address: EthAddress) {
    this.address = address;
    this.tokenBalances = new Map<string, string>();
    this.nfts = new NFTOwned();
    this.travaLPState = new WalletTravaLPState();
    this.collection = new CollectionOwned();
    this.ethBalances = "";
    this.sellingNFT = new NFTSellingState();
    this.detailTokenInPool = new Map();
    this.sellingNFT = new NFTSellingState();
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