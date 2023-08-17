import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { updateUserTokenBalance } from "../basic/UpdateStateAccount";
import _ from "lodash";

export async function simulateSwap(
    appState1: ApplicationState,
    fromToken: EthAddress,
    toToken: EthAddress,
    fromAmount: EthAddress,
    toAmount: EthAddress
): Promise<ApplicationState> {
    const appState = _.cloneDeep(appState1);

    if (!appState.walletState.tokenBalances.has(fromToken)) {
        await updateUserTokenBalance(appState, fromToken)
    }
    if (!appState.walletState.tokenBalances.has(toToken)) {
        await updateUserTokenBalance(appState, toToken)
    }
    if (BigInt(appState.walletState.tokenBalances.get(fromToken)!) < BigInt(fromAmount)) {
        throw new Error("Insufficient balance")
    }
    let newFromBalance = BigInt(appState.walletState.tokenBalances.get(fromToken)!) - BigInt(fromAmount)
    let newToBalance = BigInt(appState.walletState.tokenBalances.get(toToken)!) + BigInt(toAmount)

    appState.walletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)))
    appState.walletState.tokenBalances.set(toToken, String(BigInt(newToBalance)))
    return appState;
}