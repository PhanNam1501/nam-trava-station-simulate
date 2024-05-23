import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import _ from "lodash";
import { MAX_UINT256 } from "../../utils/config";
import { getMode, isWallet } from "../../utils/helper";
import BigNumber from "bignumber.js";
import { getAddr } from "../../utils";

export async function simulateAddliquidity(
    appState1: ApplicationState,
    _token0: EthAddress,
    _token1: EthAddress,
    _token0Amount: EthAddress,
    _token1Amount: EthAddress,
): Promise<ApplicationState> {
    let token0Amount = _token0Amount;
    let token1Amount = _token1Amount;
    let token0 = _token0.toLowerCase();
    let token1 = _token1.toLowerCase();
    
    let appState = {...appState1};
    if (!appState.walletState.tokenBalances.has(token0)) {
        appState = await updateUserTokenBalance(appState, token0)
        appState = await updateSmartWalletTokenBalance(appState,token0)
    }
    if (!appState.walletState.tokenBalances.has(token1)) {
        appState = await updateUserTokenBalance(appState, token1)
        appState = await updateSmartWalletTokenBalance(appState,token1)
    }


    return appState;
}