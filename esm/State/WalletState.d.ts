import { ArmouryObject, NormalKnight, SpecialKnight } from "../Simulation/trava/nft/helpers/global";
import { EthAddress } from "../utils/types";
import { NFTAuctioningState, NFTSellingState } from "./trava/nft/TravaNFTState";
import { WalletTravaLPState } from "./trava/lending/TravaDeFiState";
import { VeTravaListState } from "./trava/lending/TravaGovenanceState";
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
export declare class WalletState {
    address: EthAddress;
    tokenBalances: Map<string, string>;
    nfts: NFTOwned;
    collection: CollectionOwned;
    travaLPState: WalletTravaLPState;
    ethBalances: string;
    sellingNFT: NFTSellingState;
    auctioningState: NFTAuctioningState;
    veTravaListState: VeTravaListState;
    constructor(address: string);
}
