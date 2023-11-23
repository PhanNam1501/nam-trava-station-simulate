import { EthAddress, uint256 } from "trava-station-sdk";

/**
 *
 * @param
 * @param
 */
export interface LPReward {
  tokenAddress: EthAddress;
  claimableReward: uint256;
}

export class WalletTravaLPState {
  totalCollateralUSD: uint256; // USD
  totalDebtUSD: uint256; // USD
  availableBorrowsUSD: uint256; // USD
  currentLiquidationThreshold: uint256; //
  ltv: uint256; //
  healthFactor: uint256; //
  lpReward: LPReward;

  constructor() {
    this.totalCollateralUSD = "";
    this.totalDebtUSD = "";
    this.availableBorrowsUSD = "";
    this.currentLiquidationThreshold = "";
    this.ltv = "";
    this.healthFactor = "";
    this.lpReward = {
      tokenAddress: "",
      claimableReward: "",
    }
  }
}

export class TravaLPStakingState {
  deposited: uint256;
  claimableReward: uint256;
  claimedReward: uint256;
  constructor() {
    this.deposited = "";
    this.claimableReward = "";
    this.claimedReward = "";
  }
}

export interface UnderlyingTokenData {
  underlyingAddress: EthAddress;
  reserveDecimals: string;
  price: string;
}

export interface StakedTokenData {
  id: string;
  name: string;
  code: string;
  stakedTokenAddress: EthAddress;
  eps: uint256;
  reserveDecimals: uint256;
}

export interface RewardTokenData {
  address: EthAddress;
  decimals: uint256;
  price: uint256;
}

export class BaseAccountVault {
  claimable: boolean;
  claimableReward: uint256;
  deposited: uint256;
  TVL: uint256;
  APR: uint256;
  underlyingToken: UnderlyingTokenData;
  stakedToken: StakedTokenData;
  rewardToken: RewardTokenData;


  constructor() {
    this.claimable = false
    this.claimableReward = "0"
    this.deposited = "0"
    this.TVL = "0"
    this.APR = "0"
    this.underlyingToken = {
      underlyingAddress: "",
      reserveDecimals: "",
      price: "0",
    }
    this.stakedToken = {
      id: "",
      name: "",
      code: "",
      stakedTokenAddress: "",
      eps: "",
      reserveDecimals: "",
    }
    this.rewardToken = {
      address: "",
      decimals: "",
      price: ""
    }

  }


}
