import { VaultOption } from "../../../Simulation/trava/nft/missions/expedition/expeditionConfig";
import { uint256 } from "../../../utils/types";

export class VaultState {
    vaults: Map<uint256,Vault>;
    isFetch: boolean;
    constructor() {
      this.vaults = new Map<uint256,Vault>();
      this.isFetch = false;
    }
  }

export interface Vault extends VaultOption {
    totalKnight: number;
    raritys: Map<uint256, number>;
    profession: uint256;
    expeditionPrice: uint256;
    successPayout: uint256;
    successReward: uint256;
    token: TokenInfo;
}

export interface TokenInfo {
    address: uint256;
    decimals: number;
}