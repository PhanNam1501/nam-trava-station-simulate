import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function simulateWrap(appState: ApplicationState, amount: number | string): Promise<void>;
export declare function simulateUnwrap(appState: ApplicationState, amount: number | string): Promise<void>;
export declare function simulateSendToken(appState: ApplicationState, tokenAddress: EthAddress, to: EthAddress, amount: number | string): Promise<void>;
