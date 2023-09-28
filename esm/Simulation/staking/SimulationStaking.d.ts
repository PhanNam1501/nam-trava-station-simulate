import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
export declare function calculateNewAPR(oldAPR: string, oldTVL: string, newTVL: string): string;
export declare function simulateStakeStaking(appState1: ApplicationState, _stakingPool: EthAddress, from: EthAddress, _amount: number | string): Promise<{
    walletState: import("../../State/WalletState").WalletState;
    smartWalletState: import("../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../State/NFTSellingState").NFTSellingState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
}>;
export declare function simulateStakingRedeem(appState1: ApplicationState, _stakingPool: EthAddress, to: EthAddress, _amount: number | string): Promise<{
    walletState: import("../../State/WalletState").WalletState;
    smartWalletState: import("../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../State/NFTSellingState").NFTSellingState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
}>;
export declare function simulateStakingClaimRewards(appState1: ApplicationState, _stakingPool: EthAddress, _to: EthAddress, _amount: number | string): Promise<{
    walletState: import("../../State/WalletState").WalletState;
    smartWalletState: import("../../State/SmartWalletState").SmartWalletState;
    NFTSellingState: import("../../State/NFTSellingState").NFTSellingState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
}>;
