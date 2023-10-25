import { ApplicationState } from "../../../State/ApplicationState";
export declare function updateAllAccountVault(appState1: ApplicationState): Promise<{
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../..").SmartWalletState;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
