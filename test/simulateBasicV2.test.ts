import { simulateSendToken, simulateUnwrap, simulateWrap } from "../src/Simulation/basic/SimulationBasic";
import { updateUserEthBalance, updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import { Contract, JsonRpcProvider, encodeBase58 } from "ethers"
import { Recipe, actions } from "trava-station-sdk"
import axios from 'axios';
import ERC20Mock from "../src/abis/ERC20Mock.json";
import { convertHexStringToAddress } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { simulateWrapV2 } from "../src/Simulation/basic/SimulationBasicV2";

const test = async () => {
  console.log("=================BEFORE==========================");
  const walletAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE"
  const chainId = 56;
  const _tokenAddress = "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"
  const simulatorUrl = "http://localhost:3000/"
  const response = await axios.request({
    method: "post",
    url: `http://localhost:3000/fork`,
    data: {
      "address": `${walletAddress}`,
      "chainId": `${chainId}`
    }
  })

  console.log(response.data)

  const provider = new JsonRpcProvider(`http://127.0.0.1:8545`)


  let amount = "66"
  const address = convertHexStringToAddress(_tokenAddress);
  const TokenContract = new Contract(address, ERC20Mock, provider)

  let appState = new ApplicationState(
    walletAddress,
    proxyAddress,
    provider,
    chainId,
    simulatorUrl
  );
  
  appState = await updateUserEthBalance(appState)
  console.log("ok", appState.walletState.ethBalances);
  // console.log(await TokenContract.balanceOf(proxyAddress));

  // let wrapAction = new actions.basic.SendTokenAction(_tokenAddress, walletAddress, BigNumber(1e2).toString(), "0x3eaeD39715A10e4B7D47BBe676FA6c9553A2575d")
  let wrapAction = new actions.basic.WrapBnbAction(BigNumber(1e2).toString(), "0xd20B3B10521410bF2C9F165638aC30660C426e3F")

  // let encodeActionData = wrapAction.encodeForDsProxyCall()
  let recipe = new Recipe("testWrap", chainId, [
    wrapAction
  ])

  let encodeData = recipe.encodeForDsProxyCall()
  // console.log(encodeData)
  let res = await axios.request({
    method: "post",
    url: `http://localhost:3000/execute`,
    data: {
      "chainId": chainId.toString(),
      "EOAAddress": `${walletAddress}`,
      "smartWalletAddress": `${proxyAddress}`,
      "approve": [],
      "execute": {
        "target": `${encodeData[0]}`,
        "data": `${encodeData[1]}`,
        "value": BigNumber(1e2).toString()
      }
    }
  })
  console.log(res.data)
  // console.log(await TokenContract.balanceOf(proxyAddress));
  // await Promise.all([
  //   updateUserEthBalance(appState),
  //   updateSmartWalletEthBalance(appState),
  //   updateUserTokenBalance(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"),
  //   updateSmartWalletTokenBalance(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6")
  // ]);
  // appState = await updateUserEthBalance(appState);
  // console.log("User Balance is", (appState.walletState.ethBalances))
  // console.log("User WBNB is ", appState.walletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6".toLowerCase()));
  // console.log("Smart Wallet Balance is", (appState.smartWalletState.ethBalances));
  // console.log("Smart Wallet WBNB is ", appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6".toLowerCase()));

  // //Wrap 0.02 BNB
  // await simulateWrapV2(appState, "100", "0xd20B3B10521410bF2C9F165638aC30660C426e3F");
  console.log(await provider.getBalance(walletAddress));

  let resKill = await axios.request({
    method: 'post',
    url:  `http://localhost:3000/kill`,
    data: {
      // "address":  `${walletAddress}`,
      // "chainId": chainId.toString(),
      "port": 8545
    }
  })
  // console.log("User Balance after wrap 0.02 BNB",appState.walletState.ethBalances);
  // console.log("Smart wallet WBNB after wrap",appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6".toLowerCase()))

  // await simulateSendToken(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6","0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43","20000000000000000")
  // console.log("Smart wallet WBNB after send 0.02 WBNB",appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))
  // console.log("User WBNB after receive 0.02 WBNB",appState.walletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))

  // await simulateUnwrap(appState,"20000000000000000")
  // console.log("User BNB after unwrap",appState.walletState.ethBalances);
  // console.log(await provider.getBalance("0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"));

}
test()
