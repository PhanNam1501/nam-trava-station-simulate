import { ApplicationState } from "../../../State/ApplicationState";
import { EthAddress } from "../../../utils/types";
export declare function updateAllAccountVault(appState1: ApplicationState, _address: EthAddress, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../..").SmartWalletState;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../../..").NFTVeTravaSellingState;
    TravaGovernanceState: import("../../..").TravaGovernanceState;
    ExpeditionState: import("../../..").ExpeditionState;
    DilutionState: import("../../..").DilutionState;
    forkCompoundLPState: import("../../..").ForkedCompoundLPState;
    forkAaveLPState: import("../../..").ForkedAaveLPState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
