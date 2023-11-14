import { JsonRpcProvider, ethers } from "ethers";
import { updateSellingVeTrava } from "../src/Simulation/trava/nft/marketplace/veTrava/UpdateStateAccount";
import { simulateTravaGovernanceCreateLock } from "../src/Simulation/trava/governance/SimulationGovernance";
import { ApplicationState } from "../src/State/ApplicationState";
import { getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { MONTH_TO_SECONDS, WEEK_TO_SECONDS } from "../src/utils/config";
import { simulateNFTVeTravaTranfer } from "../src/Simulation/trava/nft/utilities/SimulationVeTravaNFTUtilities";
import { updateTravaGovernanceState, updateUserLockBalance, updateUserTokenBalance } from "../src/Simulation";
import { simulateNFTVeTravaCancelSale, simulateNFTVeTravaCreateSale, simulateNFTVeTravaBuy } from "../src/Simulation/trava/nft/marketplace/veTrava/SimulationNFTVeTrava";
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
    appState = await updateSellingVeTrava(appState);
    appState = await updateUserLockBalance(appState, userAddress);
    console.log("===============TEST TRANFER==================");
    appState = await simulateNFTVeTravaTranfer(appState, "43", userAddress, proxyAddress);
    appState = await simulateNFTVeTravaTranfer(appState, "43", proxyAddress, proxyAddress);
    // console.log(appState.NFTVeTravaMarketSellingState);
    // console.log(appState.walletState.veTravaListState);
    // console.log(appState.smartWalletState.veTravaListState);
    appState = await simulateNFTVeTravaCreateSale(appState, "43", proxyAddress, "9990999", getAddr("TRAVA_TOKEN"));
    console.log("===============TEST CREATE SALE==================");
    // console.log(appState.smartWalletState.veTravaListState);
    // console.log(appState.NFTVeTravaMarketSellingState);
    console.log("===============TEST CANCEL SALE==================");
    appState = await simulateNFTVeTravaCancelSale(appState, "43", proxyAddress);
    console.log(appState.walletState.veTravaListState);
    console.log(appState.smartWalletState.veTravaListState);
    console.log(appState.NFTVeTravaMarketSellingState);
    console.log("===============TEST BUY==================");
    appState = await simulateNFTVeTravaBuy(appState, "28", proxyAddress, userAddress);
    console.log(appState.walletState.veTravaListState);
    console.log(appState.smartWalletState.veTravaListState);
    console.log(appState.NFTVeTravaMarketSellingState);

  }
test()