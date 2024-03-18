import { ApplicationState } from "../../../../../State";
export declare function updateFarmingState(appState1: ApplicationState, force?: boolean): Promise<ApplicationState>;
export declare function calculateKnightApr(dailyReward: number, collectionVaultValue: number, totalVaultValue: number, collectionPrice: number): number;
export declare function calculateVaultApr(dailyReward: number, totalNFTs: number, collectionPrice: number): number;
