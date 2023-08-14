import { EthAddress } from "../utils/types";
import { WalletTravaLPState } from "./TravaDeFiState";
import { NFT } from "./WalletState";

export class SmartWalletState {
  address: EthAddress;
  tokenBalances: Map<string, string>;
  nfts: NFT;
  collection: NFT;
  travaLPState: WalletTravaLPState;
  ethBalances : string;

  constructor(address: EthAddress) {
    this.address = address;
    this.tokenBalances = new Map<string, string>();
    this.nfts = new NFT();
    this.travaLPState = new WalletTravaLPState();
    this.collection = new NFT();
    this.ethBalances = "0"
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
