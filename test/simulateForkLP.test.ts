import { JsonRpcProvider, ethers } from "ethers";
import { updateTravaGovernanceState, updateUserLockBalance } from "../src/Simulation/trava/governance/UpdateStateAccount";
import { simulateTravaGovernanceCreateLock } from "../src/Simulation/trava/governance/SimulationGovernance";
import { ApplicationState } from "../src/State/ApplicationState";
import { getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { MONTH_TO_SECONDS, WEEK_TO_SECONDS } from "../src/utils/config";
import { updateForkCompoundLPState, updateUserInForkCompoundLPState } from "../src/Simulation/forkCompoundLP/UpdateStateAccount";
import { SimulationBorrowForkCompoundLP, SimulationRepayForkCompoundLP, SimulationSupplyForkCompoundLP, updateLPtTokenInfo, updateSmartWalletTokenBalance, updateTravaLPInfo, updateUserTokenBalance } from "../src/Simulation";
import { getTTokenAddress, updateForkAaveLPState, updateUserInForkAaveLPState } from "../src/Simulation/forkAaveLP";

  // start 
  async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc.publicnode.com");
    const chainId = 38
    //main net
    //https://bsc.publicnode.com
    //0x871DBcE2b9923A35716e7E83ee402B535298538E
    //test net
    //https://bsc-testnet.publicnode.com
    //0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43
    const userAddress = "0x871DBcE2b9923A35716e7E83ee402B535298538E";
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE";

    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    // // appState = await updateTravaGovernanceState(appState);
    // appState = await updateForkCompoundLPState(appState, "venus");
    // appState = await updateUserInForkCompoundLPState(appState, userAddress, "venus");
    // // console.log(appState.forkCompoundLPState.forkCompoundLP.get("wepiggy")?.markets[0].assets)
    // // // console.log(appState.forkCompoundLPState)
    // // console.log(appState.walletState.forkedCompoundLPState)
    // console.log(appState.walletState.forkedCompoundLPState.get("venus"))
    // // console.log(appState.walletState.forkedCompoundLPState.get("venus")?.dapps[0].reserves)
    // appState = await SimulationRepayForkCompoundLP(appState, userAddress, "venus", "0xe9e7cea3dedca5984780bafc599bd69add087d56", "1000")
    // console.log(appState.walletState.forkedCompoundLPState.get("venus"))
    // console.log(appState.walletState.forkedCompoundLPState.get("venus")?.dapps[0].reserves[0].borrow)
    
    console.log("_______________________TEST AAVE_______________________")

      
    appState = await updateForkAaveLPState(appState, "valas-finance");
    let a = await getTTokenAddress(appState, "valas-finance", "0x2170ed0880ac9a755fd29b2688956bd959f933f8")
    // '0x831f42c8a0892c1a5b7fa3e972b3ce3aa40d676e',
    // '0x9e06035740ab5ed9f48d8ff8b588056693b83e3a',
    console.log(a)
    

  }
test()