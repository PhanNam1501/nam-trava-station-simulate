import { EthAddress } from "../../../utils/types";
import { ApplicationState } from "../../../State/ApplicationState";
export declare function getTokenBalance(appState: ApplicationState, tokenAddress: EthAddress): Promise<{
    address: string;
    balance: string;
    decimal: string;
}>;
export declare function updateLPtTokenInfo(appState1: ApplicationState, _tokenAddress: EthAddress): Promise<{
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function updateLPDebtTokenInfo(appState1: ApplicationState, _tokenAddress: EthAddress): Promise<{
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function updateTravaLPInfo(appState1: ApplicationState, market?: EthAddress): Promise<ApplicationState>;
export declare function updateMaxRewardCanClaims(appState1: ApplicationState): Promise<{
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function updateRTravaAndTravaForReward(appState1: ApplicationState): Promise<{
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
