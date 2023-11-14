import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTAuctioningState, NFTSellingState, NFTVeTravaSellingState } from "./trava/nft/TravaNFTState";
import { JsonRpcProvider } from "ethers";
import { TravaGovernanceState } from "./trava/lending/TravaGovenanceState";
export declare class ApplicationState {
    createdTime: number;
    walletState: WalletState;
    smartWalletState: SmartWalletState;
    NFTSellingState: NFTSellingState;
    NFTAuctioningState: NFTAuctioningState;
    NFTVeTravaMarketSellingState: NFTVeTravaSellingState;
    TravaGovernanceState: TravaGovernanceState;
    web3: JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
    constructor(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider, chainId: number, simulatorUrl?: string);
}
