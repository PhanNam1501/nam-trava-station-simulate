import { TokenSellOption } from "../../../Simulation";
import { AuctioningNormalKnight, AuctioningSpecialKnight, FarmingKnightDetailInfo, NFTFarming, SellingArmouryType, SellingVeTravaType, tokenInfo } from "../../../Simulation/trava/nft/helpers/global";
import { EthAddress } from "../../../utils/types";
import { Ticket } from "../../WalletState";

export class NFTSellingState {
  v1: Array<SellingArmouryType>;
  v2: Array<SellingArmouryType>;
  isFetch: boolean;
  constructor() {
    this.v1 = new Array<SellingArmouryType>();
    this.v2 = new Array<SellingArmouryType>();
    this.isFetch = false;
  }
}

export class NFTAuctioningState {
  v1: Array<AuctioningNormalKnight>;
  v2: Array<AuctioningNormalKnight>;
  specials: Array<AuctioningSpecialKnight>;
  isFetch: boolean;
  constructor() {
    this.v1 = new Array<AuctioningNormalKnight>();
    this.v2 = new Array<AuctioningNormalKnight>();
    this.specials = new Array<AuctioningSpecialKnight>();
    this.isFetch = false;
  }
}

export class NFTVeTravaSellingState {
  sellingVeTrava: Array<SellingVeTravaType>;
  priceTokens: Map<EthAddress, TokenSellOption>;
  isFetch: boolean;
  constructor() {
    this.sellingVeTrava = new Array<SellingVeTravaType>();
    this.priceTokens = new Map();
    this.isFetch = false;
  }
}
export class NFTFarmingsState {
  nftFarmings: Map<string, NFTFarming>;
  isFetch: boolean;
  constructor() {
    this.nftFarmings = new Map();
    this.isFetch = false;
  }
}

export class NFTTicketState {
  ticketState: Map<string, Ticket>;
  isFetch: boolean;
  constructor() {
    this.ticketState = new Map();
    this.isFetch = false;
  }
}