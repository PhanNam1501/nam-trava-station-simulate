import BigNumber from "bignumber.js";
import { ApplicationState } from "../../State";
import { EthAddress } from "../../utils/types";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic";
import { MAX_UINT256 } from "../../utils";
import { calculateMaxAmountSupply, getBalanceUsdFromAmount, updateLPtTokenInfo } from "../trava";
import _ from "lodash";
import { getMode } from "../../utils/helper";

export async function SimulationSupplyForkCompoundLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        const appState = { ...appState1 };

        _tokenAddress = _tokenAddress.toLowerCase();
        _from = _from.toLowerCase();
        let  modeFrom = getMode(appState, _from);

        if (!appState[modeFrom].tokenBalances.has(_tokenAddress)) {
            await updateUserTokenBalance(appState, _tokenAddress);
        }

        if (
            amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)
        ) {
            amount = calculateMaxAmountSupply(appState, _tokenAddress, modeFrom)

        }
        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(_tokenAddress)!
        );
        const newAmount = tokenAmount.minus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(_tokenAddress, newAmount);
        
        
      return appState;
    } catch (err) {
      throw err;
    }
  }