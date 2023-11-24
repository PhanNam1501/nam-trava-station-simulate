import { ApplicationState } from "../../../../../State";
import { EthAddress } from "../../../../../utils/types";
import { FarmingKnightDetailInfo, NormalKnight } from "../../helpers";
export declare function getNormalKinghtFromFarmingKnight(farmingKnightDetailInfo: FarmingKnightDetailInfo): NormalKnight;
export declare function caculateValue(newExp: number): number;
export declare function simulateTravaNFTHeuristicFarmingStake(appState1: ApplicationState, _ids: Array<number>, _vaultId: string, _from: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaNFTHeuristicFarmingWithdraw(appState1: ApplicationState, _ids: Array<number>, _vaultId: string, _to: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaNFTHeuristicFarmingClaim(appState1: ApplicationState, _ids: Array<number>, _vaultId: string): Promise<ApplicationState>;
export declare function simulateTravaNFTHeuristicFarmingPolish(appState1: ApplicationState, _ids: Array<number>, _vaultId: string): Promise<ApplicationState>;
