import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import OraclePrice from "../../utils/oraclePrice";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import BEP20ABI from "../../abis/BEP20.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Contract } from "ethers";
import _ from "lodash";
import { MAX_UINT256 } from "../../utils/config";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
import { BigNumber } from "bignumber.js";

export async function SimulationSupply(
  appState1: ApplicationState,
  _tokenAddress: EthAddress,
  _from: EthAddress,
  _amount: string,
  _tokenDecimal: string
): Promise<ApplicationState> {
  try {
    let amount = _amount;
    const appState = { ...appState1 };
    const oraclePrice = new OraclePrice(
      getAddr("ORACLE_ADDRESS", appState.chainId),
      appState.web3!
    );

    const tokenAddress = convertHexStringToAddress(_tokenAddress);
    _tokenAddress = _tokenAddress.toLowerCase();

    if (_from.toLowerCase() == appState.walletState.address) {
      // check tokenAddress is exist on reverseList
      if (
        appState.smartWalletState.detailTokenInPool.has(_tokenAddress) &&
        appState.walletState.tokenBalances.has(_tokenAddress)
      ) {
        // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>

        // get token amount
        const tokenAmount = BigInt(
          appState.walletState.tokenBalances.get(_tokenAddress)!
        );

        if (
          amount.toString() == MAX_UINT256 ||
          BigInt(amount) == BigInt(MAX_UINT256)
        ) {
          amount = appState.walletState.tokenBalances.get(_tokenAddress)!;
        }

        // check amount tokenName on appState is enough .Before check convert string to number
        if (tokenAmount >= BigInt(amount)) {
          // update appState amount tokenName
          const newAmount = String(tokenAmount - BigInt(amount));
          appState.walletState.tokenBalances.set(_tokenAddress, newAmount);

          // update state of smart wallet trava lp

          // update availableBorrowUSD . (deposited + amount * asset.price) * ltv - borrowed
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            ((BigInt(
              appState.smartWalletState.travaLPState.totalCollateralUSD
            ) *
              BigInt(10 ** 18) +
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) *
              BigInt(appState.smartWalletState.travaLPState.ltv) -
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                BigInt(10 ** 24)) /
              BigInt(10 ** 22)
          );

          // update healthFactor .((deposited + amount * asset.price) * currentLiquidationThreshold) / borrowe
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
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          }

          // update totalCollateralUSD. deposited + amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) +
              (BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );
        }

        // add tToken to smart wallet state if not exist
        const tokenInfo =
          appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

        tokenInfo.tToken = {
          ...tokenInfo.tToken,
          balances: String(BigInt(tokenInfo.tToken.balances) + BigInt(amount)),
        };

        appState.smartWalletState.detailTokenInPool.set(
          _tokenAddress,
          tokenInfo
        );

        return appState;
      } else {
        throw new Error(`Account or LP does not have ${tokenAddress} token.`);
      }
    } else if (_from.toLowerCase() == appState.smartWalletState.address) {
      // check tokenAddress is exist on reverseList
      if (
        appState.smartWalletState.detailTokenInPool.has(_tokenAddress) &&
        appState.walletState.tokenBalances.has(_tokenAddress)
      ) {
        // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>

        // get token amount
        const tokenAmount = BigInt(
          appState.walletState.tokenBalances.get(_tokenAddress)!
        );

        if (
          amount.toString() == MAX_UINT256 ||
          BigInt(amount) == BigInt(MAX_UINT256)
        ) {
          amount = appState.walletState.tokenBalances.get(_tokenAddress)!;
        }

        // check amount tokenName on appState is enough .Before check convert string to number
        if (tokenAmount >= BigInt(amount)) {
          // update appState amount tokenName
          const newAmount = String(tokenAmount - BigInt(amount));
          appState.smartWalletState.tokenBalances.set(_tokenAddress, newAmount);

          // update state of smart wallet trava lp

          // update availableBorrowUSD . (deposited + amount * asset.price) * ltv - borrowed
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            ((BigInt(
              appState.smartWalletState.travaLPState.totalCollateralUSD
            ) *
              BigInt(10 ** 18) +
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) *
              BigInt(appState.smartWalletState.travaLPState.ltv) -
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                BigInt(10 ** 24)) /
              BigInt(10 ** 22)
          );

          // update healthFactor .((deposited + amount * asset.price) * currentLiquidationThreshold) / borrowe
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
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          }

          // update totalCollateralUSD. deposited + amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) +
              (BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );
        }

        // add tToken to smart wallet state if not exist
        const tokenInfo =
          appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

        tokenInfo.tToken = {
          ...tokenInfo.tToken,
          balances: String(BigInt(tokenInfo.tToken.balances) + BigInt(amount)),
        };

        appState.smartWalletState.detailTokenInPool.set(
          _tokenAddress,
          tokenInfo
        );

        return appState;
      } else {
        throw new Error(`Account or LP does not have ${tokenAddress} token.`);
      }
    }

    return appState;
  } catch (err) {
    throw err;
  }
}

// need add debt token to smart wallet state
export async function SimulationBorrow(
  appState1: ApplicationState,
  _to: EthAddress,
  _tokenAddress: EthAddress,
  _amount: string
): Promise<ApplicationState> {
  try {
    let amount = _amount;
    const appState = { ...appState1 };
    const oraclePrice = new OraclePrice(
      getAddr("ORACLE_ADDRESS", appState.chainId),
      appState.web3!
    );

    const tokenAddress = convertHexStringToAddress(_tokenAddress);
    _tokenAddress = _tokenAddress.toLowerCase();

    if (_to.toLowerCase() == appState.walletState.address) {
      //  check tokenAddress is exist on reverseList
      if (
        appState.smartWalletState.tokenBalances.has(_tokenAddress) &&
        appState.smartWalletState.detailTokenInPool.has(_tokenAddress)
      ) {
        // get tToken address

        // get token price
        const tokenPrice = BigInt(
          await oraclePrice.getAssetPrice(tokenAddress)
        );

        let borrowUSD;

        if (
          amount.toString() == MAX_UINT256 ||
          BigInt(amount) == BigInt(MAX_UINT256)
        ) {
          borrowUSD = BigInt(
            appState.smartWalletState.travaLPState.availableBorrowsUSD
          );
          let x = (borrowUSD * BigInt(10 ** 18)) % BigInt(tokenPrice);
          amount = (
            (borrowUSD * BigInt(10 ** 18) - BigInt(x)) /
            BigInt(tokenPrice)
          ).toString();
        } else {
          borrowUSD = (BigInt(amount) * BigInt(tokenPrice)) / BigInt(10 ** 18);
        }
        // check availableBorrowUSD on appState is enough .Before check convert string to number
        if (
          BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) >=
          borrowUSD
        ) {
          // when borrowUSD is enough , update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

          // update availableBorrowUSD :  deposited * ltv - borrowed - amount * asset.price
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            ((BigInt(
              appState.smartWalletState.travaLPState.totalCollateralUSD
            ) *
              BigInt(appState.smartWalletState.travaLPState.ltv) -
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                BigInt(10 ** 4)) *
              BigInt(10 ** 14) -
              borrowUSD * BigInt(10 ** 18)) /
              BigInt(10 ** 18)
          );

          // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed + amount * asset.price)
          if (
            (
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) +
              BigInt(borrowUSD)
            ).toString() == "0"
          ) {
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          } else {
            appState.smartWalletState.travaLPState.healthFactor = String(
              (BigInt(
                appState.smartWalletState.travaLPState.totalCollateralUSD
              ) *
                BigInt(
                  appState.smartWalletState.travaLPState
                    .currentLiquidationThreshold
                ) *
                BigInt(10 ** 32)) /
                (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                  BigInt(10 ** 18) +
                  borrowUSD * BigInt(10 ** 18))
            );
          }

          // update totalDebtUSD : borrowed + amount * asset.price
          appState.smartWalletState.travaLPState.totalDebtUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) +
              borrowUSD
          );
        }

        // add debToken to smart wallet state if not exist
        appState.walletState.tokenBalances.set(
          _tokenAddress,
          String(
            BigInt(appState.walletState.tokenBalances.get(_tokenAddress)!) +
              BigInt(amount)
          )
        );

        let tokenInfo =
          appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

        tokenInfo.dToken = {
          ...tokenInfo.dToken,
          balances: String(BigInt(tokenInfo.dToken.balances) + BigInt(amount)),
        };

        appState.smartWalletState.detailTokenInPool.set(
          _tokenAddress,
          tokenInfo
        );
      }
    } else if (_to.toLowerCase() == appState.smartWalletState.address) {
      //  check tokenAddress is exist on reverseList
      if (
        appState.smartWalletState.tokenBalances.has(_tokenAddress) &&
        appState.smartWalletState.detailTokenInPool.has(_tokenAddress)
      ) {
        // get tToken address

        // get token price
        const tokenPrice = BigInt(
          await oraclePrice.getAssetPrice(tokenAddress)
        );

        let borrowUSD;

        if (
          amount.toString() == MAX_UINT256 ||
          BigInt(amount) == BigInt(MAX_UINT256)
        ) {
          borrowUSD = BigInt(
            appState.smartWalletState.travaLPState.availableBorrowsUSD
          );
          let x = (borrowUSD * BigInt(10 ** 18)) % BigInt(tokenPrice);
          amount = (
            (borrowUSD * BigInt(10 ** 18) - BigInt(x)) /
            BigInt(tokenPrice)
          ).toString();
        } else {
          borrowUSD = (BigInt(amount) * BigInt(tokenPrice)) / BigInt(10 ** 18);
        }
        // check availableBorrowUSD on appState is enough .Before check convert string to number
        if (
          BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) >=
          borrowUSD
        ) {
          // when borrowUSD is enough , update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

          // update availableBorrowUSD :  deposited * ltv - borrowed - amount * asset.price
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            ((BigInt(
              appState.smartWalletState.travaLPState.totalCollateralUSD
            ) *
              BigInt(appState.smartWalletState.travaLPState.ltv) -
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                BigInt(10 ** 4)) *
              BigInt(10 ** 14) -
              borrowUSD * BigInt(10 ** 18)) /
              BigInt(10 ** 18)
          );

          // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed + amount * asset.price)
          if (
            (
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) +
              BigInt(borrowUSD)
            ).toString() == "0"
          ) {
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          } else {
            appState.smartWalletState.travaLPState.healthFactor = String(
              (BigInt(
                appState.smartWalletState.travaLPState.totalCollateralUSD
              ) *
                BigInt(
                  appState.smartWalletState.travaLPState
                    .currentLiquidationThreshold
                ) *
                BigInt(10 ** 32)) /
                (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                  BigInt(10 ** 18) +
                  borrowUSD * BigInt(10 ** 18))
            );
          }

          // update totalDebtUSD : borrowed + amount * asset.price
          appState.smartWalletState.travaLPState.totalDebtUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) +
              borrowUSD
          );
        }

        // add debToken to smart wallet state if not exist
        appState.smartWalletState.tokenBalances.set(
          _tokenAddress,
          String(
            BigInt(
              appState.smartWalletState.tokenBalances.get(_tokenAddress)!
            ) + BigInt(amount)
          )
        );

        let tokenInfo =
          appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

        tokenInfo.dToken = {
          ...tokenInfo.dToken,
          balances: String(BigInt(tokenInfo.dToken.balances) + BigInt(amount)),
        };

        appState.smartWalletState.detailTokenInPool.set(
          _tokenAddress,
          tokenInfo
        );
      } else {
        throw new Error(
          `Account or LP does not have ${tokenAddress} token or token is not exist in reverseList.`
        );
      }
    }

    return appState;
  } catch (err) {
    throw err;
  }
}

// need remove debt token from smart wallet state
export async function SimulationRepay(
  appState1: ApplicationState,
  _from: EthAddress,
  _tokenAddress: EthAddress,
  _amount: string
): Promise<ApplicationState> {
  try {
    let amount = _amount;
    const appState = { ...appState1 };
    const oraclePrice = new OraclePrice(
      getAddr("ORACLE_ADDRESS", appState.chainId),
      appState.web3!
    );

    const tokenAddress = convertHexStringToAddress(_tokenAddress);
    _tokenAddress = _tokenAddress.toLowerCase();

    if (_from.toLowerCase() == appState.walletState.address) {
      // check tokenAddress is exist on reverseList
      if (
        appState.smartWalletState.tokenBalances.has(_tokenAddress) &&
        appState.smartWalletState.detailTokenInPool.has(_tokenAddress)
      ) {
        if (
          amount.toString() == MAX_UINT256 ||
          BigInt(amount) == BigInt(MAX_UINT256)
        ) {
          amount =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
              .dToken.balances;
        }

        const debtTokenSmartWalletBalance =
          appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!.dToken
            .balances;

        if (BigInt(debtTokenSmartWalletBalance) > BigInt(amount)) {
          // repay piece of borrowed token

          // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

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

          // update availableBorrowUSD :  availableBorrowsUSD + amount * asset.price
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            (BigInt(
              appState.smartWalletState.travaLPState.availableBorrowsUSD
            ) *
              BigInt(10 ** 18) +
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );

          // update totalDebtUSD : borrowed - amount * asset.price
          appState.smartWalletState.travaLPState.totalDebtUSD = String(
            (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 18) -
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );

          // set debt token balance to debtTokenSmartWalletBalance - amount
          appState.walletState.tokenBalances.set(
            _tokenAddress,
            String(
              BigInt(appState.walletState.tokenBalances.get(_tokenAddress)!) -
                BigInt(amount)
            )
          );

          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

          tokenInfo.dToken.balances = String(
            BigInt(tokenInfo.dToken.balances) - BigInt(amount)
          );

          appState.smartWalletState.detailTokenInPool.set(
            _tokenAddress,
            tokenInfo
          );
        } else if (BigInt(amount) >= BigInt(debtTokenSmartWalletBalance)) {
          // repay all borrowed token

          // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

          // update availableBorrowUSD :  availableBorrowsUSD + debtTokenBalance * asset.price
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            (BigInt(
              appState.smartWalletState.travaLPState.availableBorrowsUSD
            ) *
              BigInt(10 ** 18) +
              BigInt(debtTokenSmartWalletBalance) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );

          // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed - debtTokenBalance * asset.price)

          appState.smartWalletState.travaLPState.healthFactor =
            String(MAX_UINT256);

          // update totalDebtUSD : borrowed - debtTokenBalance * asset.price
          appState.smartWalletState.travaLPState.totalDebtUSD = String(
            (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 18) -
              BigInt(debtTokenSmartWalletBalance) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );

          // set debt token balance to <= 0
          appState.walletState.tokenBalances.set(
            _tokenAddress,
            String(
              BigInt(appState.walletState.tokenBalances.get(_tokenAddress)!) -
                BigInt(amount)
            )
          );

          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

          tokenInfo.dToken = {
            ...tokenInfo.dToken,
            balances: (
              BigInt(debtTokenSmartWalletBalance) - BigInt(amount)
            ).toString(),
          };

          appState.smartWalletState.detailTokenInPool.set(
            _tokenAddress,
            tokenInfo
          );
        }
      }
    } else if (_from.toLowerCase() == appState.smartWalletState.address) {
      // check tokenAddress is exist on reverseList
      if (
        appState.smartWalletState.tokenBalances.has(_tokenAddress) &&
        appState.smartWalletState.detailTokenInPool.has(_tokenAddress)
      ) {
        if (
          amount.toString() == MAX_UINT256 ||
          BigInt(amount) == BigInt(MAX_UINT256)
        ) {
          amount =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
              .dToken.balances;
        }

        const debtTokenSmartWalletBalance =
          appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!.dToken
            .balances;

        if (BigInt(debtTokenSmartWalletBalance) > BigInt(amount)) {
          // repay piece of borrowed token

          // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

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

          // update availableBorrowUSD :  availableBorrowsUSD + amount * asset.price
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            (BigInt(
              appState.smartWalletState.travaLPState.availableBorrowsUSD
            ) *
              BigInt(10 ** 18) +
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );

          // update totalDebtUSD : borrowed - amount * asset.price
          appState.smartWalletState.travaLPState.totalDebtUSD = String(
            (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 18) -
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );

          // set debt token balance to debtTokenSmartWalletBalance - amount
          appState.smartWalletState.tokenBalances.set(
            _tokenAddress,
            String(
              BigInt(
                appState.smartWalletState.tokenBalances.get(_tokenAddress)!
              ) - BigInt(amount)
            )
          );

          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

          tokenInfo.dToken.balances = String(
            BigInt(tokenInfo.dToken.balances) - BigInt(amount)
          );

          appState.smartWalletState.detailTokenInPool.set(
            _tokenAddress,
            tokenInfo
          );
        } else if (BigInt(amount) >= BigInt(debtTokenSmartWalletBalance)) {
          // repay all borrowed token

          // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

          // update availableBorrowUSD :  availableBorrowsUSD + debtTokenBalance * asset.price
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
            (BigInt(
              appState.smartWalletState.travaLPState.availableBorrowsUSD
            ) *
              BigInt(10 ** 18) +
              BigInt(debtTokenSmartWalletBalance) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );

          // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed - debtTokenBalance * asset.price)

          appState.smartWalletState.travaLPState.healthFactor =
            String(MAX_UINT256);

          // update totalDebtUSD : borrowed - debtTokenBalance * asset.price
          appState.smartWalletState.travaLPState.totalDebtUSD = String(
            (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 18) -
              BigInt(debtTokenSmartWalletBalance) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
          );

          // set debt token balance to <= 0
          appState.smartWalletState.tokenBalances.set(
            _tokenAddress,
            String(
              BigInt(
                appState.smartWalletState.tokenBalances.get(_tokenAddress)!
              ) - BigInt(amount)
            )
          );

          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

          tokenInfo.dToken = {
            ...tokenInfo.dToken,
            balances: (
              BigInt(debtTokenSmartWalletBalance) - BigInt(amount)
            ).toString(),
          };

          appState.smartWalletState.detailTokenInPool.set(
            _tokenAddress,
            tokenInfo
          );
        }
      }
    }

    return appState;
  } catch (err) {
    throw err;
  }
}

// need remove tToken from smart wallet state
export async function SimulationWithdraw(
  appState1: ApplicationState,
  _to: EthAddress,
  _tokenAddress: EthAddress,
  _amount: string
): Promise<ApplicationState> {
  try {
    let amount = _amount;
    const appState = { ...appState1 };
    const oraclePrice = new OraclePrice(
      getAddr("ORACLE_ADDRESS", appState.chainId),
      appState.web3!
    );

    const tokenAddress = convertHexStringToAddress(_tokenAddress);
    _tokenAddress = _tokenAddress.toLowerCase();

    if (_to.toLowerCase() == appState.walletState.address) {
      // check tokenAddress is exist on reverseList
      if (
        appState.smartWalletState.detailTokenInPool.has(_tokenAddress) &&
        appState.smartWalletState.tokenBalances.has(_tokenAddress)
      ) {
        if (
          amount.toString() == MAX_UINT256 ||
          BigInt(amount) == BigInt(MAX_UINT256)
        ) {
          amount =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
              .tToken.balances;
        }

        if (
          BigInt(
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
              .tToken.balances
          ) > BigInt(amount)
        ) {
          console.log("Withdraw piece of supplied token");
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
            appState.smartWalletState.travaLPState.healthFactor = String(
              (appState.smartWalletState.travaLPState.healthFactor = String(
                ((BigInt(
                  appState.smartWalletState.travaLPState.totalCollateralUSD
                ) *
                  BigInt(10 ** 18) -
                  BigInt(amount) *
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
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          }

          // update totalCollateralUSD. deposited - amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
              (BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );

          // update token balances
          appState.walletState.tokenBalances.set(
            _tokenAddress,
            String(
              BigInt(appState.walletState.tokenBalances.get(_tokenAddress)!) +
                BigInt(amount)
            )
          );

          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

          tokenInfo.tToken = {
            ...tokenInfo.tToken,
            balances: String(
              BigInt(tokenInfo.tToken.balances) - BigInt(amount)
            ),
          };

          appState.smartWalletState.detailTokenInPool.set(
            _tokenAddress,
            tokenInfo
          );
        } else if (
          BigInt(amount) >=
          BigInt(
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
              .tToken.balances
          )
        ) {
          console.log("withdraw all supplied token");
          // withdraw all supplied token

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
            appState.smartWalletState.travaLPState.healthFactor = String(
              (appState.smartWalletState.travaLPState.healthFactor = String(
                ((BigInt(
                  appState.smartWalletState.travaLPState.totalCollateralUSD
                ) *
                  BigInt(10 ** 18) -
                  BigInt(amount) *
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
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          }

          // update totalCollateralUSD. deposited - amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
              (BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );

          // set tToken balance to 0
          appState.walletState.tokenBalances.set(
            _tokenAddress,
            String(
              BigInt(appState.walletState.tokenBalances.get(_tokenAddress)!) +
                BigInt(amount)
            )
          );

          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

          tokenInfo.tToken = {
            ...tokenInfo.tToken,
            balances: (
              BigInt(
                appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
                  .tToken.balances
              ) - BigInt(amount)
            ).toString(),
          };

          appState.smartWalletState.detailTokenInPool.set(
            _tokenAddress,
            tokenInfo
          );
        }
      }
    } else if (_to.toLowerCase() == appState.smartWalletState.address) {
      // check tokenAddress is exist on reverseList
      if (
        appState.smartWalletState.detailTokenInPool.has(_tokenAddress) &&
        appState.smartWalletState.tokenBalances.has(_tokenAddress)
      ) {
        if (
          amount.toString() == MAX_UINT256 ||
          BigInt(amount) == BigInt(MAX_UINT256)
        ) {
          amount =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
              .tToken.balances;
        }

        if (
          BigInt(
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
              .tToken.balances
          ) > BigInt(amount)
        ) {
          console.log("Withdraw piece of supplied token");
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
            appState.smartWalletState.travaLPState.healthFactor = String(
              (appState.smartWalletState.travaLPState.healthFactor = String(
                ((BigInt(
                  appState.smartWalletState.travaLPState.totalCollateralUSD
                ) *
                  BigInt(10 ** 18) -
                  BigInt(amount) *
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
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          }

          // update totalCollateralUSD. deposited - amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
              (BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );

          // update token balances
          appState.smartWalletState.tokenBalances.set(
            _tokenAddress,
            String(
              BigInt(
                appState.smartWalletState.tokenBalances.get(_tokenAddress)!
              ) + BigInt(amount)
            )
          );

          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

          tokenInfo.tToken = {
            ...tokenInfo.tToken,
            balances: String(
              BigInt(tokenInfo.tToken.balances) - BigInt(amount)
            ),
          };

          appState.smartWalletState.detailTokenInPool.set(
            _tokenAddress,
            tokenInfo
          );
        } else if (
          BigInt(amount) >=
          BigInt(
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
              .tToken.balances
          )
        ) {
          console.log("withdraw all supplied token");
          // withdraw all supplied token

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
            appState.smartWalletState.travaLPState.healthFactor = String(
              (appState.smartWalletState.travaLPState.healthFactor = String(
                ((BigInt(
                  appState.smartWalletState.travaLPState.totalCollateralUSD
                ) *
                  BigInt(10 ** 18) -
                  BigInt(amount) *
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
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          }

          // update totalCollateralUSD. deposited - amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
              (BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );

          // set tToken balance to 0
          appState.smartWalletState.tokenBalances.set(
            _tokenAddress,
            String(
              BigInt(
                appState.smartWalletState.tokenBalances.get(_tokenAddress)!
              ) + BigInt(amount)
            )
          );

          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

          tokenInfo.tToken = {
            ...tokenInfo.tToken,
            balances: (
              BigInt(
                appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!
                  .tToken.balances
              ) - BigInt(amount)
            ).toString(),
          };

          appState.smartWalletState.detailTokenInPool.set(
            _tokenAddress,
            tokenInfo
          );
        }
      }
    }

    return appState;
  } catch (err) {
    throw err;
  }
}

export async function SimulationClaimReward(
  appState1: ApplicationState,
  amount: string
): Promise<ApplicationState> {
  try {
    const appState = { ...appState1 };

    const incentiveContract = new Contract(
      getAddr("INCENTIVE_CONTRACT", appState.chainId),
      IncentiveContractABI,
      appState.web3!
    );
    const rTravaAddress = String(
      await incentiveContract.REWARD_TOKEN()
    ).toLowerCase();

    const currentReward = appState.smartWalletState.maxRewardCanClaim;
    appState.smartWalletState.maxRewardCanClaim = (
      BigInt(currentReward) - BigInt(amount)
    ).toString();

    const rTravaBalance =
      appState.smartWalletState.tokenBalances.get(rTravaAddress);
    if (rTravaBalance) {
      appState.smartWalletState.tokenBalances.set(
        rTravaAddress,
        (BigInt(rTravaBalance) + BigInt(amount)).toString()
      );
    } else {
      appState.smartWalletState.tokenBalances.set(
        rTravaAddress,
        BigInt(amount).toString()
      );
    }
    return appState;
  } catch (err) {
    throw err;
  }
}

export async function SimulationConvertReward(
  appState1: ApplicationState,
  to: EthAddress,
  amount: string
): Promise<ApplicationState> {
  try {
    const appState = { ...appState1 };

    const incentiveContract = new Contract(
      getAddr("INCENTIVE_CONTRACT", appState.chainId),
      IncentiveContractABI,
      appState.web3!
    );
    const rTravaAddress = (
      await incentiveContract.REWARD_TOKEN()
    ).toLowerCase();

    const rTravaBalance =
      appState.smartWalletState.tokenBalances.get(rTravaAddress);

    if (rTravaBalance) {
      let realAmount = amount;
      if (BigInt(amount) > BigInt(rTravaBalance)) {
        realAmount = rTravaBalance;
      }
      appState.smartWalletState.tokenBalances.set(
        rTravaAddress,
        (BigInt(rTravaBalance) - BigInt(realAmount)).toString()
      );
      const travaAddress = getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId);
      if (to == appState.smartWalletState.address) {
        const travaBalance =
          appState.smartWalletState.tokenBalances.get(travaAddress);
        if (travaBalance) {
          appState.smartWalletState.tokenBalances.set(
            travaAddress,
            (BigInt(travaBalance) + BigInt(amount)).toString()
          );
        } else {
          appState.smartWalletState.tokenBalances.set(
            rTravaAddress,
            BigInt(amount).toString()
          );
        }
      } else if (to == appState.walletState.address) {
        const travaBalance =
          appState.walletState.tokenBalances.get(travaAddress);
        if (travaBalance) {
          appState.walletState.tokenBalances.set(
            travaAddress,
            (BigInt(travaBalance) + BigInt(amount)).toString()
          );
        } else {
          appState.walletState.tokenBalances.set(
            rTravaAddress,
            BigInt(amount).toString()
          );
        }
      }
    } else {
      throw new Error(
        `Token rTrava is not exist in reverseList or smart wallet does not have token rTrava.`
      );
    }
    return appState;
  } catch (err) {
    throw err;
  }
}
