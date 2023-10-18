import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTSellingState } from "./NFTSellingState";
import { JsonRpcProvider } from "ethers";
export declare class ApplicationState {
    walletState: WalletState;
    smartWalletState: SmartWalletState;
    NFTSellingState: NFTSellingState;
    web3: JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
    constructor(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider, chainId: number, simulatorUrl?: string);
}
