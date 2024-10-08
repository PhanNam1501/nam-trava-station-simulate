import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function simulateWrap(appState1: ApplicationState, _amount: number | string): Promise<ApplicationState>;
export declare function simulateUnwrap(appState1: ApplicationState, _amount: number | string): Promise<ApplicationState>;
export declare function simulateSendToken(appState1: ApplicationState, _tokenAddress: EthAddress, from: EthAddress, to: EthAddress, _amount: number | string): Promise<ApplicationState>;
