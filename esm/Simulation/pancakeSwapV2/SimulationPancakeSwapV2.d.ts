import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function simulateAddliquidity(appState1: ApplicationState, _token0: EthAddress, _token1: EthAddress, _tokenPair: EthAddress, _token0Amount: string, _token1Amount: string): Promise<ApplicationState>;
export declare function simulateRemoveliquidity(appState1: ApplicationState, _token0: EthAddress, _token1: EthAddress, _tokenPair: EthAddress, _tokenPairAmount: string): Promise<ApplicationState>;
