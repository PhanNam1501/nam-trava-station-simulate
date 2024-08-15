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
    forkCompoundLPState: import("../../../../../State").ForkedCompoundLPState;
    forkAaveLPState: import("../../../../../State").ForkedAaveLPState;
    pancakeSwapV2Pair: import("../../../../../State").PancakeSwapV2Pair;
    web3: import("ethers").JsonRpcProvider;
    chainId: string | number;
    simulatorUrl: string;
}>;
