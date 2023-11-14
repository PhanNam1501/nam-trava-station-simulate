import { EthAddress } from "../utils/types";
import { NFTAuctioningState, NFTFarmingsState, NFTSellingState } from "./trava/nft/TravaNFTState";
import { BaseAccountVault, WalletTravaLPState } from "./trava/lending/TravaDeFiState";
import { CollectionOwned, NFTOwned } from "./WalletState";
import { VeTravaListState } from "./trava/lending/TravaGovenanceState";
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
    NFTFarmingsState: NFTFarmingsState;
    detailTokenInPool: Map<string, DetailTokenInPool>;
    travaLPStakingStateList: Map<string, BaseAccountVault>;
    veTravaListState: VeTravaListState;
    constructor(address: EthAddress);
}
