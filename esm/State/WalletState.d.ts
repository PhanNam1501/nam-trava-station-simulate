import { ArmouryObject, NormalKnight, SpecialKnight } from "../global";
import { EthAddress } from "../utils/types";
import { WalletTravaLPState } from "./TravaDeFiState";
export declare class NFTOwned {
    v1: ArmouryObject;
    v2: ArmouryObject;
    constructor();
}
export declare class CollectionOwned {
    v1: Array<NormalKnight>;
    v2: Array<NormalKnight>;
    specials: Array<SpecialKnight>;
    constructor();
}
export declare class WalletState {
    address: EthAddress;
    tokenBalances: Map<string, string>;
    nfts: NFTOwned;
    collection: CollectionOwned;
    travaLPState: WalletTravaLPState;
    ethBalances: string;
    constructor(address: string);
}
