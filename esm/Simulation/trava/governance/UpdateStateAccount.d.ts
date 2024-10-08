import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js";
import { EthAddress } from "../../../utils/types";
export declare function updateTravaGovernanceState(appState1: ApplicationState, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../..").SmartWalletState;
    tokenPrice: Map<EthAddress, import("../../../utils/types").uint256>;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../../..").NFTVeTravaSellingState;
    TravaGovernanceState: import("../../../State/trava/lending/TravaGovenanceState").TravaGovernanceState;
    ExpeditionState: import("../../..").ExpeditionState;
    DilutionState: import("../../..").DilutionState;
    forkCompoundLPState: import("../../..").ForkedCompoundLPState;
    forkAaveLPState: import("../../..").ForkedAaveLPState;
    pancakeSwapV2Pair: import("../../..").PancakeSwapV2Pair;
    cs251state: import("../../..").cs251state;
    PancakeFarmState: import("../../..").PancakeFarmState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number | string;
    simulatorUrl: string;
}>;
export declare function updateUserLockBalance(appState1: ApplicationState, _userAddress: EthAddress, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../../..").WalletState;
    smartWalletState: import("../../..").SmartWalletState;
    tokenPrice: Map<EthAddress, import("../../../utils/types").uint256>;
    NFTSellingState: import("../../..").NFTSellingState;
    NFTAuctioningState: import("../../..").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../../..").NFTVeTravaSellingState;
    TravaGovernanceState: import("../../../State/trava/lending/TravaGovenanceState").TravaGovernanceState;
    ExpeditionState: import("../../..").ExpeditionState;
    DilutionState: import("../../..").DilutionState;
    forkCompoundLPState: import("../../..").ForkedCompoundLPState;
    forkAaveLPState: import("../../..").ForkedAaveLPState;
    pancakeSwapV2Pair: import("../../..").PancakeSwapV2Pair;
    cs251state: import("../../..").cs251state;
    PancakeFarmState: import("../../..").PancakeFarmState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number | string;
    simulatorUrl: string;
}>;
export declare function roundDown(timestamp: number): number;
export declare function getTokenRatio(appState: ApplicationState, _tokenAddress: EthAddress): Promise<BigNumber>;
