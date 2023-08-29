import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { updateUserTokenBalance } from "../basic/UpdateStateAccount";
import _ from "lodash";
import { MAX_UINT256 } from "../../utils/config";

export async function simulateSwap(
    appState1: ApplicationState,
    _fromToken: EthAddress,
    _toToken: EthAddress,
    _fromAmount: EthAddress,
    _toAmount: EthAddress
): Promise<ApplicationState> {
    let fromAmount = _fromAmount;
    let toAmount = _toAmount;

    const appState = {...appState1};
    _fromToken = _fromToken.toLowerCase();
    _toToken = _toToken.toLowerCase();
    if (!appState.walletState.tokenBalances.has(_fromToken)) {
        await updateUserTokenBalance(appState, _fromToken)
    }
    if (!appState.walletState.tokenBalances.has(_toToken)) {
        await updateUserTokenBalance(appState, _toToken)
    }
    // if (BigInt(appState.walletState.tokenBalances.get(fromToken)!) < BigInt(fromAmount)) {
    //     throw new Error("Insufficient balance")
    // }

    if(fromAmount.toString() == MAX_UINT256 || BigInt(fromAmount) == BigInt(MAX_UINT256)) {
        fromAmount = appState.walletState.tokenBalances.get(_fromToken)!;
    }
    
    let newFromBalance = BigInt(appState.walletState.tokenBalances.get(_fromToken)!) - BigInt(fromAmount)
    let newToBalance = BigInt(appState.walletState.tokenBalances.get(_toToken)!) + BigInt(toAmount)

    appState.walletState.tokenBalances.set(_fromToken, String(BigInt(newFromBalance)))
    appState.walletState.tokenBalances.set(_toToken, String(BigInt(newToBalance)))
    return appState;
}