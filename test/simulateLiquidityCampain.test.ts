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
    const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com");
    // const chainId = 56
    const chainId = 97
    //main net
    //https://bsc.publicnode.com
    //0x871DBcE2b9923A35716e7E83ee402B535298538E
    //test net
    //https://bsc-testnet.publicnode.com
    //0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43
    const userAddress = "0x871DBcE2b9923A35716e7E83ee402B535298538E";
    const proxyAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43";

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
    console.log(appState.smartWalletState.address)
    console.log("-----------------------")
    appState = await SimulationJoinLiquidity(appState, "0x1537263E42f81424A5099f992c1111D9d8c012B3", "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43", "0.1")
    console.log("BALANCE", appState.smartWalletState.tokenBalances)
    appState = await SimulationJoinLiquidity(appState, "0x1537263E42f81424A5099f992c1111D9d8c012B3", "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43", "10000")
    console.log("BALANCE", appState.smartWalletState.tokenBalances)
    appState = await SimulationWithdrawLiquidity(appState, "0x1537263E42f81424A5099f992c1111D9d8c012B3", "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43", "5000")
    console.log("BALANCE", appState.smartWalletState.tokenBalances)
    appState = await SimulationClaimRewardLiquidity(appState, "0x1537263E42f81424A5099f992c1111D9d8c012B3", "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43")
    console.log(appState.smartWalletState.liquidityCampainState)
    console.log("-----------------------")
    console.log("BALANCE", appState.smartWalletState.tokenBalances)
  }
test()