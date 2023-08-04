import { ethers } from "hardhat";
import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";

import { getAddressToName } from "../../utils/TravaBorrowRatio";
import dotenv from "dotenv";
dotenv.config();

export async function SimulationSupply(
  appState: ApplicationState,
  tokenAddress: EthAddress,
  amount: number
) {
  try {
    const tokenName = await getAddressToName(tokenAddress);
    // check amount tokenName on appState
    for (let i = 0; i < appState.walletState.tokenBalances.length; i++) {
      // check tokenName is exist on appState. tokenBalances is Array<Map<string, string>>
      if (appState.walletState.tokenBalances[i].has(tokenName)) {
        // check amount tokenName on appState is enough .Before check convert string to number
        if (
          Number(appState.walletState.tokenBalances[i].get(tokenName)) >= amount
        ) {
          // update appState amount tokenName
          appState.walletState.tokenBalances[i].set(
            tokenName,
            String(
              Number(appState.walletState.tokenBalances[i].get(tokenName)) -
                amount
            )
          );

          // update state trava lp
          // this is demo, may be not correct
          appState.walletState.travaLPState.totalCollateralUSD = String(
            Number(appState.walletState.travaLPState.totalCollateralUSD) +
              amount
          );
          // need update some state . Still thinking ...
        } else {
          throw new Error(`Amount ${tokenName} on appState is not enough.`);
        }
      } else {
        throw new Error(`Cannot find tokenName: ${tokenName} on appState.`);
      }
    }
  } catch (err) {
    throw err;
  }
}
