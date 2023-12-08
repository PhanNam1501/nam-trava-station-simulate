import { JsonRpcProvider, ethers } from "ethers";
import { updateTravaGovernanceState, updateUserLockBalance } from "../src/Simulation/trava/governance/UpdateStateAccount";
import { simulateTravaGovernanceCreateLock } from "../src/Simulation/trava/governance/SimulationGovernance";
import { ApplicationState } from "../src/State/ApplicationState";
import { getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { MONTH_TO_SECONDS, WEEK_TO_SECONDS } from "../src/utils/config";
import { updateForkCompoundLPState, updateUserInForkCompoundLPState } from "../src/Simulation/forkCompoundLP/UpdateStateAccount";

  // start 
  async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc.publicnode.com");
    const chainId = Number((await provider.getNetwork()).chainId)
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
    // appState = await updateTravaGovernanceState(appState);
    appState = await updateForkCompoundLPState(appState);
    appState = await updateUserInForkCompoundLPState(appState, userAddress);
    console.log(appState.forkCompoundLPState.forkCompoundLP.get("wepiggy")?.markets[0].assets)
    // console.log(appState.forkCompoundLPState)
    console.log(appState.walletState.forkedCompoundLPState)
    // console.log(appState.walletState.forkedCompoundLPState.get("venus")?.dapps)
    // console.log(appState.walletState.forkedCompoundLPState.get("venus")?.dapps[0].reserves)
    console.log(appState.walletState.forkedCompoundLPState.get("venus")?.dapps[0].reserves[0].deposit)

}
test()