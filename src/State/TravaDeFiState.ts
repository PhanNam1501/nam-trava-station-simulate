/**
 *
 * @param
 * @param
 */
export class WalletTravaLPState {
  totalCollateralUSD: string; // USD
  totalDebtUSD: string; // USD
  availableBorrowsUSD: string; // USD
  currentLiquidationThreshold: string; //
  ltv: string; //
  healthFactor: string; //

  constructor() {
    this.totalCollateralUSD = "";
    this.totalDebtUSD = "";
    this.availableBorrowsUSD = "";
    this.currentLiquidationThreshold = "";
    this.ltv = "";
    this.healthFactor = "";
  }
}

export class TravaLPStakingState{
  deposited : string;
  claimableReward :string;
  claimedReward : string;
  constructor(){
    this.deposited = "";
    this.claimableReward = "";
    this.claimedReward = "";
  }
}
export class BaseAccountVault  {
  id: string;
  name : string;
  code : string;
  underlyingAddress: string;
  stakedTokenAddress: string;
  claimable: boolean;
  reserveDecimals : string;
  claimableReward: string;
  claimedReward:string;
  deposited: string;
  
  constructor()
  {
    this.id=""
    this.name=""
    this.code=""
    this.underlyingAddress=""
    this.stakedTokenAddress=""
    this.claimable=false
    this.reserveDecimals="0"
    this.claimableReward="0"
    this.claimedReward="0"
    this.deposited="0"
    
  }
  

}
export class TravaLPState {}
