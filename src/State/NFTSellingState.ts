import { SellingArmouryType } from "../global";

export class NFTSellingState {
  v1: Array<SellingArmouryType>;
  v2: Array<SellingArmouryType>;

  constructor() {
    this.v1 = new Array<SellingArmouryType>();
    this.v2 = new Array<SellingArmouryType>();
  }
}
