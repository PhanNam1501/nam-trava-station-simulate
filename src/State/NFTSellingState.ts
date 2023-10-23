import { SellingArmouryType } from "../Simulation/trava/nft/helpers/global";

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
