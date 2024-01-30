import { JsonRpcProvider, ethers } from "ethers";
import { updateAllAccountVault } from "../src/Simulation/trava/staking/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import {
    simulateStakeStaking,
    simulateStakingRedeem,
    simulateTransfer
} from "../src/Simulation/trava/staking/SimulationStaking";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
import { listStakingVault } from "../src/utils/stakingVaultConfig";
import BigNumber from "bignumber.js";
import {Contract} from "ethers/lib.esm";
import {getAddr} from "../src";
import OracleABI from "../src/abis/AaveOracle.json";
import BEP20ABI from "../src/abis/BEP20.json";
async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc.publicnode.com");
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
    appState = await updateAllAccountVault(appState,proxyAddress);
    const vault = appState.smartWalletState.travaLPStakingStateList.get(stakingPool.toLowerCase())!;
    appState = await updateUserTokenBalance(appState,underLyingToken);
    appState = await updateSmartWalletTokenBalance(appState,underLyingToken)
    console.log("-----------Before stake--------");
    console.log("Trava Balance of user",appState.walletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    const st=Number(appState.walletState.tokenBalances.get(String(underLyingToken).toLowerCase()));
    console.log("Farming Trava of Smart Wallet",appState.smartWalletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    console.log("vault", vault)
    appState = await simulateTransfer(appState,stakingPool,proxyAddress,userAddress,
        "100000000000000000");

    console.log("-----------After stake--------");
    const vault1 =  appState.smartWalletState.travaLPStakingStateList.get(stakingPool.toLowerCase())!;
    console.log("Trava Balance of user",appState.walletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    const newst=Number(appState.walletState.tokenBalances.get(String(underLyingToken).toLowerCase()))
    console.log(st-newst);
    console.log("Farming Trava of Smart Wallet",appState.smartWalletState.tokenBalances.get(String(underLyingToken).toLowerCase()))

    console.log("Deposited",vault1.deposited)


}
test()