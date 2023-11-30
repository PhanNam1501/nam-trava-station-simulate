import { JsonRpcProvider } from "ethers";
import { ApplicationState, bnb, getUserTokenBalance, updateOraiLiquidStakingState } from "orchai-combinator-bsc-simulation";
const test = async () => {
    console.log("=================BEFORE==========================");
    const walletAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE"
    const chainId = 97;

    const provider = new JsonRpcProvider("https://bsc-testnet.publicnode.com")

    let appState = new ApplicationState(
        walletAddress,
        proxyAddress,
        "https://bsc-testnet.publicnode.com",
        chainId,
        ""
    );
    console.log(bnb.toLowerCase())
    appState = await updateOraiLiquidStakingState(appState)

    console.log(appState.oraiLSStake)
}
test()
