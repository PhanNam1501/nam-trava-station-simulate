import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
export declare function updatePancakeFarmState(appState1: ApplicationState, address: EthAddress, force?: boolean): Promise<ApplicationState>;
