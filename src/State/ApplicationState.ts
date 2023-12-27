import { KnightInExpeditionState, WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTAuctioningState, NFTFarmingsState, NFTSellingState, NFTVeTravaSellingState } from "./trava/nft/TravaNFTState";
import { JsonRpcProvider } from "ethers";
import { TravaGovernanceState } from "./trava/lending/TravaGovenanceState";
<<<<<<< HEAD
import { DilutionState, ExpeditionState, ForkedAaveLPState, ForkedCompoundLPState } from "./trava";
=======
import { DilutionState, ExpeditionState, ForkedAaveLPState, ForkedCompoundLPState, LiquidityCampainState } from "./trava";
>>>>>>> refs/remotes/origin/main

export class ApplicationState {
  createdTime: number;
  walletState: WalletState;
  smartWalletState: SmartWalletState;
  NFTSellingState: NFTSellingState;
  NFTAuctioningState: NFTAuctioningState;
  NFTVeTravaMarketSellingState: NFTVeTravaSellingState;
  TravaGovernanceState: TravaGovernanceState;
  ExpeditionState: ExpeditionState;
  DilutionState: DilutionState;
  forkCompoundLPState: ForkedCompoundLPState;
  forkAaveLPState: ForkedAaveLPState;
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
    this.NFTVeTravaMarketSellingState = new NFTVeTravaSellingState();
    this.TravaGovernanceState = new TravaGovernanceState();
    this.ExpeditionState = new ExpeditionState();
    this.DilutionState = new DilutionState();
    this.web3 = web3;
    this.chainId = chainId;
    this.simulatorUrl = simulatorUrl || ""
    this.forkCompoundLPState = new ForkedCompoundLPState();
    this.forkAaveLPState = new ForkedAaveLPState();
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