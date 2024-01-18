import { Contract, JsonRpcProvider, ethers } from "ethers";
import { updateTravaGovernanceState, updateUserLockBalance } from "../src/Simulation/trava/governance/UpdateStateAccount";
import { simulateTravaGovernanceCreateLock } from "../src/Simulation/trava/governance/SimulationGovernance";
import { ApplicationState } from "../src/State/ApplicationState";
import { getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { MONTH_TO_SECONDS, WEEK_TO_SECONDS } from "../src/utils/config";
import { SimulationClaimRewardLiquidity, SimulationJoinLiquidity, SimulationWithdrawLiquidity, updateLiquidityCampainState } from "../src/Simulation";
  // start 
  async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc.publicnode.com");
    // const chainId = 56
    const chainId = Number((await provider.getNetwork()).chainId)
    const userAddress = "0x9e47969Dc2e13b46575AD9663646a0214a13F880";
    const proxyAddress = "0x8E79c4f9c4D71aecd0B00a755Bcfe0b86A5d181E";

    //test AAVE
    // 0x5BAF597914E62182e5CCafbcc69C966919d5cBa8
    // https://bsc.publicnode.com
    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    appState = await updateLiquidityCampainState(appState);
    console.log(appState.smartWalletState.liquidityCampainState)
    // console.log(appState.smartWalletState.address)
    // appState = await SimulationJoinLiquidity(appState, "0x1537263E42f81424A5099f992c1111D9d8c012B3", "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43", "0.1")
    // console.log(appState.smartWalletState.liquidityCampainState)
    // console.log("-----------------------")
    // appState = await SimulationJoinLiquidity(appState, "0x1537263E42f81424A5099f992c1111D9d8c012B3", "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43", "0.1")
    // console.log("BALANCE", appState.smartWalletState.tokenBalances)
    // appState = await SimulationJoinLiquidity(appState, "0x1537263E42f81424A5099f992c1111D9d8c012B3", "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43", "10000")
    // console.log("BALANCE", appState.smartWalletState.tokenBalances)
    // appState = await SimulationWithdrawLiquidity(appState, "0x1537263E42f81424A5099f992c1111D9d8c012B3", "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43", "5000")
    // console.log("BALANCE", appState.smartWalletState.tokenBalances)
    // appState = await SimulationClaimRewardLiquidity(appState, "0x1537263E42f81424A5099f992c1111D9d8c012B3", "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43")
    // console.log(appState.smartWalletState.liquidityCampainState)
    // console.log("-----------------------")
    // console.log("BALANCE", appState.smartWalletState.tokenBalances)
  }
test()