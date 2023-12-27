import { ArmouryObject, NormalKnight, NormalKnightInExpedition, SpecialKnight } from "../Simulation/trava/nft/helpers/global";
import { EthAddress } from "../utils/types";
import { NFTAuctioningState, NFTSellingState, NFTTicketState } from "./trava/nft/TravaNFTState";
import { WalletTravaLPState } from "./trava/lending/TravaDeFiState";
import { VeTravaListState } from "./trava/lending/TravaGovenanceState";
import { WalletForkedAaveLPState, WalletForkedCompoundLPState } from "./trava";
export declare class NFTOwned {
    v1: ArmouryObject;
    v2: ArmouryObject;
    isFetch: boolean;
    constructor();
}
export declare class CollectionOwned {
    v1: Array<NormalKnight>;
    v2: Array<NormalKnight>;
    specials: Array<SpecialKnight>;
    isFetch: boolean;
    constructor();
}
export declare class KnightInExpeditionState {
    expedition: Map<string, Array<NormalKnightInExpedition>>;
    isFetch: boolean;
    constructor();
}
export declare class Ticket {
    ticket: string;
    amount: number;
    constructor();
}
export declare class WalletState {
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
    veTravaListState: VeTravaListState;
    knightInExpeditionState: KnightInExpeditionState;
    ticket: NFTTicketState;
    constructor(address: string);
}
