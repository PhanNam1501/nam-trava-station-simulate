import { EthAddress } from "../utils/types";

export class SmartWalletState {
  address: EthAddress;
  tokenBalances: Array<Map<string, string>>;
  nfts: Array<number>;

  constructor(address: EthAddress) {
    this.address = address;
    this.tokenBalances = new Array<Map<string, string>>();
    this.nfts = new Array<number>();
  }
}
