import { JsonRpcProvider } from "ethers";
import { updateAllAccountVault } from "../src/Simulation/staking/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import { simulateStakeStaking, simulateStakingRedeem } from "../src/Simulation/staking/SimulationStaking";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
async function test(){
    const provider = new JsonRpcProvider("https://bsc.publicnode.com");
    const chainId = Number((await provider.getNetwork()).chainId)
    const userAddress = "0x871DBcE2b9923A35716e7E83ee402B535298538E";
    const proxyAddress = "0x124aa737A67CE0345Ab54ed32d23A8D453788890";
    let stakingPool = "0x17b173D4B80B0B5BB7E0f1E99F5962f2D51799Eb"
    let underLyingToken = "0x170772A06aFfC0d375cE90Ef59C8eC04c7ebF5D2"
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