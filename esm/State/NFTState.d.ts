import { EthAddress } from "../utils/types";
export declare class NFTData {
    id: string | number;
    data: {
        price: string | number;
        seller: EthAddress;
        [key: string]: any;
    };
    constructor();
}
export declare class NFT {
    v1: Array<NFTData>;
    v2: Array<NFTData>;
    constructor();
}
export declare class NFTState {
    nfts: NFT;
    constructor();
}
