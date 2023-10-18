import { ApplicationState } from "../../../State/ApplicationState";
export declare function updateAllAccountVault(appState1: ApplicationState): Promise<{
    walletState: import("../../../State/WalletState").WalletState;
    smartWalletState: import("../../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../../State/NFTSellingState").NFTSellingState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
