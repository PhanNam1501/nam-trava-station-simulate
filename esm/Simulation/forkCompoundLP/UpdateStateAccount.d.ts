import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
export declare function updateForkCompoundLPState(appState1: ApplicationState, entity_id: string, force?: boolean): Promise<ApplicationState>;
export declare function updateTokenDetailInOthersPoolsCompound(appState1: ApplicationState, _from: EthAddress, entity_id: string): Promise<ApplicationState>;
export declare function updateUserInForkCompoundLPState(appState1: ApplicationState, _from: EthAddress, entity_id: string, force?: boolean): Promise<ApplicationState>;
