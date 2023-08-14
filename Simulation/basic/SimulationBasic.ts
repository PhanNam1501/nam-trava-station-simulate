import { ethers } from "hardhat";
import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import dotenv from "dotenv";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "./UpdateStateAccount";
import { CONTRACT_NETWORK } from "../../utils/config";
dotenv.config();

export async function simulateWrap(appState:ApplicationState,amount:number | string) {
    if(!appState.smartWalletState.tokenBalances.has(CONTRACT_NETWORK.bsc.WBNB))
    {
        await updateSmartWalletTokenBalance(appState,CONTRACT_NETWORK.bsc.WBNB)
    }
    if(BigInt(appState.walletState.ethBalances) < BigInt(amount))
    {
        throw new Error("Not enough BNB")
    }
    let newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
    let newWBNBBalance =BigInt(appState.smartWalletState.tokenBalances.get(CONTRACT_NETWORK.bsc.WBNB)!) + BigInt(amount)
    appState.walletState.ethBalances = String(newEthBalance);
    appState.smartWalletState.tokenBalances.set(CONTRACT_NETWORK.bsc.WBNB,String(BigInt(newWBNBBalance)))
}
export async function simulateUnwrap(appState:ApplicationState,amount:number | string){
    if(!appState.walletState.tokenBalances.has(CONTRACT_NETWORK.bsc.WBNB))
    {
        await updateUserTokenBalance(appState,CONTRACT_NETWORK.bsc.WBNB)
    }
    if(BigInt(appState.walletState.tokenBalances.get(CONTRACT_NETWORK.bsc.WBNB)!)<BigInt(amount))
    {
        throw new Error("Not enough WBNB");
    }
    let newWBNBBalance = BigInt(appState.walletState.tokenBalances.get(CONTRACT_NETWORK.bsc.WBNB)!) - BigInt(amount);
    let newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount)
    appState.walletState.tokenBalances.set(CONTRACT_NETWORK.bsc.WBNB,String(newWBNBBalance));
    appState.walletState.ethBalances = String(newBNBBalance);
}
export async function simulateSendToken(appState:ApplicationState,tokenAddress:EthAddress,to:EthAddress,amount:number | string){
    if(!appState.walletState.tokenBalances.has(CONTRACT_NETWORK.bsc.WBNB))
    {
        await updateUserTokenBalance(appState,CONTRACT_NETWORK.bsc.WBNB)
    }
    if(!appState.smartWalletState.tokenBalances.has(CONTRACT_NETWORK.bsc.WBNB))
    {
        await updateSmartWalletTokenBalance(appState,CONTRACT_NETWORK.bsc.WBNB)
    }
    if(BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)!)<BigInt(amount))
    {
        throw new Error("Not enough Balance");
    }
    let newTokenBalance = BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)!) - BigInt(amount);
    appState.smartWalletState.tokenBalances.set(tokenAddress,String(newTokenBalance));
    if(to == appState.walletState.address)
     {
        let newUserTokenBalance = BigInt(appState.walletState.tokenBalances.get(tokenAddress)!) + BigInt(amount);
        appState.walletState.tokenBalances.set(tokenAddress,String(newUserTokenBalance));
     }

}

