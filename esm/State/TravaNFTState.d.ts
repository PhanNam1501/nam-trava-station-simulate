import { AuctioningNormalKnight, AuctioningSpecialKnight, SellingArmouryType } from "../Simulation/trava/nft/helpers/global";
export declare class NFTSellingState {
    v1: Array<SellingArmouryType>;
    v2: Array<SellingArmouryType>;
    isFetch: boolean;
    constructor();
}
export declare class NFTAuctioningState {
    v1: Array<AuctioningNormalKnight>;
    v2: Array<AuctioningNormalKnight>;
    specials: Array<AuctioningSpecialKnight>;
    isFetch: boolean;
    constructor();
}
