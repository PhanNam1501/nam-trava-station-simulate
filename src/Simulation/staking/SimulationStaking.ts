import { Contract } from "ethers";
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import StakeTokenAbi from "../../abis/StakedToken.json"
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import { MAX_UINT256 } from "../../utils/config";
export async function simulateStakeStaking(appState1:ApplicationState,stakingPool:EthAddress,onBehalfOf:EthAddress,amount:number|string)
{
    let appState = {...appState1};
    const vault = appState.smartWalletState.travaLPStakingStateList.find(el=>String(el.stakedTokenAddress) == String(stakingPool));
    let underlyingToken = ""
    let realAmount= amount
    let rewardAddress = stakingPool
    if(vault)
    {
        underlyingToken = vault.underlyingAddress;
        
        if(!appState.walletState.tokenBalances.has(underlyingToken.toLowerCase()))
        {
            appState = await updateUserTokenBalance(appState,underlyingToken);
            appState = await updateSmartWalletTokenBalance(appState,underlyingToken);
        }
        if(!appState.walletState.tokenBalances.has(rewardAddress.toLowerCase()))
        {
            appState = await updateUserTokenBalance(appState,rewardAddress);
            appState = await updateSmartWalletTokenBalance(appState,rewardAddress);
        }
        if(amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256) || BigInt(amount) > BigInt(appState.walletState.tokenBalances.get(underlyingToken.toLowerCase())!)) {
            realAmount = appState.walletState.tokenBalances.get(underlyingToken.toLowerCase())!;
        }
        const newUnderLyingBalance = String(BigInt(appState.walletState.tokenBalances.get(underlyingToken.toLowerCase())!) - BigInt(realAmount))
        const newRewardBalance = String(BigInt(appState.smartWalletState.tokenBalances.get(rewardAddress.toLowerCase())!) + BigInt(realAmount))
        appState.smartWalletState.travaLPStakingStateList.forEach((el)=>{
          if(String(el.stakedTokenAddress) == String(stakingPool))
            el.deposited = String(BigInt(el.deposited)+BigInt(realAmount))
        })
        appState.walletState.tokenBalances.set(underlyingToken.toLowerCase(),newUnderLyingBalance);
        appState.smartWalletState.tokenBalances.set(rewardAddress.toLowerCase(),newRewardBalance);
    }
    return appState;
    

}
export async function simulateStakingRedeem(appState1:ApplicationState,stakingPool:EthAddress,to:EthAddress,amount:number|string){
    let appState = {...appState1};
    const vault = appState.smartWalletState.travaLPStakingStateList.find(el=>String(el.stakedTokenAddress) == String(stakingPool));
    let underlyingToken = ""
    let realAmount= amount
    let rewardAddress = stakingPool;
    if(vault)
    {
        underlyingToken = vault.underlyingAddress;
        if(!appState.walletState.tokenBalances.has(underlyingToken.toLowerCase()))
        {
            appState = await updateUserTokenBalance(appState,underlyingToken);
            appState = await updateSmartWalletTokenBalance(appState,underlyingToken);
        }
        if(!appState.walletState.tokenBalances.has(rewardAddress.toLowerCase()))
        {
            appState = await updateUserTokenBalance(appState,rewardAddress);
            appState = await updateSmartWalletTokenBalance(appState,rewardAddress);
        }
        if(amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256) || BigInt(amount) > BigInt(vault.deposited)) {
            realAmount = vault.deposited;
        }
        const newUnderLyingBalance = String(BigInt(appState.walletState.tokenBalances.get(underlyingToken.toLowerCase())!) + BigInt(realAmount))
        const newRewardBalance = String(BigInt(appState.smartWalletState.tokenBalances.get(rewardAddress.toLowerCase())!) - BigInt(realAmount))
        appState.smartWalletState.travaLPStakingStateList.forEach((el)=>{
          if(String(el.stakedTokenAddress) == String(stakingPool))
            el.deposited = String(BigInt(el.deposited)-BigInt(realAmount))
        })
        if(to == appState.walletState.address)
        appState.walletState.tokenBalances.set(underlyingToken.toLowerCase(),newUnderLyingBalance);
        appState.smartWalletState.tokenBalances.set(rewardAddress.toLowerCase(),newRewardBalance);
    }
    return appState;

}
export async function simulateStakingClaimRewards(appState1:ApplicationState,stakingPool:EthAddress,to:EthAddress,amount:number|string){
    /// ???
}