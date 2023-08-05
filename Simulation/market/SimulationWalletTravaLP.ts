import { ethers } from "hardhat";
import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import OraclePrice from "../../utils/oraclePrice";
import { getAddressToName, getTravaTVL } from "../../utils/TravaBorrowRatio";
import dotenv from "dotenv";
dotenv.config();

async function checkTokenInAppState(
  appState: ApplicationState,
  tokenAddress: EthAddress
) {
  try {
    // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
    if (appState.walletState.tokenBalances.length > 0) {
      // check tokenAddress is exist on appState.walletState.tokenBalances
      for (let i = 0; i < appState.walletState.tokenBalances.length; i++) {
        // console.log(appState.walletState.tokenBalances[i].has(tokenAddress));
        if (appState.walletState.tokenBalances[i].has(tokenAddress)) {
          return true;
        }
      }
    }
    return false;
  } catch (err) {
    throw err;
  }
}

export async function SimulationSupply(
  appState: ApplicationState,
  tokenAddress: EthAddress,
  amount: number
) {
  try {
    // get tokenName from tokenAddress
    const tokenName = await getAddressToName(tokenAddress);
    const tokenTVL = await getTravaTVL(tokenName);
    const oraclePrice = new OraclePrice(process.env.ORACLE_ADDRESS!);
    const checker = await checkTokenInAppState(appState, tokenAddress);

    // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
    if (checker) {
      // get token amount
      const tokenAmount = BigInt(
        await appState.walletState.getTokenAmount(tokenAddress)
      );
      const tokenMap = await appState.walletState.getTokenBalances(
        tokenAddress
      );
      // console.log(tokenMap);

      // check amount tokenName on appState is enough .Before check convert string to number
      if (tokenAmount >= amount) {
        // update appState amount tokenName
        const newAmount = String(tokenAmount - BigInt(amount));
        tokenMap.set(tokenAddress, newAmount);

        // update state of smart wallet trava lp

        // update availableBorrowUSD . (deposited + amount * asset.price) * ltv - borrowed
        // need check again
        appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
          ((BigInt(amount) *
            BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
            BigInt(10 ** 18) +
            BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD)) *
            BigInt(appState.smartWalletState.travaLPState.ltv) -
            BigInt(appState.smartWalletState.travaLPState.totalDebtUSD)
        );

        // update healthFactor .((deposited + amount * asset.price) * currentLiquidationThreshold) / borrowed
        // need check again
        if (Number(appState.smartWalletState.travaLPState.totalDebtUSD) == 0) {
          appState.smartWalletState.travaLPState.healthFactor = String(
            (BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) +
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress)) *
                BigInt(
                  appState.smartWalletState.travaLPState
                    .currentLiquidationThreshold
                )) /
              BigInt(1)
          );
        } else {
          appState.smartWalletState.travaLPState.healthFactor = String(
            (BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) +
              BigInt(amount) *
                BigInt(await oraclePrice.getAssetPrice(tokenAddress)) *
                BigInt(
                  appState.smartWalletState.travaLPState
                    .currentLiquidationThreshold
                )) /
              BigInt(appState.smartWalletState.travaLPState.totalDebtUSD)
          );
        }

        // update totalCollateralUSD. deposited + amount * asset.price
        // need check again
        appState.smartWalletState.travaLPState.totalCollateralUSD = String(
          BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) +
            (BigInt(amount) *
              BigInt(await oraclePrice.getAssetPrice(tokenAddress))) /
              BigInt(10 ** 18)
        );
      } else {
        throw new Error(`Amount ${tokenAddress} on appState is not enough.`);
      }
    } else {
      throw new Error(`Account or LP does not have ${tokenAddress} token.`);
    }

    // console.log(tokenBalancesKeyArray);
    // check tokenAddress is exist on appState
    // if (tokenBalancesKeyArray.includes(tokenAddress)) {
    //   // check amount tokenName on appState is enough .Before check convert string to number
    //   // if (
    //   //   Number(appState.walletState.tokenBalances[i].get(tokenAddress)) >=
    //   //   amount
    //   // ) {
    //   //   // update appState amount tokenName
    //   //   appState.walletState.tokenBalances[i].set(
    //   //     tokenAddress,
    //   //     String(
    //   //       Number(appState.walletState.tokenBalances[i].get(tokenAddress)) -
    //   //         amount
    //   //     )
    //   //   );
    //   //   // update state of smart wallet trava lp
    //   //   // this is demo, may be not correct
    //   //   appState.smartWalletState.travaLPState.totalCollateralUSD = String(
    //   //     Number(appState.smartWalletState.travaLPState.totalCollateralUSD) +
    //   //       amount * (await oraclePrice.getAssetPrice(tokenAddress))
    //   //   );
    //   //   // update availableBorrowUSD . deposited * ltv - borrowed - amount * asset.price
    //   //   // need check again
    //   //   appState.smartWalletState.travaLPState.availableBorrowsUSD = String(
    //   //     Number(appState.smartWalletState.travaLPState.totalCollateralUSD) *
    //   //       Number(appState.smartWalletState.travaLPState.ltv) -
    //   //       Number(appState.smartWalletState.travaLPState.totalDebtUSD) -
    //   //       amount * (await oraclePrice.getAssetPrice(tokenAddress))
    //   //   );
    //   //   // update healthFactor . (deposited * currentLiquidationThreshold) / (borrowed + amount * asset.price)
    //   //   // need check again
    //   //   appState.smartWalletState.travaLPState.healthFactor = String(
    //   //     (Number(appState.smartWalletState.travaLPState.totalCollateralUSD) *
    //   //       Number(tokenTVL)) /
    //   //       (Number(appState.smartWalletState.travaLPState.totalDebtUSD) +
    //   //         amount * (await oraclePrice.getAssetPrice(tokenAddress)))
    //   //   );
    //   // } else {
    //   //   throw new Error(`Amount ${tokenAddress} on appState is not enough.`);
    //   // }
    // } else {
    //   throw new Error(`Cannot find tokenName: ${tokenAddress} on appState.`);
    // }
  } catch (err) {
    throw err;
  }
}
