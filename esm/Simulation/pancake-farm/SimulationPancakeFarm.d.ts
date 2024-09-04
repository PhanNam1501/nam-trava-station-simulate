import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function getPancakeFarmAPR(appState: ApplicationState, _v2Wrapper: EthAddress): Promise<string>;
export declare function getMaxPancakeFarmUnstakeAmount(appState: ApplicationState, _v2Wrapper: EthAddress): Promise<string>;
export declare function getPancakeFarmReward(appState: ApplicationState, _v2Wrapper: EthAddress): Promise<string>;
export declare function simulatePancakeFarmStakeLP(appState: ApplicationState, _v2Wrapper: EthAddress, from: EthAddress, _amount: uint256, noHarvest: boolean): Promise<ApplicationState>;
export declare function simulatePancakeFarmUnStakeLP(appState: ApplicationState, _v2Wrapper: EthAddress, _amount: uint256, to: EthAddress, noHarvest: boolean): Promise<ApplicationState>;
export declare function simulatePancakeFarmHarvestLP(appState: ApplicationState, _v2Wrapper: EthAddress, to: EthAddress, noHarvest: boolean): Promise<ApplicationState>;
