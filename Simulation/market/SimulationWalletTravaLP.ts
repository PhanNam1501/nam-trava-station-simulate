import { ethers } from "hardhat";
import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import OraclePrice from "../../utils/oraclePrice";
import { abi as ABITravaLP } from "../../abis/TravaLendingPool.json";
import BEP20ABI from "../../abis/BEP20.json";
import dotenv from "dotenv";
dotenv.config();

// need add tToken to smart wallet state
export async function SimulationSupply(
  appState: ApplicationState,
  tokenAddress: EthAddress,
  amount: number
) {
  try {
    const oraclePrice = new OraclePrice(process.env.ORACLE_ADDRESS!);
    const travaLP = await ethers.getContractAt(
      ABITravaLP,
      process.env.TRAVA_LENDING_POOL_MARKET!
    );

    let reverseList = await travaLP.getReservesList();
    // check tokenAddress is exist on reverseList
    if (
      reverseList.includes(tokenAddress) &&
      appState.walletState.tokenBalances.has(tokenAddress)
    ) {
      // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>

      // get tToken address
      const reserveData = await travaLP.getReserveData(tokenAddress);
      const tToken = reserveData[6];

      // get token amount
      const tokenAmount = BigInt(
        appState.walletState.tokenBalances.get(tokenAddress)!
      );

      // check amount tokenName on appState is enough .Before check convert string to number
      if (tokenAmount >= amount) {
        // update appState amount tokenName
        const newAmount = String(tokenAmount - BigInt(amount));
        appState.walletState.tokenBalances.set(tokenAddress, newAmount);

        // update state of smart wallet trava lp

        // update availableBorrowUSD . (deposited + amount * asset.price) * ltv - borrowed

        appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
          ((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
            BigInt(10 ** 18) +
            BigInt(amount) *
              BigInt(await oraclePrice.getAssetPrice(tokenAddress))) *
            BigInt(appState.smartWalletState.travaLPState.ltv) -
            BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 24)) /
            BigInt(10 ** 22)
        );

        // update healthFactor .((deposited + amount * asset.price) * currentLiquidationThreshold) / borrowed

        // if totalDebtUSD = 0  , not update healthFactor
        if (appState.smartWalletState.travaLPState.totalDebtUSD != "0") {
          appState.smartWalletState.travaLPState.healthFactor = String(
            ((BigInt(
              appState.smartWalletState.travaLPState.totalCollateralUSD
            ) *
              BigInt(10 ** 18) +
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) *
              BigInt(
                appState.smartWalletState.travaLPState
                  .currentLiquidationThreshold
              )) /
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD)
          );
        } else {
          // healthFactor = MaxUint256
          appState.smartWalletState.travaLPState.healthFactor =
            "115792089237316195423570985008687907853269984665640564039457584007913129639935";
        }

        // update totalCollateralUSD. deposited + amount * asset.price
        appState.smartWalletState.travaLPState.totalCollateralUSD = String(
          BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) +
            (BigInt(amount) *
              BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
        );
      } else {
        throw new Error(`Amount ${tokenAddress} on appState is not enough.`);
      }

      // add tToken to smart wallet state if not exist
      if (!appState.smartWalletState.tokenBalances.has(tToken)) {
        appState.smartWalletState.tokenBalances.set(tToken, String(amount));
      } else {
        // update tToken balance of smart wallet
        appState.smartWalletState.tokenBalances.set(
          tToken,
          String(
            BigInt(appState.smartWalletState.tokenBalances.get(tToken)!) +
              BigInt(amount)
          )
        );
      }
    } else {
      throw new Error(`Account or LP does not have ${tokenAddress} token.`);
    }
  } catch (err) {
    throw err;
  }
}

// need add debt token to smart wallet state
export async function SimulationBorrow(
  appState: ApplicationState,
  tokenAddress: EthAddress,
  amount: number
) {
  try {
    const oraclePrice = new OraclePrice(process.env.ORACLE_ADDRESS!);
    const travaLP = await ethers.getContractAt(
      ABITravaLP,
      process.env.TRAVA_LENDING_POOL_MARKET!
    );

    let reverseList = await travaLP.getReservesList();

    // check tokenAddress is exist on reverseList
    if (
      reverseList.includes(tokenAddress) &&
      appState.walletState.tokenBalances.has(tokenAddress)
    ) {
      // get tToken address
      const reserveData = await travaLP.getReserveData(tokenAddress);
      const debToken = reserveData[7];

      // get token amount
      const tokenAmount = BigInt(
        appState.walletState.tokenBalances.get(tokenAddress)!
      );

      // get token price
      const tokenPrice = BigInt(await oraclePrice.getAssetPrice(tokenAddress));

      const borrowUSD =
        (BigInt(amount) * BigInt(tokenPrice)) / BigInt(10 ** 18);

      // check availableBorrowUSD on appState is enough .Before check convert string to number
      if (
        BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) >=
        borrowUSD
      ) {
        // when borrowUSD is enough , update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

        // update availableBorrowUSD :  deposited * ltv - borrowed - amount * asset.price
        appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
          (BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) *
            BigInt(appState.smartWalletState.travaLPState.ltv) *
            BigInt(10 ** 10) -
            BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 14) -
            BigInt(amount) * BigInt(tokenPrice)) /
            BigInt(10 ** 22)
        );

        // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed + amount * asset.price)
        appState.smartWalletState.travaLPState.healthFactor = String(
          (BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
            BigInt(
              appState.smartWalletState.travaLPState.currentLiquidationThreshold
            ) *
            BigInt(10 ** 32)) /
            (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 18) +
              BigInt(amount) * BigInt(tokenPrice))
        );

        // update totalDebtUSD : borrowed + amount * asset.price
        appState.smartWalletState.travaLPState.totalDebtUSD = String(
          BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) +
            borrowUSD
        );
      } else {
        throw new Error(
          `Amount borrow USD volume for token ${tokenAddress} is too much.`
        );
      }

      // add debToken to smart wallet state if not exist
      if (!appState.smartWalletState.tokenBalances.has(debToken)) {
        appState.smartWalletState.tokenBalances.set(debToken, String(amount));
      } else {
        // update tToken balance of smart wallet
        appState.smartWalletState.tokenBalances.set(
          debToken,
          String(
            BigInt(appState.smartWalletState.tokenBalances.get(debToken)!) +
              BigInt(amount)
          )
        );
      }
    } else {
      throw new Error(
        `Account or LP does not have ${tokenAddress} token or token is not exist in reverseList.`
      );
    }
  } catch (err) {
    throw err;
  }
}

// need remove debt token from smart wallet state
export async function SimulationRepay(
  appState: ApplicationState,
  tokenAddress: EthAddress,
  amount: number
) {
  try {
    const oraclePrice = new OraclePrice(process.env.ORACLE_ADDRESS!);

    const travaLP = await ethers.getContractAt(
      ABITravaLP,
      process.env.TRAVA_LENDING_POOL_MARKET!
    );

    let reverseList = await travaLP.getReservesList();
    // check tokenAddress is exist on reverseList
    if (
      reverseList.includes(tokenAddress) &&
      appState.smartWalletState.tokenBalances.has(tokenAddress)
    ) {
      // get reserve data
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const tTokenAddress = reserveData[6];
      const variableDebtTokenAddress = reserveData[7];

      // check balance debt token on smart wallet
      const debtTokenBalance = await ethers.getContractAt(
        BEP20ABI,
        variableDebtTokenAddress
      );

      const debtTokenBalanceOfSmartWallet = await debtTokenBalance.balanceOf(
        appState.smartWalletState.address
      );

      if (debtTokenBalanceOfSmartWallet == 0) {
        throw new Error(`Smart wallet does not borrow ${tokenAddress} token.`);
      } else {
        if (BigInt(debtTokenBalanceOfSmartWallet) >= BigInt(amount)) {
          // repay piece of borrowed token

          // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

          // update availableBorrowUSD :  availableBorrowsUSD + amount * asset.price
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) *
              BigInt(10 ** 18) +
              (BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );

          // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed - amount * asset.price)
          appState.smartWalletState.travaLPState.healthFactor = String(
            (BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
              BigInt(
                appState.smartWalletState.travaLPState
                  .currentLiquidationThreshold
              ) *
              BigInt(10 ** 32)) /
              (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                BigInt(10 ** 18) -
                BigInt(amount) *
                  BigInt(await oraclePrice.getAssetPrice(tokenAddress)))
          );

          // update totalDebtUSD : borrowed - amount * asset.price
          appState.smartWalletState.travaLPState.totalDebtUSD = String(
            (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 18) -
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );
        } else {
          // repay all borrowed token

          // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

          // update availableBorrowUSD :  availableBorrowsUSD + debtTokenBalance * asset.price
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) *
              BigInt(10 ** 18) +
              (BigInt(debtTokenBalanceOfSmartWallet) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );

          // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed - debtTokenBalance * asset.price)
          appState.smartWalletState.travaLPState.healthFactor = String(
            (BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
              BigInt(
                appState.smartWalletState.travaLPState
                  .currentLiquidationThreshold
              ) *
              BigInt(10 ** 32)) /
              (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                BigInt(10 ** 18) -
                BigInt(debtTokenBalanceOfSmartWallet) *
                  BigInt(await oraclePrice.getAssetPrice(tokenAddress)))
          );

          // update totalDebtUSD : borrowed - debtTokenBalance * asset.price
          appState.smartWalletState.travaLPState.totalDebtUSD = String(
            (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 18) -
              BigInt(debtTokenBalanceOfSmartWallet) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );
        }
      }

      // set token balance to 0
      appState.smartWalletState.tokenBalances.set(tokenAddress, "0");
    } else {
      throw new Error(
        `Token ${tokenAddress} is not exist in reverseList or smart wallet does not have ${tokenAddress} token.`
      );
    }
  } catch (err) {
    throw err;
  }
}

// need remove tToken from smart wallet state
export async function SimulationWithdraw(
  appState: ApplicationState,
  tokenAddress: EthAddress,
  amount: number
) {
  try {
    const oraclePrice = new OraclePrice(process.env.ORACLE_ADDRESS!);

    const travaLP = await ethers.getContractAt(
      ABITravaLP,
      process.env.TRAVA_LENDING_POOL_MARKET!
    );

    let reverseList = await travaLP.getReservesList();
    // check tokenAddress is exist on reverseList
    if (
      reverseList.includes(tokenAddress) &&
      appState.smartWalletState.tokenBalances.has(tokenAddress)
    ) {
      // get reserve data
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const tTokenAddress = reserveData[6];
      const variableDebtTokenAddress = reserveData[7];

      // check balance tToken on smart wallet
      const tTokenBalance = await ethers.getContractAt(BEP20ABI, tTokenAddress);

      const tTokenBalanceOfSmartWallet = await tTokenBalance.balanceOf(
        appState.smartWalletState.address
      );

      if (tTokenBalanceOfSmartWallet == 0) {
        throw new Error(`Smart wallet does not supply ${tokenAddress} token.`);
      } else {
        if (BigInt(tTokenBalanceOfSmartWallet) >= BigInt(amount)) {
          // withdraw piece of supplied token

          // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

          // update availableBorrowUSD : (deposited - amount * asset.price) * ltv - borrowed
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            ((BigInt(
              appState.smartWalletState.travaLPState.totalCollateralUSD
            ) *
              BigInt(10 ** 18) -
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) *
              BigInt(appState.smartWalletState.travaLPState.ltv) -
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                BigInt(10 ** 24)) /
              BigInt(10 ** 22)
          );

          // update healthFactor :((deposited - amount * asset.price) * currentLiquidationThreshold) / borrowed
          if (appState.smartWalletState.travaLPState.totalDebtUSD != "0") {
            appState.smartWalletState.travaLPState.healthFactor = String();
          } else {
            // healthFactor = MaxUint256
            // need check this
            appState.smartWalletState.travaLPState.healthFactor =
              "115792089237316195423570985008687907853269984665640564039457584007913129639935";
          }

          // update totalCollateralUSD. deposited - amount * asset.price

          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
              (BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );
        } else {
          // repay all supplied token

          // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

          // update availableBorrowUSD : (deposited - amount * asset.price) * ltv - borrowed
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            ((BigInt(
              appState.smartWalletState.travaLPState.totalCollateralUSD
            ) *
              BigInt(10 ** 18) -
              BigInt(tTokenBalanceOfSmartWallet) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) *
              BigInt(appState.smartWalletState.travaLPState.ltv) -
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                BigInt(10 ** 24)) /
              BigInt(10 ** 22)
          );

          // update healthFactor :((deposited - amount * asset.price) * currentLiquidationThreshold) / borrowed
          if (appState.smartWalletState.travaLPState.totalDebtUSD != "0") {
            appState.smartWalletState.travaLPState.healthFactor = String(
              (appState.smartWalletState.travaLPState.healthFactor = String(
                ((BigInt(
                  appState.smartWalletState.travaLPState.totalCollateralUSD
                ) *
                  BigInt(10 ** 18) -
                  BigInt(tTokenBalanceOfSmartWallet) *
                    BigInt(await oraclePrice.getAssetPrice(tokenAddress))) *
                  BigInt(
                    appState.smartWalletState.travaLPState
                      .currentLiquidationThreshold
                  )) /
                  BigInt(appState.smartWalletState.travaLPState.totalDebtUSD)
              ))
            );
          } else {
            // healthFactor = MaxUint256
            // need check this
            appState.smartWalletState.travaLPState.healthFactor =
              "115792089237316195423570985008687907853269984665640564039457584007913129639935";
          }

          // update totalCollateralUSD. deposited - amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
              (BigInt(tTokenBalanceOfSmartWallet) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );
        }
      }

      // set token balance to 0
      appState.smartWalletState.tokenBalances.set(tokenAddress, "0");
    } else {
      throw new Error(
        `Token ${tokenAddress} is not exist in reverseList or smart wallet does not have ${tokenAddress} token.`
      );
    }
  } catch (err) {
    throw err;
  }
}
