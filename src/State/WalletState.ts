import { ArmouryObject, NormalKnight, NormalKnightInExpedition, SpecialKnight } from "../Simulation/trava/nft/helpers/global";
import { EthAddress } from "../utils/types";
import { NFTAuctioningState, NFTSellingState, NFTTicketState } from "./trava/nft/TravaNFTState";
import { WalletTravaLPState } from "./trava/lending/TravaDeFiState";
import { VeTravaListState, VeTravaState } from "./trava/lending/TravaGovenanceState";
import { WalletForkedAaveLPState, WalletForkedCompoundLPState } from "./trava";
import { DetailTokenInPool } from "./SmartWalletState";

// export class NFTData {
//   id: string | number;
//   data?: any;
//   constructor() {
//     this.id = '0';
//     this.data = {};
//   }
// }

// export class NFT {
//   v1: Array<NFTData>;
//   v2: Array<NFTData>;

//   constructor() {
//     this.v1 = new Array<NFTData>();
//     this.v2 = new Array<NFTData>();
//   }
// }

export class NFTOwned {
  v1: ArmouryObject;
  v2: ArmouryObject;
  isFetch: boolean;
  constructor() {
    this.v1 = {};
    this.v2 = {};
    this.isFetch = false;
  }
}

export class CollectionOwned {
  v1: Array<NormalKnight>;
  v2: Array<NormalKnight>;
  specials: Array<SpecialKnight>;
  isFetch: boolean;
  constructor() {
    this.v1 = [];
    this.v2 = [];
    this.specials = [];
    this.isFetch = false;
  }
}

export class KnightInExpeditionState {
  expedition: Map<string, Array<NormalKnightInExpedition>>;
  isFetch: boolean;
  constructor() {
    this.expedition = new Map();
    this.isFetch = false;
  }
}

export class Ticket {
  ticket: string;
  amount: number;
  constructor() {
    this.ticket = "";
    this.amount = 0;
  }
}

export class WalletState {
  address: EthAddress;
  tokenBalances: Map<string, string>;
  nfts: NFTOwned;
  collection: CollectionOwned;
  travaLPState: WalletTravaLPState;
  forkedCompoundLPState: Map<string, WalletForkedCompoundLPState>;
  forkedAaveLPState: Map<string, WalletForkedAaveLPState>;
  detailTokenInPool: Map<string, DetailTokenInPool>;
  ethBalances: string;
  sellingNFT: NFTSellingState;
  auctioningState: NFTAuctioningState;
  veTravaListState: VeTravaListState;
  knightInExpeditionState: KnightInExpeditionState;
  ticket: NFTTicketState;
  constructor(address: string) {
    this.address = address;
    this.tokenBalances = new Map<string, string>();
    this.nfts = new NFTOwned();
    this.collection = new CollectionOwned();
    this.travaLPState = new WalletTravaLPState();
    this.forkedCompoundLPState = new Map<string, WalletForkedCompoundLPState>();
    this.forkedAaveLPState = new Map<string, WalletForkedAaveLPState>();
    this.detailTokenInPool = new Map();
    this.ethBalances = "";
    this.sellingNFT = new NFTSellingState();
    this.auctioningState = new NFTAuctioningState();
    this.veTravaListState = new VeTravaListState();
    this.knightInExpeditionState = new KnightInExpeditionState();
    this.ticket = new NFTTicketState();
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

  // // get tokenBalances based on tokenAddress
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