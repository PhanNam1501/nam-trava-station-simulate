import { EthAddress } from "../utils/types";
import { NFTSellingState } from "./NFTSellingState";
import { BaseAccountVault, WalletTravaLPState } from "./TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";
export interface OriginTokenData {
    balances: string;
}
export interface TokenData {
    address: string;
    balances: string;
    decimals: string;
    totalSupply: string;
    originToken: OriginTokenData;
}
export interface DetailTokenInPool {
    decimals: string;
    dToken: TokenData;
    tToken: TokenData;
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
    detailTokenInPool: Map<string, DetailTokenInPool>;
    travaLPStakingStateList: BaseAccountVault[];
    maxRewardCanClaim: string;
    constructor(address: EthAddress);
}
