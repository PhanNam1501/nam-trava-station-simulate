import { EthAddress, uint256 } from "trava-station-sdk";
import { ApplicationState } from "../../State/ApplicationState";
export declare function simulateWrapV2(appState1: ApplicationState, _amount: uint256, actionAddress?: EthAddress): Promise<ApplicationState>;
export declare function simulateUnwrapV2(appState1: ApplicationState, _amount: uint256, actionAddress?: EthAddress): Promise<ApplicationState>;
export declare function simulateSendTokenV2(appState1: ApplicationState, _tokenAddress: EthAddress, from: EthAddress, to: EthAddress, _amount: uint256, actionAddress?: EthAddress): Promise<ApplicationState>;
