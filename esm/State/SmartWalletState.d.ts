import { EthAddress } from "../utils/types";
import { NFTAuctioningState, NFTFarmingsState, NFTSellingState, NFTTicketState } from "./trava/nft/TravaNFTState";
import { BaseAccountVault, WalletTravaLPState } from "./trava/lending/TravaDeFiState";
import { CollectionOwned, KnightInExpeditionState, NFTOwned } from "./WalletState";
import { VeTravaListState } from "./trava/lending/TravaGovenanceState";
import { LiquidityCampainState, WalletForkedAaveLPState, WalletForkedCompoundLPState } from "./trava";
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
    forkedCompoundLPState: Map<string, WalletForkedCompoundLPState>;
    forkedAaveLPState: Map<string, WalletForkedAaveLPState>;
    ethBalances: string;
    sellingNFT: NFTSellingState;
    auctioningState: NFTAuctioningState;
    NFTFarmingsState: NFTFarmingsState;
    detailTokenInPool: Map<string, DetailTokenInPool>;
    travaLPStakingStateList: Map<string, BaseAccountVault>;
    veTravaListState: VeTravaListState;
    knightInExpeditionState: KnightInExpeditionState;
    ticket: NFTTicketState;
    liquidityCampainState: LiquidityCampainState;
    constructor(address: EthAddress);
}
