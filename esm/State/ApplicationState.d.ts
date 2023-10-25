import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTAuctioningState, NFTSellingState } from "./TravaNFTState";
import { JsonRpcProvider } from "ethers";
export declare class ApplicationState {
    walletState: WalletState;
    smartWalletState: SmartWalletState;
    NFTSellingState: NFTSellingState;
    NFTAuctioningState: NFTAuctioningState;
    web3: JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
    constructor(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider, chainId: number, simulatorUrl?: string);
}
