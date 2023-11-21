import { ApplicationState } from "../../../../../State";
import { EthAddress } from "../../../../../utils/types";
export declare function updateOwnerKnightInExpeditionState(appState1: ApplicationState, _from: EthAddress, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../../../../State").WalletState;
    smartWalletState: import("../../../../../State").SmartWalletState;
    NFTSellingState: import("../../../../../State").NFTSellingState;
    NFTAuctioningState: import("../../../../../State").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../../../../../State").NFTVeTravaSellingState;
    TravaGovernanceState: import("../../../../../State").TravaGovernanceState;
    ExpeditionState: import("../../../../../State").ExpeditionState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function updateExpeditionState(appState1: ApplicationState, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../../../../State").WalletState;
    smartWalletState: import("../../../../../State").SmartWalletState;
    NFTSellingState: import("../../../../../State").NFTSellingState;
    NFTAuctioningState: import("../../../../../State").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../../../../../State").NFTVeTravaSellingState;
    TravaGovernanceState: import("../../../../../State").TravaGovernanceState;
    ExpeditionState: import("../../../../../State").ExpeditionState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
