import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { Contract } from "ethers";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import BEP20ABI from "../../abis/BEP20.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import _ from "lodash";
// call this before all actions
export async function updateTravaLPInfo(
  appState1: ApplicationState,
  userAddress: EthAddress
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    // first update token in pool balances
    const TravaLendingPool = new Contract(
      getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
      ABITravaLP,
      appState.web3!
    );

    const reserveAddressList = await TravaLendingPool.getReservesList();
    if (reserveAddressList.length == 0) {
      throw new Error("No reserve in TravaLP");
    }
    // update balance for wallet
    for (let i = 0; i < reserveAddressList.length; i++) {
      // update token balance for wallet
      let reserveAddress = reserveAddressList[i];
      const reserve = new Contract (reserveAddress,BEP20ABI,appState.web3);
      const balance = await reserve.balanceOf(userAddress);

      reserveAddress = String(reserveAddress).toLowerCase();
      appState.walletState.tokenBalances.set(reserveAddress, balance);

      // update token balance for smart wallet
      const smartWalletBalance = await reserve.balanceOf(
        appState.smartWalletState.address
      );

      appState.smartWalletState.tokenBalances.set(
        reserveAddress,
        smartWalletBalance
      );
    }

    // second update TravaLP state for wallet
    const userData = await TravaLendingPool.getUserAccountData(userAddress);

    // update appState for wallet
    appState.walletState.travaLPState.totalCollateralUSD =
      userData.totalCollateralUSD;
    appState.walletState.travaLPState.totalDebtUSD = userData.totalDebtUSD;
    appState.walletState.travaLPState.availableBorrowsUSD =
      userData.availableBorrowsUSD;
    appState.walletState.travaLPState.currentLiquidationThreshold =
      userData.currentLiquidationThreshold;
    appState.walletState.travaLPState.healthFactor = userData.healthFactor;
    appState.walletState.travaLPState.ltv = userData.ltv;

    // third update TravaLP state for smart wallet
    const smartWalletData = await TravaLendingPool.getUserAccountData(
      appState.smartWalletState.address
    );

    // update appState for smart wallet
    appState.smartWalletState.travaLPState.totalCollateralUSD =
      smartWalletData.totalCollateralUSD;
    appState.smartWalletState.travaLPState.totalDebtUSD =
      smartWalletData.totalDebtUSD;
    appState.smartWalletState.travaLPState.availableBorrowsUSD =
      smartWalletData.availableBorrowsUSD;
    appState.smartWalletState.travaLPState.currentLiquidationThreshold =
      smartWalletData.currentLiquidationThreshold;
    appState.smartWalletState.travaLPState.healthFactor =
      smartWalletData.healthFactor;
    appState.smartWalletState.travaLPState.ltv = smartWalletData.ltv;
  } catch (e) {
    console.log(e);
  }
  return appState;
}

// const appState = new ApplicationState(
//   "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1",
//   "0x957d84Da98c5Db9e0d3d7FE667D3FA00339f3372"
// );

// updateTravaLPInfo(appState, "0x0d7a757EECAbfe8daa06E9ab8F106911d846D8a1").then(
//   () => {
//     console.log(appState.walletState.travaLPState);
//     console.log(appState.walletState.tokenBalances);
//   }
// );
