import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTState } from "./NFTState";

export class ApplicationState {
  walletState: WalletState;
  smartWalletState: SmartWalletState;
  NFTState: NFTState;

  constructor(userAddress: EthAddress, smartWalletAddress: EthAddress) {
    this.walletState = new WalletState(userAddress);
    this.smartWalletState = new SmartWalletState(smartWalletAddress);
    this.NFTState = new NFTState();
  }
}
