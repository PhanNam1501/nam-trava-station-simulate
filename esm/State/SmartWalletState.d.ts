import { EthAddress } from "../utils/types";
import { NFTAuctioningState, NFTSellingState } from "./TravaNFTState";
import { BaseAccountVault, WalletTravaLPState } from "./TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";
import { VeTravaListState } from "./TravaGovenanceState";
export interface OriginTokenData {
    balances: string;
}
export interface TokenInPoolData {
    address: string;
    balances: string;
    decimals: string;
    totalSupply: string;
    originToken: OriginTokenData;
}
export interface DetailTokenInPool {
    decimals: string;
    dToken: TokenInPoolData;
    tToken: TokenInPoolData;
    maxLTV: string;
    liqThres: string;
    price: string;
}
export declare class SmartWalletState {
    address: EthAddress;
    tokenBalances: Map<string, string>;
    nfts: NFTOwned;
    collection: CollectionOwned;
    travaLPState: WalletTravaLPState;
    ethBalances: string;
    sellingNFT: NFTSellingState;
    auctioningState: NFTAuctioningState;
    detailTokenInPool: Map<string, DetailTokenInPool>;
    travaLPStakingStateList: Map<string, BaseAccountVault>;
    veTravaListState: VeTravaListState;
    constructor(address: EthAddress);
}
