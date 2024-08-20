import { JsonRpcProvider } from "ethers";
import { ApplicationState } from "../src/State";
import { updateCS251State } from "../src/Simulation/cs251/update";
import { addLiquidity, removeLiquidity, swapETHforTokens, swapTokenforETH } from "../src/Simulation/cs251/dapp";


const test = async () => {
  const provider = new JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);
  const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE"
  const exchangeAddress = "0x32cF813649E43D410E16A7b400A5134E5Aa77837"
  const tokenAddr = "0x345dCB7B8F17D342A3639d1D9bD649189f2D0162"
  const from = "0x13Ef8aDFE85985875007877d3E3B59fCCDc4cb78"
  const to = "0x13Ef8aDFE85985875007877d3E3B59fCCDc4cb78"

  const amountETH = "0.11"
  let appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId,
    ""
  );
  appState = await updateCS251State(appState, exchangeAddress, false)
  // appState = await updateCS251State(appState, exchangeAddress1, false)
  console.log("cs251 state", appState.cs251state.cs251state.get(exchangeAddress));
  appState = await addLiquidity (appState, exchangeAddress, tokenAddr,from,amountETH)
  console.log("cs251 state after addliquidity", appState.cs251state.cs251state.get(exchangeAddress))
  appState = await removeLiquidity (appState, exchangeAddress, tokenAddr,amountETH,to)
  console.log("cs251 state remove liquidity", appState.cs251state.cs251state.get(exchangeAddress))
  appState = await swapETHforTokens (appState, exchangeAddress,amountETH,from,to,tokenAddr)
  console.log("cs251 state swap eth for tokens", appState.cs251state.cs251state.get(exchangeAddress))
  appState = await swapTokenforETH (appState, exchangeAddress,amountETH,from,to,tokenAddr)
  console.log("cs251 state swap token for eth", appState.cs251state.cs251state.get(exchangeAddress))








    
  

};
test();
