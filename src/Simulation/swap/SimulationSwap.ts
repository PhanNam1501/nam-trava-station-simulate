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
    let fromToken = _fromToken.toLowerCase();
    let toToken = _toToken.toLowerCase();
    
    let appState = {...appState1};
    if (!appState.walletState.tokenBalances.has(fromToken)) {
        appState = await updateUserTokenBalance(appState, fromToken)
        appState = await updateSmartWalletTokenBalance(appState,fromToken)
    }
    if (!appState.walletState.tokenBalances.has(toToken)) {
        appState = await updateUserTokenBalance(appState, toToken)
        appState = await updateSmartWalletTokenBalance(appState,toToken)
    }

    if(fromAmount.toString() == MAX_UINT256 || BigInt(fromAmount) == BigInt(MAX_UINT256)) {
        if(_fromAddress.toLowerCase() == appState.walletState.address.toLowerCase())
        {
            fromAmount = appState.walletState.tokenBalances.get(fromToken)!;
        }
        else if (_fromAddress.toLowerCase() == appState.smartWalletState.address.toLowerCase())
        {
            fromAmount = appState.smartWalletState.tokenBalances.get(fromToken)!;
        }
    }
    
    if(_fromAddress.toLowerCase() == appState.walletState.address.toLowerCase())
    {
        _fromAddress = appState.walletState.address;
        let newFromBalance = BigInt(appState.walletState.tokenBalances.get(fromToken)!) - BigInt(fromAmount)
        appState.walletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)))
    }
    else if (_fromAddress.toLowerCase() == appState.smartWalletState.address.toLowerCase())
    {
        _fromAddress = appState.smartWalletState.address;
        let newFromBalance = BigInt(appState.smartWalletState.tokenBalances.get(fromToken)!) - BigInt(fromAmount)
        appState.smartWalletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)))
    }

    if(_toAddress.toLowerCase() == appState.walletState.address.toLowerCase())
    {
        _toAddress = appState.walletState.address;
        let newToBalance = BigInt(appState.walletState.tokenBalances.get(toToken)!) + BigInt(toAmount)
        appState.walletState.tokenBalances.set(toToken, String(BigInt(newToBalance)))
    }
    else if (_toAddress.toLowerCase() == appState.smartWalletState.address.toLowerCase())
    {
        _toAddress = appState.smartWalletState.address;
        let newToBalance = BigInt(appState.smartWalletState.tokenBalances.get(toToken)!) + BigInt(toAmount)
        appState.smartWalletState.tokenBalances.set(toToken, String(BigInt(newToBalance)))
    }

    return appState;
}