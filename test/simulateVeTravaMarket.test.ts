import { JsonRpcProvider, ethers } from "ethers";
import { updateSellingVeTrava, updateOwnedVeTrava } from "../src/Simulation/trava/nft/marketplace/veTrava/UpdateStateAccount";
import { simulateTravaGovernanceCreateLock } from "../src/Simulation/trava/governance/SimulationGovernance";
import { ApplicationState } from "../src/State/ApplicationState";
import { getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { MONTH_TO_SECONDS, WEEK_TO_SECONDS } from "../src/utils/config";
import { simulateNFTVeTravaTranfer } from "../src/Simulation/trava/nft/utilities/SimulationVeTravaNFTUtilities";
  // start 
  async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com");
    const chainId = Number((await provider.getNetwork()).chainId)
    //main net
    //https://bsc.publicnode.com
    //0x789b21282e83b46e13334623eda2b037a99efdf2
    //test net
    //https://bsc-testnet.publicnode.com
    //0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43
    const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43";
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE";

    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    // appState = await updateTravaGovernanceState(appState);
    appState = await updateSellingVeTrava(appState);
    appState = await updateOwnedVeTrava(appState, userAddress);
    appState = await simulateNFTVeTravaTranfer(appState, "39", userAddress, proxyAddress);
    appState = await simulateNFTVeTravaTranfer(appState, "43", userAddress, proxyAddress);
    appState = await simulateNFTVeTravaTranfer(appState, "43", proxyAddress, proxyAddress);
    console.log(appState.NFTVeTravaMarketSellingState);
    console.log(appState.walletState.veTravaListState);
    console.log(appState.smartWalletState.veTravaListState);
}
test()