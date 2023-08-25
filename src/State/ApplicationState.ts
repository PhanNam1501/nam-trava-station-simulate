import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTState } from "./NFTState";
import { JsonRpcProvider } from "ethers";

export class ApplicationState {
  walletState: WalletState;
  smartWalletState: SmartWalletState;
  NFTState: NFTState;
  web3: JsonRpcProvider | null

  constructor(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider | null) {
    this.walletState = new WalletState(userAddress);
    this.smartWalletState = new SmartWalletState(smartWalletAddress);
    this.NFTState = new NFTState();
    this.web3 = web3;
  }

}

export async function initializeState(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider | null): Promise<ApplicationState> {
  const appState = new ApplicationState(
    userAddress, smartWalletAddress, web3
  )
  appState.walletState.ethBalances = String(await appState.web3?.getBalance(appState.walletState.address))
  appState.smartWalletState.ethBalances = String(await appState.web3!.getBalance(appState.smartWalletState.address))
  return appState;

}