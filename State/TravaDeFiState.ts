/**
 *
 * @param
 * @param
 */
export class WalletTravaLPState {
  totalCollateralUSD: string; // USD
  totalDebtUSD: string; // USD
  availableBorrowsUSD: string; // USD
  healthFactor: string; //

  constructor() {
    this.totalCollateralUSD = "";
    this.totalDebtUSD = "";
    this.availableBorrowsUSD = "";
    this.healthFactor = "";
  }
}

export class TravaLPState {}
