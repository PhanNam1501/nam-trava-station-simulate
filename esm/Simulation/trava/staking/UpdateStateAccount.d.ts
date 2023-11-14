import { ApplicationState } from "../../../State/ApplicationState";
export declare function updateAllAccountVault(appState1: ApplicationState, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../..").SmartWalletState;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../../..").NFTVeTravaSellingState;
    TravaGovernanceState: import("../../..").TravaGovernanceState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
