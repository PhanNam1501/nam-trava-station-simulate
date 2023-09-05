import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import OraclePrice from "../../utils/oraclePrice";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import BEP20ABI from "../../abis/BEP20.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Contract } from "ethers";
import _ from "lodash";
import { MAX_UINT256 } from "../../utils/config";

export async function SimulationSupply(
  appState1: ApplicationState,
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
    const travaLP = new Contract(
      getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
      ABITravaLP,
      appState.web3!
    );
    const tokenAddress = convertHexStringToAddress(_tokenAddress);
    _tokenAddress = _tokenAddress.toLowerCase();

    let reverseList = await travaLP.getReservesList();
    // check tokenAddress is exist on reverseList
    if (
      reverseList.includes(tokenAddress) &&
      appState.walletState.tokenBalances.has(_tokenAddress)
    ) {
      // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>

      // get tToken address
      const reserveData = await travaLP.getReserveData(tokenAddress);
      const tToken = String(reserveData[6]).toLowerCase();

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
      if (BigInt(tokenAmount) >= BigInt(amount)) {
        // update appState amount tokenName
        const newAmount = String(tokenAmount - BigInt(amount));
        appState.walletState.tokenBalances.set(_tokenAddress, newAmount);

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
      // else {
      //   throw new Error(`Amount ${tokenAddress} on appState is not enough.`);
      // }

      // add tToken to smart wallet state if not exist
      if (!appState.smartWalletState.tokenBalances.has(tToken)) {
        appState.smartWalletState.tokenBalances.set(tToken, String(amount));
        console.log(
          "added tToken to smart wallet state",
          appState.smartWalletState.tokenBalances.get(tToken)
        );
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
      return appState;
    } else {
      throw new Error(`Account or LP does not have ${tokenAddress} token.`);
    }
  } catch (err) {
    throw err;
  }
}

// need add debt token to smart wallet state
export async function SimulationBorrow(
  appState1: ApplicationState,
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

    // check tokenAddress is exist on reverseList
    if (
      appState.smartWalletState.tokenBalances.has(_tokenAddress) &&
      appState.smartWalletState.detailTokenInPool.has(_tokenAddress)
    ) {
      // get tToken address

      // get token price
      const tokenPrice = BigInt(await oraclePrice.getAssetPrice(tokenAddress));

      let borrowUSD;

      if (
        amount.toString() == MAX_UINT256 ||
        BigInt(amount) == BigInt(MAX_UINT256)
      ) {
        borrowUSD = BigInt(
          appState.smartWalletState.travaLPState.availableBorrowsUSD
        );
        amount = (
          (borrowUSD * BigInt(10 ** 18)) /
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
          ((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
            BigInt(appState.smartWalletState.travaLPState.ltv) -
            BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
              BigInt(10 ** 4)) *
            BigInt(10 ** 14) -
            borrowUSD * BigInt(10 ** 18)) /
            BigInt(10 ** 18)
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
              borrowUSD * BigInt(10 ** 18))
        );

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
          BigInt(appState.smartWalletState.tokenBalances.get(_tokenAddress)!) +
            BigInt(amount)
        )
      );

      let tokenInfo =
        appState.smartWalletState.detailTokenInPool.get(_tokenAddress);

      tokenInfo.dToken = {
        ...tokenInfo.dToken,
        balances: String(BigInt(tokenInfo.dToken.balances) + BigInt(amount)),
      };

      appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);

      return appState;
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
  appState1: ApplicationState,
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
          appState.smartWalletState.detailTokenInPool.get(_tokenAddress).dToken
            .balances;
      }

      const debtTokenSmartWalletBalance =
        appState.smartWalletState.detailTokenInPool.get(_tokenAddress).dToken
          .balances;

      if (debtTokenSmartWalletBalance == "0") {
        throw new Error(`Smart wallet does not borrow ${tokenAddress} token.`);
      } else {
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
          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress);

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

          // set debt token balance to 0
          appState.smartWalletState.tokenBalances.set(
            _tokenAddress,
            String(
              BigInt(
                appState.smartWalletState.tokenBalances.get(_tokenAddress)!
              ) - BigInt(amount)
            )
          );

          let tokenInfo =
            appState.smartWalletState.detailTokenInPool.get(_tokenAddress);

          tokenInfo.dToken.balances = "0";

          appState.smartWalletState.detailTokenInPool.set(
            _tokenAddress,
            tokenInfo
          );
        }
      }
      return appState;
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
  appState1: ApplicationState,
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
    const travaLP = new Contract(
      getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
      ABITravaLP,
      appState.web3!
    );
    const tokenAddress = convertHexStringToAddress(_tokenAddress);
    _tokenAddress = _tokenAddress.toLowerCase();
    let reverseList = await travaLP.getReservesList();
    // check tokenAddress is exist on reverseList
    if (
      1
      // reverseList.includes(tokenAddress) &&
      // appState.smartWalletState.tokenBalances.has(_tokenAddress)
    ) {
      // get reserve data
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const tTokenAddress = String(reserveData[6]).toLowerCase();
      // const variableDebtTokenAddress = reserveData[7];

      // check balance tToken on smart wallet
      const tTokenContract = new Contract(
        reserveData[6],
        BEP20ABI,
        appState.web3
      );
      const tTokenWalletBalance = await tTokenContract.balanceOf(
        appState.walletState.address
      );
      const tTokenSmartWalletBalance = await tTokenContract.balanceOf(
        appState.smartWalletState.address
      );

      let tTokenBalanceOfSmartWallet = String(
        appState.smartWalletState.tokenBalances.get(tTokenAddress)!
      );

      if (tTokenBalanceOfSmartWallet == "undefined") {
        appState.smartWalletState.tokenBalances.set(
          tTokenAddress,
          tTokenSmartWalletBalance
        );
        appState.walletState.tokenBalances.set(
          tTokenAddress,
          tTokenWalletBalance
        );
        tTokenBalanceOfSmartWallet = tTokenSmartWalletBalance;
      }

      if (
        amount.toString() == MAX_UINT256 ||
        BigInt(amount) == BigInt(MAX_UINT256)
      ) {
        amount = tTokenBalanceOfSmartWallet;
      }
      if (tTokenBalanceOfSmartWallet == "0") {
        throw new Error(`Smart wallet does not supply ${tokenAddress} token.`);
      } else {
        if (BigInt(tTokenBalanceOfSmartWallet) > BigInt(amount)) {
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
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          }

          // update totalCollateralUSD. deposited - amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
              (BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );

          // set tToken balance to tTokenBalanceOfSmartWallet - amount
          appState.smartWalletState.tokenBalances.set(
            tTokenAddress,
            String(BigInt(tTokenBalanceOfSmartWallet) - BigInt(amount))
          );
        } else if (BigInt(amount) >= BigInt(tTokenBalanceOfSmartWallet)) {
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
            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
          }

          // update totalCollateralUSD. deposited - amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
              (BigInt(tTokenBalanceOfSmartWallet) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
                BigInt(10 ** 18)
          );
          // set tToken balance to 0
          appState.smartWalletState.tokenBalances.set(tTokenAddress, "0");
        }
      }
      return appState;
    } else {
      throw new Error(
        `Token ${tokenAddress} is not exist in reverseList or smart wallet does not have ${tokenAddress} token.`
      );
    }
  } catch (err) {
    throw err;
  }
}
