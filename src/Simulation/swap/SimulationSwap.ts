import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import _ from "lodash";
import { MAX_UINT256 } from "../../utils/config";
import { getMode, isWallet } from "../../utils/helper";
import BigNumber from "bignumber.js";
import { getAddr } from "../../utils";

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

    let modeFrom = getMode(appState, _fromAddress);
    let currentBalance = appState[modeFrom].tokenBalances.get(fromToken)!;

    if(fromAmount.toString() == MAX_UINT256 || BigInt(fromAmount) == BigInt(MAX_UINT256)) {
        fromAmount = currentBalance;
    }
    
    let newBalance = BigNumber(currentBalance).minus(fromAmount).toFixed(0);
    appState[modeFrom].tokenBalances.set(fromToken, newBalance)
    if(fromToken.toLowerCase() == getAddr("BNB_ADDRESS", appState.chainId).toLowerCase()) {
        appState[modeFrom].ethBalances = newBalance;
    }
    // if(_fromAddress.toLowerCase() == appState.walletState.address.toLowerCase())
    // {
    //     _fromAddress = appState.walletState.address;
    //     let newFromBalance = BigInt(appState.walletState.tokenBalances.get(fromToken)!) - BigInt(fromAmount)
    //     appState.walletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)))
    // }
    // else if (_fromAddress.toLowerCase() == appState.smartWalletState.address.toLowerCase())
    // {
    //     _fromAddress = appState.smartWalletState.address;
    //     let newFromBalance = BigInt(appState.smartWalletState.tokenBalances.get(fromToken)!) - BigInt(fromAmount)
    //     appState.smartWalletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)))
    // }

    if(isWallet(appState, _toAddress)) {
        let modeTo = getMode(appState, _toAddress);
        let newBalance = BigNumber(appState[modeTo].tokenBalances.get(toToken)!).plus(toAmount).toFixed(0);
        appState[modeTo].tokenBalances.set(toToken, newBalance);
    }
    // if(_toAddress.toLowerCase() == appState.walletState.address.toLowerCase())
    // {
    //     _toAddress = appState.walletState.address;
    //     let newToBalance = BigInt(appState.walletState.tokenBalances.get(toToken)!) + BigInt(toAmount)
    //     appState.walletState.tokenBalances.set(toToken, String(BigInt(newToBalance)))
    // }
    // else if (_toAddress.toLowerCase() == appState.smartWalletState.address.toLowerCase())
    // {
    //     _toAddress = appState.smartWalletState.address;
    //     let newToBalance = BigInt(appState.smartWalletState.tokenBalances.get(toToken)!) + BigInt(toAmount)
    //     appState.smartWalletState.tokenBalances.set(toToken, String(BigInt(newToBalance)))
    // }

    return appState;
}