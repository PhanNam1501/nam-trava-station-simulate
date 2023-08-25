import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function simulateSwap(appState1: ApplicationState, _fromToken: EthAddress, _toToken: EthAddress, fromAmount: EthAddress, toAmount: EthAddress): Promise<ApplicationState>;
