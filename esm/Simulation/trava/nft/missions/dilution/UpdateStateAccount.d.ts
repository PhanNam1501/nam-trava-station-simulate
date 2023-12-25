import { ApplicationState } from "../../../../../State";
export declare function updateDilutionState(appState1: ApplicationState, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../../../../State").WalletState;
    smartWalletState: import("../../../../../State").SmartWalletState;
    NFTSellingState: import("../../../../../State").NFTSellingState;
    NFTAuctioningState: import("../../../../../State").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../../../../../State").NFTVeTravaSellingState;
    TravaGovernanceState: import("../../../../../State").TravaGovernanceState;
    ExpeditionState: import("../../../../../State").ExpeditionState;
    DilutionState: import("../../../../../State").DilutionState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
