import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTState } from "./NFTState";
import { JsonRpcProvider } from "ethers";

export class ApplicationState {
  walletState: WalletState;
  smartWalletState: SmartWalletState;
  NFTState: NFTState;
  web3: JsonRpcProvider | null;
  chainId: number | undefined;
  constructor(
    userAddress: EthAddress,
    smartWalletAddress: EthAddress,
    web3: JsonRpcProvider | null,
    chainId: number | undefined
  ) {
    this.walletState = new WalletState(userAddress);
    this.smartWalletState = new SmartWalletState(smartWalletAddress);
    this.NFTState = new NFTState();
    this.web3 = web3;
    this.chainId = chainId;
  }
}
