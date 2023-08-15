import { EthAddress } from "../utils/types";
import { WalletTravaLPState } from "./TravaDeFiState";
import { NFT } from "./WalletState";
export declare class SmartWalletState {
    address: EthAddress;
    tokenBalances: Map<string, string>;
    nfts: NFT;
    collection: NFT;
    travaLPState: WalletTravaLPState;
    ethBalances: string;
    constructor(address: EthAddress);
}
