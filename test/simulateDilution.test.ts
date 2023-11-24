import { JsonRpcProvider, ethers } from "ethers";
import { ApplicationState } from "../src/State/ApplicationState";
import { getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { updateDilutionState } from "../src/Simulation/trava/nft/missions/dilution";

  // start 
  async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc.publicnode.com");
    const chainId = Number((await provider.getNetwork()).chainId)
    //main net
    //https://bsc.publicnode.com
    //0x789b21282e83b46e13334623eda2b037a99efdf2
    //test net
    //https://bsc-testnet.publicnode.com
    //0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43
    const userAddress = "0x789b21282e83b46e13334623eda2b037a99efdf2";
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE";

    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    //trava-nft-frontend-main\src\utils\query\onchain\multi-call-query\dilution-staking-query.js
    appState = await updateDilutionState(appState);
    console.log(appState.DilutionState.dilutionKnightArmy)
    console.log(appState.DilutionState.dilutionLimitedKnight)


}
test()