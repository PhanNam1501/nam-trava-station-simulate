import { ExpeditionOption } from "../../../Simulation/trava/nft/missions/expedition/expeditionConfig";
import { uint256 } from "../../../utils/types";
export declare class ExpeditionState {
    expeditions: Map<uint256, Expedition>;
    isFetch: boolean;
    constructor();
}
export interface Expedition extends ExpeditionOption {
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
