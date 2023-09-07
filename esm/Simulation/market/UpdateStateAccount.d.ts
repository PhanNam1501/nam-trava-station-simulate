import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function updateLPtTokenInfo(appState1: ApplicationState, _tokenAddress: EthAddress): Promise<{
    walletState: import("../../State/WalletState").WalletState;
    smartWalletState: import("../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../State/NFTSellingState").NFTSellingState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
}>;
export declare function updateLPDebtTokenInfo(appState1: ApplicationState, _tokenAddress: EthAddress): Promise<{
    walletState: import("../../State/WalletState").WalletState;
    smartWalletState: import("../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../State/NFTSellingState").NFTSellingState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
}>;
export declare function updateTravaLPInfo(appState1: ApplicationState, userAddress: EthAddress): Promise<ApplicationState>;
export declare function updateRTravaAndTravaForReward(appState1: ApplicationState): Promise<{
    walletState: import("../../State/WalletState").WalletState;
    smartWalletState: import("../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../State/NFTSellingState").NFTSellingState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
}>;
