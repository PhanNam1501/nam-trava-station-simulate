import { ethers } from "hardhat";
import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { abi as ABITravaLP } from "../../abis/TravaLendingPool.json";
import dotenv from "dotenv";
dotenv.config();

// call this before interacting with TravaLP
export async function updateTravaLPInfo(
  appState: ApplicationState,
  userAddress: EthAddress
) {
  const TravaLendingPool = await ethers.getContractAt(
    ABITravaLP,
    process.env.TRAVA_LENDING_POOL_MARKET!
  );

  const {
    totalCollateralUSD,
    totalDebtUSD,
    availableBorrowsUSD,
    currentLiquidationThreshold,
    ltv,
    healthFactor,
  } = await TravaLendingPool.getUserAccountData(userAddress);

  // update appState
  appState.walletState.travaLPState.totalCollateralUSD = totalCollateralUSD;
  appState.walletState.travaLPState.totalDebtUSD = totalDebtUSD;
  appState.walletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD;
  appState.walletState.travaLPState.healthFactor = healthFactor;
}
