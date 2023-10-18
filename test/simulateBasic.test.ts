import { simulateSendToken, simulateUnwrap, simulateWrap } from "../src/Simulation/basic/SimulationBasic";
import { updateUserEthBalance, updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import { Contract, JsonRpcProvider, encodeBase58 } from "ethers"
import { Recipe, actions, getAddr } from "trava-station-sdk"
import axios from 'axios';
import ERC20Mock from "../src/abis/ERC20Mock.json";
import { convertHexStringToAddress } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { simulateWrapV2 } from "../src/Simulation/basic/SimulationBasicV2";

const test = async () => {
    console.log("=================BEFORE==========================");
    const walletAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE"
    const chainId = 97;

    const provider = new JsonRpcProvider("http://127.0.0.1:8545")

    let appState = new ApplicationState(
        walletAddress,
        proxyAddress,
        provider,
        chainId,
        ""
    );

    appState = await updateUserEthBalance(appState)
    await Promise.all([
        updateUserEthBalance(appState),
        updateSmartWalletEthBalance(appState),
        updateUserTokenBalance(appState, getAddr("WBNB_ADDRESS", chainId)),
        updateSmartWalletTokenBalance(appState, getAddr("WBNB_ADDRESS", chainId))
    ]);
    appState = await updateUserEthBalance(appState);
    console.log("User Balance is", (appState.walletState.ethBalances))
    console.log("User WBNB is ", appState.walletState.tokenBalances.get(getAddr("WBNB_ADDRESS", chainId).toLowerCase()));
    console.log("Smart Wallet Balance is", (appState.smartWalletState.ethBalances));
    console.log("Smart Wallet WBNB is ", appState.smartWalletState.tokenBalances.get(getAddr("WBNB_ADDRESS", chainId).toLowerCase()));

    //Wrap 0.02 BNB
    await simulateWrapV2(appState, "100", "0xd20B3B10521410bF2C9F165638aC30660C426e3F");

    console.log("User Balance after wrap 0.02 BNB", appState.walletState.ethBalances);
    console.log("Smart wallet WBNB after wrap", appState.smartWalletState.tokenBalances.get(getAddr("WBNB_ADDRESS", chainId).toLowerCase()))

    await simulateSendToken(appState, getAddr("WBNB_ADDRESS", chainId), proxyAddress, walletAddress, "20000000000000000")
    console.log("Smart wallet WBNB after send 0.02 WBNB", appState.smartWalletState.tokenBalances.get(getAddr("WBNB_ADDRESS", chainId)))
    console.log("User WBNB after receive 0.02 WBNB", appState.walletState.tokenBalances.get(getAddr("WBNB_ADDRESS", chainId)))

    await simulateUnwrap(appState, "20000000000000000")
    console.log("User BNB after unwrap", appState.walletState.ethBalances);
    console.log(await provider.getBalance("0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"));

}
test()
