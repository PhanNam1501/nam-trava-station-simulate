import { AuctioningNormalKnight, AuctioningSpecialKinght, SellingArmouryType } from "../Simulation/trava/nft/helpers/global";

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
  specials: Array<AuctioningSpecialKinght>;
  isFetch: boolean;
  constructor() {
    this.v1 = new Array<AuctioningNormalKnight>();
    this.v2 = new Array<AuctioningNormalKnight>();
    this.specials = new Array<AuctioningSpecialKinght>();
    this.isFetch = false;
  }
}
