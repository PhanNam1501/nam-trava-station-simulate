import { EthAddress, uint256 } from "../../../utils/types";
import { KnightArmyOption } from "./../../../Simulation/trava/nft/missions/dilution/dilutionConfig";
export class DilutionState {
    dilutionLimitedKnight: Map<number, LimitedKnight>;
    dilutionKnightArmy: Array<KnightArmyOption>;
    isFetch: boolean;
    constructor() {
        this.dilutionLimitedKnight = new Map<number, LimitedKnight>();
        this.dilutionKnightArmy = new Array<KnightArmyOption>();
        this.isFetch = false;
    }
  }

export interface LimitedKnight {
    id: number;
    owner: EthAddress;
    duration: number;
    dilutionProtection: number;
    dilutionAfterJoining: number;
    currentPowerLevel: number;
    powerLevelAfterJoining: number;
    upfrontFee: uint256;
}
