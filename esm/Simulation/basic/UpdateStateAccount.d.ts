import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
export declare function updateUserEthBalance(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateSmartWalletEthBalance(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateUserTokenBalance(appState1: ApplicationState, address: EthAddress): Promise<ApplicationState>;
export declare function updateSmartWalletTokenBalance(appState1: ApplicationState, address: EthAddress): Promise<ApplicationState>;
