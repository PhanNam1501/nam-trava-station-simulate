import { EthAddress, uint256 } from "trava-station-sdk";

// Selling
export type SellingArmouryType = {
  id: number;
  collectionName: string;
  collectionId: number;
  nRarity: number;
  nType: number;
  rarity: string;
  type: string;
  exp: number;
  price: string;
  seller: string;
};

// Owned
export type ArmouryObject = {
  [tokenId: string]: ArmouryType;
}
export type ArmouryType = {
  tokenId: number;
  version: string;
  set: number;
  nRarity: number;
  nType: number;
  rarity: string;
  type: string;
  exp: number;
};
export interface BaseKnight {
  armorTokenId: number;
  helmetTokenId: number;
  shieldTokenId: number;
  weaponTokenId: number;
  rarity: number;
  id: number;
  setId: number;
  exp: number;
}
export interface NormalKnight extends BaseKnight {
  armor: CollectionArmoury;
  helmet: CollectionArmoury;
  shield: CollectionArmoury;
  weapon: CollectionArmoury;
}
export type CollectionArmoury = {
  tokenId: number;
  rarity: number;
  exp: number;
};
export interface SpecialKnight extends BaseKnight {
  metadataLink: string;
}

export interface ChangeAuctionKnightData {
  newStartingBid: string;

}

export interface AuctionKnightData extends ChangeAuctionKnightData {
  nftSeller: EthAddress;
  startingBid: string;
  currentBidder: EthAddress;
  currentBid: string;
  startTime: number;
  endTime: number;
  bidSteps: number;
}

export interface AuctioningNormalKnight extends NormalKnight, AuctionKnightData {

};

export interface AuctioningSpecialKnight extends SpecialKnight, AuctionKnightData { };

// The graph type
export type Token = {
  exp: null | number;
  rarity: number;
  id: string;
  type: number;
  setId: string;
};
export type NFTMarketplaceType = {
  buyer: null | string;
  id: string;
  price: string;
  seller: string;
  status: string;
  token: Token;
};

export type CollectionOwnedMarketplaceType = {
  id: string;
  exp: string | null;
  setId: string | null;
  rarity: string;
  armor: CollectionArmouryFromGraph | null;
  helmet: CollectionArmouryFromGraph | null;
  shield: CollectionArmouryFromGraph | null;
  weapon: CollectionArmouryFromGraph | null;
};
export type CollectionArmouryFromGraph = {
  tokenId: string;
  rarity: string;
  exp: string | null;
};

// VeTrava
export type SellingVeTravaType = {
  id: number;
  amount: number;
  rwAmount: number;
  end: uint256;
  token: EthAddress;
  votingPower: number;
  seller: EthAddress;
  price: number;
  priceToken: EthAddress;
};