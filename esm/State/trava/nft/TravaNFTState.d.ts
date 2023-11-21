import { TokenSellOption } from "../../../Simulation";
import { AuctioningNormalKnight, AuctioningSpecialKnight, NFTFarming, SellingArmouryType, SellingVeTravaType } from "../../../Simulation/trava/nft/helpers/global";
import { EthAddress } from "../../../utils/types";
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
export declare class NFTVeTravaSellingState {
    sellingVeTrava: Array<SellingVeTravaType>;
    priceTokens: Map<EthAddress, TokenSellOption>;
    isFetch: boolean;
    constructor();
}
export declare class NFTFarmingsState {
    nftFarmings: Map<string, NFTFarming>;
    isFetch: boolean;
    constructor();
}
