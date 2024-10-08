import { EthAddress, uint256 } from "../utils/types";
import { NFTAuctioningState, NFTFarmingsState, NFTSellingState, NFTTicketState } from "./trava/nft/TravaNFTState";
import {
  BaseAccountVault,
  WalletTravaLPState,
} from "./trava/lending/TravaDeFiState";
import { CollectionOwned, KnightInExpeditionState, NFTOwned } from "./WalletState";
import { VeTravaListState } from "./trava/lending/TravaGovenanceState"
import { LiquidityCampainState, WalletForkedAaveLPState, WalletForkedCompoundLPState } from "./trava";
import { UserPancakeFarmState } from "./pancake-farm";
export interface OriginTokenData {
  balances: string;
}

export interface TokenInPoolData {
  address: string;
  balances: string;
  decimals: string;
  totalSupply: string;
  originToken: OriginTokenData;
  exchangeRate: uint256;
}

export interface DetailTokenInPool {
  decimals: string;
  dToken: TokenInPoolData;
  tToken: TokenInPoolData;
  maxLTV: string;
  liqThres: string;
  price: string;
}

export class SmartWalletState {
  address: EthAddress;
  tokenBalances: Map<string, string>;
  nfts: NFTOwned;
  collection: CollectionOwned;
  travaLPState: WalletTravaLPState;
  forkedCompoundLPState: Map<string, WalletForkedCompoundLPState>;
  forkedAaveLPState: Map<string, WalletForkedAaveLPState>;
  ethBalances: string;
  sellingNFT: NFTSellingState;
  auctioningState: NFTAuctioningState;
  NFTFarmingsState: NFTFarmingsState;
  detailTokenInPool: Map<string, DetailTokenInPool>;
  travaLPStakingStateList: Map<string, BaseAccountVault>;
  veTravaListState: VeTravaListState;
  knightInExpeditionState: KnightInExpeditionState;
  ticket: NFTTicketState;
  liquidityCampainState: LiquidityCampainState;
  pancakeFarmState: UserPancakeFarmState;

  constructor(address: EthAddress) {
    this.address = address;
    this.tokenBalances = new Map<string, string>();
    this.nfts = new NFTOwned();
    this.travaLPState = new WalletTravaLPState();
    this.forkedCompoundLPState = new Map<string, WalletForkedCompoundLPState>();
    this.forkedAaveLPState = new Map<string, WalletForkedAaveLPState>();
    this.collection = new CollectionOwned();
    this.ethBalances = "";
    this.sellingNFT = new NFTSellingState();
    this.auctioningState = new NFTAuctioningState();
    this.NFTFarmingsState = new NFTFarmingsState();
    this.detailTokenInPool = new Map();
    this.travaLPStakingStateList = new Map();
    this.veTravaListState = new VeTravaListState();
    this.knightInExpeditionState = new KnightInExpeditionState();
    this.ticket = new NFTTicketState();
    this.liquidityCampainState = new LiquidityCampainState();
    this.pancakeFarmState = new UserPancakeFarmState();
  }

  // async getTokenAmount(tokenAddress: string): Promise<string> {
  //   // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
  //   if (this.tokenBalances.length > 0) {
  //     // check tokenAddress is exist on appState.walletState.tokenBalances
  //     for (let i = 0; i < this.tokenBalances.length; i++) {
  //       // console.log(appState.walletState.tokenBalances[i].has(tokenAddress));
  //       if (this.tokenBalances[i].has(tokenAddress)) {
  //         return this.tokenBalances[i].get(tokenAddress)!;
  //       }
  //     }
  //   }
  //   return "0";
  // }

  // async getTokenBalances(tokenAddress: string): Promise<any> {
  //   // find tokenAddress in tokenBalances
  //   for (let i = 0; i < this.tokenBalances.length; i++) {
  //     if (this.tokenBalances[i].has(tokenAddress)) {
  //       return this.tokenBalances[i];
  //     }
  //   }
  //   return null;
  // }
}