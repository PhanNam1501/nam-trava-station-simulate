import { EthAddress } from "../utils/types";
import { WalletTravaLPState } from "./TravaDeFiState";

export class SmartWalletState {
  address: EthAddress;
  tokenBalances: Array<Map<string, string>>;
  nfts: Array<number>;
  travaLPState: WalletTravaLPState;

  constructor(address: EthAddress) {
    this.address = address;
    this.tokenBalances = new Array<Map<string, string>>();
    this.nfts = new Array<number>();
    this.travaLPState = new WalletTravaLPState();
  }

  async getTokenAmount(tokenAddress: string): Promise<string> {
    // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
    if (this.tokenBalances.length > 0) {
      // check tokenAddress is exist on appState.walletState.tokenBalances
      for (let i = 0; i < this.tokenBalances.length; i++) {
        // console.log(appState.walletState.tokenBalances[i].has(tokenAddress));
        if (this.tokenBalances[i].has(tokenAddress)) {
          return this.tokenBalances[i].get(tokenAddress)!;
        }
      }
    }
    return "0";
  }

  async getTokenBalances(tokenAddress: string): Promise<any> {
    // find tokenAddress in tokenBalances
    for (let i = 0; i < this.tokenBalances.length; i++) {
      if (this.tokenBalances[i].has(tokenAddress)) {
        return this.tokenBalances[i];
      }
    }
    return null;
  }
}
