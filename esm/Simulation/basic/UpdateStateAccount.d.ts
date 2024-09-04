import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
export declare function updateUserEthBalance(appState1: ApplicationState, force?: boolean): Promise<ApplicationState>;
export declare function updateSmartWalletEthBalance(appState1: ApplicationState, force?: boolean): Promise<ApplicationState>;
export declare function updateUserTokenBalance(appState1: ApplicationState, _tokenAddress: EthAddress, force?: boolean): Promise<ApplicationState>;
export declare function updateSmartWalletTokenBalance(appState1: ApplicationState, _tokenAddress: EthAddress, force?: boolean): Promise<ApplicationState>;
export declare function updateTokenBalance(appState1: ApplicationState, _from: EthAddress, _tokenAddress?: EthAddress, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../..").WalletState;
    smartWalletState: import("../..").SmartWalletState;
    tokenPrice: Map<EthAddress, import("../../utils/types").uint256>;
    NFTSellingState: import("../..").NFTSellingState;
    NFTAuctioningState: import("../..").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../..").NFTVeTravaSellingState;
    TravaGovernanceState: import("../..").TravaGovernanceState;
    ExpeditionState: import("../..").ExpeditionState;
    DilutionState: import("../..").DilutionState;
    forkCompoundLPState: import("../..").ForkedCompoundLPState;
    forkAaveLPState: import("../..").ForkedAaveLPState;
    pancakeSwapV2Pair: import("../..").PancakeSwapV2Pair;
    cs251state: import("../..").cs251state;
    PancakeFarmState: import("../..").PancakeFarmState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number | string;
    simulatorUrl: string;
}>;
export declare function updateAllTokensBalance(appState1: ApplicationState, userAddress: EthAddress, _tokenAddresses: Array<EthAddress>, force?: boolean): Promise<{
    createdTime: number;
    walletState: import("../..").WalletState;
    smartWalletState: import("../..").SmartWalletState;
    tokenPrice: Map<EthAddress, import("../../utils/types").uint256>;
    NFTSellingState: import("../..").NFTSellingState;
    NFTAuctioningState: import("../..").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../..").NFTVeTravaSellingState;
    TravaGovernanceState: import("../..").TravaGovernanceState;
    ExpeditionState: import("../..").ExpeditionState;
    DilutionState: import("../..").DilutionState;
    forkCompoundLPState: import("../..").ForkedCompoundLPState;
    forkAaveLPState: import("../..").ForkedAaveLPState;
    pancakeSwapV2Pair: import("../..").PancakeSwapV2Pair;
    cs251state: import("../..").cs251state;
    PancakeFarmState: import("../..").PancakeFarmState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number | string;
    simulatorUrl: string;
}>;
