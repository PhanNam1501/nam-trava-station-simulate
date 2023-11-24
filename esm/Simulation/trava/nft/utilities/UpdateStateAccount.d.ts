import { ApplicationState } from "../../../../State/ApplicationState";
import { EthAddress } from "../../../../utils/types";
export declare function updateTravaBalance(appState1: ApplicationState): Promise<ApplicationState>;
export declare function updateNFTBalanceFromContract(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<ApplicationState>;
export declare function updateCollectionBalanceFromContract(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<ApplicationState>;
export declare function updateCollectionBalanceFromGraph(appState1: ApplicationState, mode: "walletState" | "smartWalletState"): Promise<ApplicationState>;
export declare function updateOwnerTicketState(appState1: ApplicationState, _from: EthAddress, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../../../State").WalletState;
    smartWalletState: import("../../../../State").SmartWalletState;
    NFTSellingState: import("../../../../State").NFTSellingState;
    NFTAuctioningState: import("../../../../State").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../../../../State").NFTVeTravaSellingState;
    TravaGovernanceState: import("../../../../State").TravaGovernanceState;
    ExpeditionState: import("../../../../State").ExpeditionState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
