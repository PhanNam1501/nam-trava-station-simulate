import { EthAddress } from "../utils/types";
import { WalletTravaLPState } from "./TravaDeFiState";
export declare class NFTData {
    id: string | number;
    data?: any;
    constructor();
}
export declare class NFT {
    v1: Array<NFTData>;
    v2: Array<NFTData>;
    constructor();
}
export declare class WalletState {
    address: EthAddress;
    tokenBalances: Map<string, string>;
    nfts: NFT;
    collection: NFT;
    travaLPState: WalletTravaLPState;
    ethBalances: string;
    constructor(address: string);
}
