import { VaultOption } from "../../../Simulation/trava/nft/missions/expedition/expeditionConfig";
import { uint256 } from "../../../utils/types";

export class VaultState {
    vaults: Map<string,Vault>;
    isFetch: boolean;
    constructor() {
      this.vaults = new Map<string,Vault>();
      this.isFetch = false;
    }
  }

export interface Vault extends VaultOption {
    totalKnight: number;
    ownedKnight: number;
    raritys: Map<uint256, number>;
    profession: string;
    successReward: number;
    failureRefund: number;
    token: TokenInfo;
}

export interface TokenInfo {
    address: string;
    decimals: number;
}