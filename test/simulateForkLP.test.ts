import { Contract, JsonRpcProvider, ethers } from "ethers";
import { updateTravaGovernanceState, updateUserLockBalance } from "../src/Simulation/trava/governance/UpdateStateAccount";
import { simulateTravaGovernanceCreateLock } from "../src/Simulation/trava/governance/SimulationGovernance";
import { ApplicationState } from "../src/State/ApplicationState";
import { getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { MONTH_TO_SECONDS, WEEK_TO_SECONDS } from "../src/utils/config";
import { updateForkCompoundLPState, updateUserInForkCompoundLPState } from "../src/Simulation/forkCompoundLP/UpdateStateAccount";
import { SimulationBorrowForkCompoundLP, SimulationRepayForkCompoundLP, SimulationSupplyForkCompoundLP, SimulationWithdrawForkCompoundLP, updateLPtTokenInfo, updateSmartWalletTokenBalance, updateTravaLPInfo, updateUserTokenBalance } from "../src/Simulation";
import { SimulationSupplyForkAaveLP, SimulationWithdrawForkAaveLP, updateForkAaveLPState, updateUserInForkAaveLPState } from "../src/Simulation/forkAaveLP";
  // start 
  async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc.publicnode.com");
    // const chainId = 56
    const chainId = 56
    //main net
    //https://bsc.publicnode.com
    //0x871DBcE2b9923A35716e7E83ee402B535298538E
    //test net
    //https://bsc-testnet.publicnode.com
    //0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43
    const userAddress = "0x5BAF597914E62182e5CCafbcc69C966919d5cBa8";
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE";

    //test AAVE
    // 0x5BAF597914E62182e5CCafbcc69C966919d5cBa8
    // https://bsc.publicnode.com

    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    // appState = await updateTravaGovernanceState(appState);
    // appState = await updateForkCompoundLPState(appState, "venus");
    // appState = await updateUserInForkCompoundLPState(appState, userAddress, "venus");
    // console.log(appState.forkCompoundLPState.forkCompoundLP.get("wepiggy")?.markets[0].assets)
    // // console.log(appState.forkCompoundLPState)
    // console.log(appState.walletState.forkedCompoundLPState)
    // console.log(appState.walletState.forkedCompoundLPState.get("venus"))
    // console.log(appState.walletState.forkedCompoundLPState.get("venus")?.dapps[0].reserves)
    // appState = await SimulationSupplyForkCompoundLP(appState, userAddress, "venus", "0xe9e7cea3dedca5984780bafc599bd69add087d56", "1000")
    // console.log(appState.walletState.forkedCompoundLPState.get("venus"))
    // console.log(appState.walletState.forkedCompoundLPState.get("venus")?.dapps[0].reserves[0].deposit)
    
    // console.log("_______________________TEST AAVE_______________________")

    appState = await updateUserInForkAaveLPState(appState, userAddress, "valas-finance");
    appState = await updateForkAaveLPState(appState, "valas-finance");
    appState = await SimulationSupplyForkAaveLP(appState, userAddress, "valas-finance", "0xe9e7cea3dedca5984780bafc599bd69add087d56", "1000")

    // let a = await getListTokenAddress(appState, "valas-finance");
    // console.log(a)

  }
test()