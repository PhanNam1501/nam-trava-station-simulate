import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js";
import { EthAddress } from "../../../utils/types";
export declare function updateTravaGovernanceState(appState1: ApplicationState, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../..").SmartWalletState;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    TravaGovernanceState: import("../../../State/trava/lending/TravaGovenanceState").TravaGovernanceState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function updateUserLockBalance(appState1: ApplicationState, _userAddress: EthAddress, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../..").SmartWalletState;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    TravaGovernanceState: import("../../../State/trava/lending/TravaGovenanceState").TravaGovernanceState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function roundDown(timestamp: number): number;
export declare function getTokenRatio(appState: ApplicationState, _tokenAddress: EthAddress): Promise<BigNumber>;
