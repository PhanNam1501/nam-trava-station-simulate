import { ApplicationState } from "../../State/ApplicationState";
export declare function updateTravaBalance(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateNFTBalanceFromContract(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<ApplicationState>;
export declare function updateCollectionBalanceFromContract(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<ApplicationState>;
export declare function updateSellingNFTFromContract(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateSellingNFTFromGraph(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateCollectionBalanceFromGraph(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<ApplicationState>;
