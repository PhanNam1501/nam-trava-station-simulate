import { ArmouryObject, NormalKnight, SpecialKnight } from "../global";
import { EthAddress } from "../utils/types";
import { NFTSellingState } from "./NFTSellingState";
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
    constructor(address: string);
}
