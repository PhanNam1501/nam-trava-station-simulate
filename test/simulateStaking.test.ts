import { JsonRpcProvider, ethers } from "ethers";
import { updateAllAccountVault } from "../src/Simulation/staking/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import { simulateStakeStaking, simulateStakingRedeem } from "../src/Simulation/staking/SimulationStaking";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
import { listStakingVault } from "../src/utils/stakingVaultConfig";
import BigNumber from "bignumber.js";
async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new ethers.providers.JsonRpcProvider("https://bsc.publicnode.com");
    const chainId = Number((await provider.getNetwork()).chainId)
    const userAddress = "0x871DBcE2b9923A35716e7E83ee402B535298538E";
    const proxyAddress = "0x124aa737A67CE0345Ab54ed32d23A8D453788890";
    let listVaults = listStakingVault[chainId];
    let index = 0;

    let stakingPool = listVaults[index].stakedTokenAddress
    let underLyingToken = listVaults[index].underlyingAddress

    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    const farmTravaAddress = ""
    appState = await updateAllAccountVault(appState);
    const vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool.toLowerCase())!;
    appState = await updateUserTokenBalance(appState,underLyingToken);
    appState = await updateSmartWalletTokenBalance(appState,underLyingToken)
    console.log("-----------Before stake--------");
    console.log("Trava Balance of user",appState.walletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    console.log("Farming Trava of Smart Wallet",appState.smartWalletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    console.log("vault", vault)
    appState = await simulateStakeStaking(appState,stakingPool,proxyAddress,
    "100000000000000000")
    console.log("-----------After stake--------");
    const vault1 =  appState.smartWalletState.travaLPStakingStateList.get(stakingPool.toLowerCase())!;
    console.log("Trava Balance of user",appState.walletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    console.log("Farming Trava of Smart Wallet",appState.smartWalletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    console.log("Deposited",vault1.deposited)
    appState = await simulateStakingRedeem(appState,stakingPool,userAddress,
    "80000000000000000")
    console.log("-----------After redeem--------");
    const vault2 =  appState.smartWalletState.travaLPStakingStateList.get(stakingPool.toLowerCase())!;
    console.log("Trava Balance of user",appState.walletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    console.log("Farming Trava of Smart Wallet",appState.smartWalletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    console.log("Deposited",vault2.deposited)
}
test()