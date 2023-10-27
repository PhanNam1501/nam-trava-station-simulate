import { JsonRpcProvider, ethers } from "ethers";
import { updateAllLockBalance } from "../src/Simulation/trava/governance/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import BigNumber from "bignumber.js";
  // start 
  async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com");
    const chainId = Number((await provider.getNetwork()).chainId)
    const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43";
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE";

    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    appState = await updateAllLockBalance(appState);
}
test()