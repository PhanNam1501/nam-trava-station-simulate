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
    NFTSellingState: import("../..").NFTSellingState;
    NFTAuctioningState: import("../..").NFTAuctioningState;
    TravaGovernanceState: import("../..").TravaGovernanceState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
