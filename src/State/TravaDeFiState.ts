/**
 *
 * @param
 * @param
 */
export interface LPReward {
  tokenAddress: string;
  claimableReward: string;
}

export class WalletTravaLPState {
  totalCollateralUSD: string; // USD
  totalDebtUSD: string; // USD
  availableBorrowsUSD: string; // USD
  currentLiquidationThreshold: string; //
  ltv: string; //
  healthFactor: string; //
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
  deposited: string;
  claimableReward: string;
  claimedReward: string;
  constructor() {
    this.deposited = "";
    this.claimableReward = "";
    this.claimedReward = "";
  }
}

export interface UnderlyingTokenData {
  underlyingAddress: string;
  reserveDecimals: string;
  price: string;
}

export interface StakedTokenData {
  id: string;
  name: string;
  code: string;
  stakedTokenAddress: string;
  eps: string;
  reserveDecimals: string;
}

export interface RewardTokenData {
  address: string;
  decimals: string;
  price: string;
}

export class BaseAccountVault {
  claimable: boolean;
  claimableReward: string;
  deposited: string;
  TVL: string;
  APR: string;
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
export class TravaLPState { }
