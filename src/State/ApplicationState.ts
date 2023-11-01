import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTAuctioningState, NFTSellingState } from "./TravaNFTState";
import { JsonRpcProvider } from "ethers";
import { TravaGovernanceState } from "./TravaGovenanceState";

export class ApplicationState {
  createdTime: number;
  walletState: WalletState;
  smartWalletState: SmartWalletState;
  NFTSellingState: NFTSellingState;
  NFTAuctioningState: NFTAuctioningState;
  TravaGovernanceState: TravaGovernanceState;
  web3: JsonRpcProvider;
  chainId: number;
  simulatorUrl: string;
  constructor(
    userAddress: EthAddress,
    smartWalletAddress: EthAddress,
    web3: JsonRpcProvider,
    chainId: number,
    simulatorUrl?: string,
  ) {
    this.createdTime = Math.floor(new Date().getTime() / 1000);
    this.walletState = new WalletState(userAddress);
    this.smartWalletState = new SmartWalletState(smartWalletAddress);
    this.NFTSellingState = new NFTSellingState();
    this.NFTAuctioningState = new NFTAuctioningState();
    this.TravaGovernanceState = new TravaGovernanceState();
    this.web3 = web3;
    this.chainId = chainId;
    this.simulatorUrl = simulatorUrl || ""
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