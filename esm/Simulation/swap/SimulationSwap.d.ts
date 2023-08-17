import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function simulateSwap(appState1: ApplicationState, fromToken: EthAddress, toToken: EthAddress, fromAmount: EthAddress, toAmount: EthAddress): Promise<ApplicationState>;
