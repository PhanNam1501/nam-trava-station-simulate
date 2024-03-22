import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
export declare function updateForkAaveLPState(appState1: ApplicationState, entity_id: string, force?: boolean): Promise<ApplicationState>;
export declare function updateTokenDetailInOthersPools(appState1: ApplicationState, _from: EthAddress, entity_id: string): Promise<ApplicationState>;
export declare function updateUserInForkAaveLPState(appState1: ApplicationState, _from: EthAddress, entity_id: string, force?: boolean): Promise<ApplicationState>;
