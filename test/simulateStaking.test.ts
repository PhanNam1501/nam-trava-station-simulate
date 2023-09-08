import { JsonRpcProvider } from "ethers";
import { fetchAllAccountVault } from "../src/Simulation/staking/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import { simulateStakeStaking, simulateStakingRedeem } from "../src/Simulation/staking/SimulationStaking";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
async function test(){
    const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com");
    const chainId = 97
    let appState = new ApplicationState( 
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    provider,
    chainId
    )
    const farmTravaAddress = ""
    appState = await fetchAllAccountVault(appState);
    const vault = appState.smartWalletState.travaLPStakingStateList.find(el=>String(el.stakedTokenAddress) == String("0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF"));
    appState = await updateUserTokenBalance(appState,"0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b");
    appState = await updateSmartWalletTokenBalance(appState,"0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF")
    console.log("-----------Before stake--------");
    console.log("Trava Balance of user",appState.walletState.tokenBalances.get(String("0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b").toLowerCase()))
    console.log("Farming Trava of Smart Wallet",appState.smartWalletState.tokenBalances.get(String("0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF").toLowerCase()))
    console.log("Deposited",vault?.deposited)
    appState = await simulateStakeStaking(appState,"0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF","0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    "100000000000000000")
    console.log("-----------After stake--------");
    const vault1 = appState.smartWalletState.travaLPStakingStateList.find(el=>String(el.stakedTokenAddress) == String("0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF"));
    console.log("Trava Balance of user",appState.walletState.tokenBalances.get(String("0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b").toLowerCase()))
    console.log("Farming Trava of Smart Wallet",appState.smartWalletState.tokenBalances.get(String("0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF").toLowerCase()))
    console.log("Deposited",vault1?.deposited)
    appState = await simulateStakingRedeem(appState,"0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF","0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "80000000000000000")
    console.log("-----------After redeem--------");
    const vault2 = appState.smartWalletState.travaLPStakingStateList.find(el=>String(el.stakedTokenAddress) == String("0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF"));
    console.log("Trava Balance of user",appState.walletState.tokenBalances.get(String("0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b").toLowerCase()))
    console.log("Farming Trava of Smart Wallet",appState.smartWalletState.tokenBalances.get(String("0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF").toLowerCase()))
    console.log("Deposited",vault2?.deposited)
}
test()