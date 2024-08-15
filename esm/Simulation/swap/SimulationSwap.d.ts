import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function simulateSwap(appState1: ApplicationState, _fromToken: EthAddress, _toToken: EthAddress, _fromAmount: EthAddress, _toAmount: EthAddress, _fromAddress: EthAddress, _toAddress: EthAddress): Promise<ApplicationState>;
