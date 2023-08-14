import { EthAddress } from "../utils/types";

export class NFTData {
  id: string | number;
  data: {
    price: string | number;
    seller: EthAddress;
    [key: string]: any;
  };
  constructor() {
    this.id = '0';
    this.data = {
      price: "0",
      seller: "0x0000000000000000000000000000000000000000"
    };
  }
}

export class NFT {
  v1: Array<NFTData>;
  v2: Array<NFTData>;

  constructor() {
    this.v1 = new Array<NFTData>();
    this.v2 = new Array<NFTData>();
  }
}

export class NFTState {
  nfts: NFT;

  constructor() {
    this.nfts = new NFT();
  }
}
