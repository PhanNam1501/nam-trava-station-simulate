import { ethers, JsonRpcProvider } from "ethers";
import { ApplicationState } from "../src/State/ApplicationState";
import { getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { updateCollectionBalanceFromContract, updateOwnerKnightInExpeditionState, updateOwnerTicketState, updateExpeditionState, updateNFTBalanceFromContract, simulateExpeditionDeploy } from "../src/Simulation";
import ExpeditionABI from "../src/abis/NFTExpeditionABI.json";

// start 
async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc.publicnode.com");
    const chainId = Number((await provider.getNetwork()).chainId)
    //main net
    //https://bsc.publicnode.com
    //0xeC41349b082fd667b7D5377808A504aeAA9a7A28
    //test net
    //https://bsc-testnet.publicnode.com
    //0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43
    const userAddress = "0xeC41349b082fd667b7D5377808A504aeAA9a7A28";
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE";

    let appState = new ApplicationState( 
        userAddress,
        proxyAddress,
        provider,
        chainId
    );
    appState = await updateExpeditionState(appState);
    appState = await updateCollectionBalanceFromContract(appState, "walletState"); //Update NFT of Owner
    appState = await updateOwnerKnightInExpeditionState(appState, userAddress);
    appState = await updateOwnerTicketState(appState, userAddress);
    console.log(appState["walletState"].collection.v1);
    console.log("Expedition", appState["walletState"].knightInExpeditionState.expedition);
    console.log(appState["walletState"].ticket);
    appState = await simulateExpeditionDeploy(appState, "0x5b6f3cad58626d409494a8800f60ec1a10c8e929", ["0", "0", "0"], ["0", "0", "0"], userAddress,  3927, userAddress, userAddress);
    console.log("________________________TEST DEPLOY________________________")
    console.log(appState["walletState"].collection.v1);
    console.log("Expedition", appState["walletState"].knightInExpeditionState.expedition);
}
test()
