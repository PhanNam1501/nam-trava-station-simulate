import { EthAddress } from "../utils/types";
import { WalletTravaLPState } from "./TravaDeFiState";
/**
 *
 * @param
 * @param
 */
export class WalletState {
  address: EthAddress;
  tokenBalances: Array<Map<string, string>>;
  nfts: Array<number>;
  travaLPState: WalletTravaLPState;

  constructor(address: string) {
    this.address = address;
    this.tokenBalances = new Array<Map<string, string>>();
    this.nfts = new Array<number>();
    this.travaLPState = new WalletTravaLPState();
  }
}
