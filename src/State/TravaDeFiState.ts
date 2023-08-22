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

export class TravaLPState {}
