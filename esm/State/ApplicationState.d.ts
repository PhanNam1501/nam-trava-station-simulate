import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTState } from "./NFTState";
import { JsonRpcProvider } from "ethers";
export declare class ApplicationState {
    walletState: WalletState;
    smartWalletState: SmartWalletState;
    NFTState: NFTState;
    web3: JsonRpcProvider | null;
    chainId: number | undefined;
    constructor(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider | null);
}
