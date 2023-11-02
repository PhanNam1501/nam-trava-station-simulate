import { ApplicationState } from "../../../../../State/ApplicationState";
import { NFTSellingState } from "../../../../../State/TravaNFTState";
export declare function updateSellingNFTFromContract(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateSellingNFTFromGraph(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateOwnedSellingNFTFromContract(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<{
    createdTime: number;
    walletState: import("../../../../..").WalletState;
    smartWalletState: import("../../../../..").SmartWalletState;
    NFTSellingState: NFTSellingState;
    NFTAuctioningState: import("../../../../../State/TravaNFTState").NFTAuctioningState;
    TravaGovernanceState: import("../../../../..").TravaGovernanceState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function updateOwnedSellingNFT(appState1: ApplicationState): Promise<{
    createdTime: number;
    walletState: import("../../../../..").WalletState;
    smartWalletState: import("../../../../..").SmartWalletState;
    NFTSellingState: NFTSellingState;
    NFTAuctioningState: import("../../../../../State/TravaNFTState").NFTAuctioningState;
    TravaGovernanceState: import("../../../../..").TravaGovernanceState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
