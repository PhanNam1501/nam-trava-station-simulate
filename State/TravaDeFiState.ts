/**
 *
 * @param
 * @param
 */
export class WalletTravaLPState {
  totalCollateralUSD: string; // USD
  totalDebtUSD: string; // USD
  availableBorrowsUSD: string; // USD
  ltv: string; //
  healthFactor: string; //

  constructor() {
    this.totalCollateralUSD = "";
    this.totalDebtUSD = "";
    this.availableBorrowsUSD = "";
    this.ltv = "";
    this.healthFactor = "";
  }
}

export class TravaLPState {}
