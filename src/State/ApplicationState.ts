import { KnightInExpeditionState, WalletState } from "./WalletState";
import { EthAddress, uint256 } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTAuctioningState, NFTFarmingsState, NFTSellingState, NFTVeTravaSellingState } from "./trava/nft/TravaNFTState";
import { JsonRpcProvider } from "ethers";
import { TravaGovernanceState } from "./trava/lending/TravaGovenanceState";
import { DilutionState, ExpeditionState, ForkedAaveLPState, ForkedCompoundLPState } from "./trava";
import { PancakeSwapV2Pair } from "./pancakeSwap";
import { cs251state } from "./cs251";
import {PancakeFarmState} from "./pancake-farm";
import {camelotstate} from "./camelot";

export class ApplicationState {
  createdTime: number;
  walletState: WalletState;
  smartWalletState: SmartWalletState;
  tokenPrice: Map<EthAddress, uint256>;
  NFTSellingState: NFTSellingState;
  NFTAuctioningState: NFTAuctioningState;
  NFTVeTravaMarketSellingState: NFTVeTravaSellingState;
  TravaGovernanceState: TravaGovernanceState;
  ExpeditionState: ExpeditionState;
  DilutionState: DilutionState;
  forkCompoundLPState: ForkedCompoundLPState;
  forkAaveLPState: ForkedAaveLPState;
  pancakeSwapV2Pair: PancakeSwapV2Pair;
  cs251state:cs251state;
  PancakeFarmState:PancakeFarmState;
  camelotstate:camelotstate;

  
  web3: JsonRpcProvider;
  chainId: number | string;
  simulatorUrl: string;
  constructor(
    userAddress: EthAddress,
    smartWalletAddress: EthAddress,
    web3: JsonRpcProvider,
    chainId: number | string,
    simulatorUrl?: string,
  ) {
    this.createdTime = Math.floor(new Date().getTime() / 1000);
    this.walletState = new WalletState(userAddress);
    this.smartWalletState = new SmartWalletState(smartWalletAddress);
    this.tokenPrice = new Map();
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
    this.pancakeSwapV2Pair = new PancakeSwapV2Pair();
    this.cs251state = new cs251state();
    this.PancakeFarmState = new PancakeFarmState();
    this.camelotstate = new camelotstate();

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


