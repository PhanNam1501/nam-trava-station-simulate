import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
export declare function updateUserEthBalance(appState: ApplicationState): Promise<void>;
export declare function updateSmartWalletEthBalance(appState: ApplicationState): Promise<void>;
export declare function updateUserTokenBalance(appState: ApplicationState, address: EthAddress): Promise<void>;
export declare function updateSmartWalletTokenBalance(appState: ApplicationState, address: EthAddress): Promise<void>;
