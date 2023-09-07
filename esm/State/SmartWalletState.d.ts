import { EthAddress } from "../utils/types";
import { NFTSellingState } from "./NFTSellingState";
import { WalletTravaLPState } from "./TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";
export interface TokenData {
    address: string;
    balances: string;
}
export interface DetailTokenInPool {
    dToken: TokenData;
    tToken: TokenData;
}
export declare class SmartWalletState {
    address: EthAddress;
    tokenBalances: Map<string, string>;
    nfts: NFTOwned;
    collection: CollectionOwned;
    travaLPState: WalletTravaLPState;
    ethBalances: string;
    sellingNFT: NFTSellingState;
    detailTokenInPool: Map<string, DetailTokenInPool>;
    constructor(address: EthAddress);
}
