import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import _ from "lodash";
import { MAX_UINT256 } from "../../utils/config";

export async function simulateSwap(
    appState1: ApplicationState,
    _fromToken: EthAddress,
    _toToken: EthAddress,
    _fromAmount: EthAddress,
    _toAmount: EthAddress,
    _fromAddress :EthAddress,
    _toAddress: EthAddress
): Promise<ApplicationState> {
    let fromAmount = _fromAmount;
    let toAmount = _toAmount;
    
    let appState = {...appState1};
    _fromToken = _fromToken.toLowerCase();
    _toToken = _toToken.toLowerCase();
    if (!appState.walletState.tokenBalances.has(_fromToken)) {
        appState = await updateUserTokenBalance(appState, _fromToken)
        appState = await updateSmartWalletTokenBalance(appState,_fromToken)
    }
    if (!appState.walletState.tokenBalances.has(_toToken)) {
        appState = await updateUserTokenBalance(appState, _toToken)
        appState = await updateSmartWalletTokenBalance(appState,_toToken)
    }
    if(fromAmount.toString() == MAX_UINT256 || BigInt(fromAmount) == BigInt(MAX_UINT256)) {
        if(_fromAddress == appState.walletState.address)
        {
            fromAmount = appState.walletState.tokenBalances.get(_fromToken)!;
        }
        else if (_fromAddress == appState.smartWalletState.address)
        {
            fromAmount = appState.smartWalletState.tokenBalances.get(_fromToken)!;
        }
    }
    if(_fromAddress == appState.walletState.address)
    {
        let newFromBalance = BigInt(appState.walletState.tokenBalances.get(_fromToken)!) - BigInt(fromAmount)
        appState.walletState.tokenBalances.set(_fromToken, String(BigInt(newFromBalance)))
    }
    else if (_fromAddress == appState.smartWalletState.address)
    {
        let newFromBalance = BigInt(appState.smartWalletState.tokenBalances.get(_fromToken)!) - BigInt(fromAmount)
        appState.smartWalletState.tokenBalances.set(_fromToken, String(BigInt(newFromBalance)))
    }
    if(_toAddress == appState.walletState.address)
    {
        let newToBalance = BigInt(appState.walletState.tokenBalances.get(_toToken)!) + BigInt(toAmount)
        appState.walletState.tokenBalances.set(_toToken, String(BigInt(newToBalance)))
    }
    else if (_toAddress == appState.smartWalletState.address)
    {
        let newToBalance = BigInt(appState.smartWalletState.tokenBalances.get(_toToken)!) + BigInt(toAmount)
        appState.smartWalletState.tokenBalances.set(_toToken, String(BigInt(newToBalance)))
    }

    return appState;
}