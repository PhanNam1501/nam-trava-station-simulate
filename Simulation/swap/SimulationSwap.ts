import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import dotenv from "dotenv";
import { updateUserTokenBalance } from "../basic/UpdateStateAccount";
dotenv.config();
export async function simulateSwap(
    appState :ApplicationState,
    fromToken :EthAddress,
    toToken :EthAddress ,
    fromAmount :EthAddress,
    toAmount : EthAddress 
    )
    {
    if(!appState.walletState.tokenBalances.has(fromToken))
    {
        await updateUserTokenBalance(appState,fromToken)
    }
    if(!appState.walletState.tokenBalances.has(toToken))
    {
        await updateUserTokenBalance(appState,toToken)
    }
    if(BigInt(appState.walletState.tokenBalances.get(fromToken)!) < BigInt(fromAmount))
    {
        throw new Error("Insufficient balance")
    }
    let newFromBalance = BigInt(appState.walletState.tokenBalances.get(fromToken)!) - BigInt(fromAmount)
    let newToBalance = BigInt(appState.walletState.tokenBalances.get(toToken)!) + BigInt(toAmount)

    appState.walletState.tokenBalances.set(fromToken,String(BigInt(newFromBalance)))
    appState.walletState.tokenBalances.set(toToken,String(BigInt(newToBalance)))
    }