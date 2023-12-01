import { ExpeditionOption } from "../../../Simulation/trava/nft/missions/expedition/expeditionConfig";
import { uint256 } from "../../../utils/types";

export class ExpeditionState {
    expeditions: Map<uint256,Expedition>;
    isFetch: boolean;
    constructor() {
      this.expeditions = new Map<uint256,Expedition>();
      this.isFetch = false;
    }
  }

export interface NumberKinghtInExpedition {
  rarity: uint256,
  numberOfKnight: uint256
}

export interface Expedition extends ExpeditionOption {
    totalKnight: number;
    raritys: Array<NumberKinghtInExpedition>;
    profession: uint256;
    expeditionPrice: uint256;
    successPayout: uint256;
    successReward: uint256;
    buffSuccessRate: Array<number>;
    buffExp: Array<number>;
    token: TokenInfo;
}

export interface TokenInfo {
    address: uint256;
    decimals: number;
}