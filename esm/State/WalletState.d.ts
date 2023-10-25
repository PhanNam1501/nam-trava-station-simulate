import { ArmouryObject, NormalKnight, SpecialKnight } from "../Simulation/trava/nft/helpers/global";
import { EthAddress } from "../utils/types";
import { NFTAuctioningState, NFTSellingState } from "./TravaNFTState";
import { WalletTravaLPState } from "./TravaDeFiState";
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
    constructor(address: string);
}
