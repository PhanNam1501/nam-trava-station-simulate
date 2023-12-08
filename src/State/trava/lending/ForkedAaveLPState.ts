import { EthAddress, uint256 } from "../../../utils/types";
import { Dapp, Market } from "./ForkedCompoundLPState";

// export class Asset {
//     key: string;
//     id: string;
//     type: string;
//     name: string;
//     address: EthAddress;
//     symbol: string;
//     imgUrl: string;
//     price: number;
//     totalSupplyInUSD: number;
//     supplyAPY: number;
//     numberOfLenders: number;
//     totalBorrowInUSD: number;
//     borrowAPY: number;
//     numberOfBorrows: number;
//     liquidationThreshold: number;
//     loanToValue: number;
//     constructor() {
//       this.key = "";
//       this.id = "";
//       this.type = "";
//       this.name = "";
//       this.address = "";
//       this.symbol = "";
//       this.imgUrl = "";
//       this.price = 0;
//       this.totalSupplyInUSD = 0;
//       this.supplyAPY = 0;
//       this.numberOfLenders = 0;
//       this.totalBorrowInUSD = 0;
//       this.borrowAPY = 0;
//       this.numberOfBorrows = 0;
//       this.liquidationThreshold = 0;
//       this.loanToValue = 0;
//     }
//   }
  
// export class Market {
// id: string;
// type: string;
// projectType: string;
// name: string;
// imgUrl: string;
// key: string;
// chainId: string;
// value: number;
// assets: Array<Asset>;
// constructor() {
//     this.id = "";
//     this.type = "";
//     this.projectType = "";
//     this.name = "";
//     this.imgUrl = "";
//     this.key = "";
//     this.chainId = "";
//     this.value = 0;
//     this.assets = [];
// }
// }
export class ForkedAave{ 
id: string;
chain: string;
numberOfUsers: number;
realUsersRatio: number;
totalSupplyInUSD: number;
numberOfLenders: number;
totalBorrowInUSD: number;
numberOfBorrowers: number;
markets: Array<Market>;
totalTVL: number;
tvlChangeRate: number;
lastUpdatedAt: number;
constructor() {
    this.id = "";
    this.chain = "";
    this.numberOfUsers = 0;
    this.realUsersRatio = 0;
    this.totalSupplyInUSD = 0;
    this.numberOfLenders = 0;
    this.totalBorrowInUSD = 0;
    this.numberOfBorrowers = 0;
    this.markets = [];
    this.totalTVL = 0;
    this.tvlChangeRate = 0;
    this.lastUpdatedAt = 0;
}
}
export class ForkedAaveLPState {
    forkAaveLP: Map<uint256, ForkedAave>;
    isFetch: boolean;
    constructor() {
      this.forkAaveLP = new Map<uint256,ForkedAave>();
      this.isFetch = false;
    }
}

// User

// export class UserAsset {
//   key: string;
//   id: string;
//   name: string;
//   type: string;
//   address: EthAddress;
//   symbol: string;
//   amount: number;
//   valueInUSD: number;
//   imgUrl: string;
//   totalValue: number;
//   constructor() {
//     this.key = "";
//     this.id = "";
//     this.name = "";
//     this.type = "";
//     this.address = "";
//     this.symbol = "";
//     this.amount = 0;
//     this.valueInUSD = 0;
//     this.imgUrl = "";
//     this.totalValue = 0;
//   }
// }

// export class Reserve {
//   category: string;
//   healthFactor: number;
//   deposit: Array<UserAsset>;
//   constructor() {
//     this.category = "";
//     this.healthFactor = 0;
//     this.deposit = [];
//   }
// }

// export class Dapp {
//   key: string;
//   id: string;
//   type: string;
//   projectType: string;
//   chainId: string;
//   name: string;
//   imgUrl: string;
//   value: number;
//   depositInUSD: number;
//   borrowInUSD: number;
//   claimable: number;
//   claimable24hAgo: number;
//   reserves: Array<Reserve>;
//   constructor() {
//     this.key = "";
//     this.id = "";
//     this.type = "";
//     this.projectType = "";
//     this.chainId = "";
//     this.name = "";
//     this.imgUrl = "";
//     this.value = 0;
//     this.depositInUSD = 0;
//     this.borrowInUSD = 0;
//     this.claimable = 0;
//     this.claimable24hAgo = 0;
//     this.reserves = [];
//   }
// }

export class WalletForkedAaveLPState {
  id: string;
  address: EthAddress;
  chain: string;
  totalAssets: number;
  totalAssets24hAgo: number;
  totalClaimable: number;
  totalClaimable24hAgo: number;
  totalDebts: number;
  totalDebts24hAgo: number;
  dapps: Array<Dapp>;
  constructor() {
    this.id = "";
    this.address = "";
    this.chain = "";
    this.totalAssets = 0;
    this.totalAssets24hAgo = 0;
    this.totalClaimable = 0;
    this.totalClaimable24hAgo = 0;
    this.totalDebts = 0;
    this.totalDebts24hAgo = 0;
    this.dapps = [];
  }
}