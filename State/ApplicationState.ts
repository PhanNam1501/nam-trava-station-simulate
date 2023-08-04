import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";

export class ApplicationState {
  walletState: WalletState;
  smartWalletState: SmartWalletState;

  constructor(userAddress: EthAddress, smartWalletAddress: EthAddress) {
    this.walletState = new WalletState(userAddress);
    this.smartWalletState = new SmartWalletState(smartWalletAddress);
  }
}
