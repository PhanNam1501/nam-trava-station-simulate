import { ApplicationState } from "../../State/ApplicationState";
import { NFTSellingState } from "../../State/NFTSellingState";
export declare function updateTravaBalance(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateNFTBalanceFromContract(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<ApplicationState>;
export declare function updateCollectionBalanceFromContract(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<ApplicationState>;
export declare function updateSellingNFTFromContract(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateSellingNFTFromGraph(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateCollectionBalanceFromGraph(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<ApplicationState>;
export declare function updateOwnedSellingNFTFromContract(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<{
    walletState: import("../../State/WalletState").WalletState;
    smartWalletState: import("../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: NFTSellingState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
}>;
export declare function updateOwnedSellingNFT(appState1: ApplicationState): Promise<{
    walletState: import("../../State/WalletState").WalletState;
    smartWalletState: import("../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: NFTSellingState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
}>;
