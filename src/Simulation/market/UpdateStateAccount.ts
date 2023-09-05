import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { Contract } from "ethers";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import BEP20ABI from "../../abis/BEP20.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import _ from "lodash";

export async function updateLPtTokenInfo(
  appState1: ApplicationState,
  _tokenAddress: EthAddress
) {
  try {
    const appState = { ...appState1 };

    const travaLP = new Contract(
      getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
      ABITravaLP,
      appState.web3!
    );

    let reverseList = await travaLP.getReservesList();

    let tokenAddress = convertHexStringToAddress(_tokenAddress);
    let tokenAddressState = tokenAddress.toLowerCase();

    if (
      reverseList.includes(tokenAddress) &&
      !appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
    ) {
      // get reserve data
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const tTokenAddress = String(reserveData[6]).toLowerCase();

      // get amount
      const tTokenContract = new Contract(
        tTokenAddress,
        BEP20ABI,
        appState.web3
      );

      const tTokenBalance = await tTokenContract.balanceOf(
        appState.smartWalletState.address
      );

      appState.smartWalletState.detailTokenInPool =
        appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
          tToken: {
            address: tTokenAddress.toLowerCase(),
            balances: tTokenBalance.toString(),
          },
        });
    } else if (
      reverseList.includes(tokenAddress) &&
      appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
    ) {
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const tTokenAddress = String(reserveData[6]).toLowerCase();

      // get amount
      const tTokenContract = new Contract(
        tTokenAddress,
        BEP20ABI,
        appState.web3
      );

      const tTokenBalance = await tTokenContract.balanceOf(
        appState.smartWalletState.address
      );

      let tokenInfo =
        appState.smartWalletState.detailTokenInPool.get(tokenAddressState);

      tokenInfo.tToken = {
        address: tTokenAddress.toLowerCase(),
        balances: tTokenBalance.toString(),
      };

      appState.smartWalletState.detailTokenInPool.set(
        tokenAddressState,
        tokenInfo
      );
    } else {
      throw new Error(`Can't update info of LP tToken ${tokenAddress}`);
    }

    return appState;
  } catch (error) {
    throw new Error("Can't update LP tToken info !");
  }
}

export async function updateLPDebtTokenInfo(
  appState1: ApplicationState,
  _tokenAddress: EthAddress
) {
  try {
    const appState = { ...appState1 };

    const travaLP = new Contract(
      getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
      ABITravaLP,
      appState.web3!
    );

    let reverseList = await travaLP.getReservesList();

    let tokenAddress = convertHexStringToAddress(_tokenAddress);
    let tokenAddressState = tokenAddress.toLowerCase();

    if (
      reverseList.includes(tokenAddress) &&
      !appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
    ) {
      // get reserve data
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();

      // get amount
      const debtTokenContract = new Contract(
        variableDebtTokenAddress,
        BEP20ABI,
        appState.web3
      );

      const debtTokenBalance = await debtTokenContract.balanceOf(
        appState.smartWalletState.address
      );

      appState.smartWalletState.detailTokenInPool =
        appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
          dToken: {
            address: variableDebtTokenAddress.toLowerCase(),
            balances: debtTokenBalance.toString(),
          },
        });
    } else if (
      reverseList.includes(tokenAddress) &&
      appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
    ) {
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();

      // get amount
      const debtTokenContract = new Contract(
        variableDebtTokenAddress,
        BEP20ABI,
        appState.web3
      );

      const debtTokenBalance = await debtTokenContract.balanceOf(
        appState.smartWalletState.address
      );

      let tokenInfo =
        appState.smartWalletState.detailTokenInPool.get(tokenAddressState);
      tokenInfo.dToken = {
        address: variableDebtTokenAddress.toLowerCase(),
        balances: debtTokenBalance.toString(),
      };

      appState.smartWalletState.detailTokenInPool.set(
        tokenAddressState,
        tokenInfo
      );
    } else {
      throw new Error(`Can't update info of LP Debt Token ${tokenAddress}`);
    }

    return appState;
  } catch (error) {
    throw new Error("Can't update LP Debt Token info !");
  }
}

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
      const reserve = new Contract(reserveAddress, BEP20ABI, appState.web3);
      reserveAddress = String(reserveAddress).toLowerCase();
      if (
        String(appState.walletState.tokenBalances.get(reserveAddress)!) ==
        "undefined"
      ) {
        const balance = await reserve.balanceOf(userAddress);

        appState.walletState.tokenBalances.set(reserveAddress, balance);
      }

      if (
        String(appState.smartWalletState.tokenBalances.get(reserveAddress)!) ==
        "undefined"
      ) {
        // update token balance for smart wallet
        const smartWalletBalance = await reserve.balanceOf(
          appState.smartWalletState.address
        );

        appState.smartWalletState.tokenBalances.set(
          reserveAddress,
          smartWalletBalance
        );
      }
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
    return appState;
  } catch (e) {
    console.log(e);
    return appState1;
  }
}
