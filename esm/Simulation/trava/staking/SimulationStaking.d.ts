import { ApplicationState } from "../../../State/ApplicationState";
import { EthAddress, uint256 } from "../../../utils/types";
export declare function calculateNewAPR(oldAPR: string, oldTVL: string, newTVL: string): string;
export declare function simulateStakeStaking(appState1: ApplicationState, _stakingPool: EthAddress, from: EthAddress, _amount: number | string): Promise<{
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
    pancakeSwapV2Pair: import("../../..").PancakeSwapV2Pair;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function simulateStakingRedeem(appState1: ApplicationState, _stakingPool: EthAddress, to: EthAddress, _amount: number | string): Promise<{
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
    pancakeSwapV2Pair: import("../../..").PancakeSwapV2Pair;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function simulateTransferStakedToken(appState1: ApplicationState, _stakingPool: EthAddress, from: EthAddress, to: EthAddress, _amount: uint256 | string): Promise<{
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
    pancakeSwapV2Pair: import("../../..").PancakeSwapV2Pair;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function simulateStakingClaimRewards(appState1: ApplicationState, _stakingPool: EthAddress, _to: EthAddress, _amount: number | string): Promise<{
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
    pancakeSwapV2Pair: import("../../..").PancakeSwapV2Pair;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
