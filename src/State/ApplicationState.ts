import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTSellingState } from "./NFTSellingState";
import { JsonRpcProvider } from "ethers";

export class ApplicationState {
  walletState: WalletState;
  smartWalletState: SmartWalletState;
  NFTSellingState: NFTSellingState;
  web3: JsonRpcProvider | null;
  chainId: number | undefined;
  constructor(
    userAddress: EthAddress,
    smartWalletAddress: EthAddress,
    web3: JsonRpcProvider | null,
  ) {
    this.walletState = new WalletState(userAddress);
    this.smartWalletState = new SmartWalletState(smartWalletAddress);
    this.NFTSellingState = new NFTSellingState();
    this.web3 = web3;
    this.chainId = Number(web3?._network.chainId);
  }
}

// export async function initializeState(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider | null): Promise<ApplicationState> {
//   const appState = new ApplicationState(
//     userAddress, smartWalletAddress, web3
//   )
//   appState.walletState.ethBalances = String(await appState.web3?.getBalance(appState.walletState.address))
//   appState.smartWalletState.ethBalances = String(await appState.web3!.getBalance(appState.smartWalletState.address))
//   return appState;

// }