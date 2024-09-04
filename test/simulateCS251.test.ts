import { JsonRpcProvider } from "ethers";
import { ApplicationState } from "../src/State";
import { updateCS251State } from "../src/Simulation/cs251/update";

import { addLiquidity, removeLiquidity, swapAssets } from "../src/Simulation/cs251/simulateCS251"; 



const test = async () => {
  const provider = new JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);
  const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const proxyAddress = "0x3eEeF7BEA5Ce695c48e0Be3d929448Af9e9a74C3"
  const exchangeAddress = "0xf45CF8f6E65314D0296Fa4Ad8758b3ACA833De2b"
  const tokenAddr = "0x36C85D157E3745fb44c75478DD5524D25B3d41Da"
  const from = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const to = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const amountETHadd = "100"
  const amountETHremove = "50"
  const amountETHswap = "20"
  let appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId,
    ""
  );
  appState = await updateCS251State(appState, exchangeAddress, false)
 
  console.log("cs251 state", appState.cs251state.cs251state.get(exchangeAddress));
  appState = await addLiquidity (appState, exchangeAddress, tokenAddr,from,amountETHadd)
  console.log("cs251 state after addliquidity", appState.cs251state.cs251state.get(exchangeAddress))
  appState = await removeLiquidity (appState, exchangeAddress, tokenAddr,amountETHremove,to)
  console.log("cs251 state remove liquidity", appState.cs251state.cs251state.get(exchangeAddress))

  appState = await swapAssets (appState, exchangeAddress,amountETHswap,from,tokenAddr, true)
  console.log("cs251 state swap1", appState.cs251state.cs251state.get(exchangeAddress))

  appState = await swapAssets (appState, exchangeAddress,amountETHswap,from,tokenAddr, false )
  console.log("cs251 state swap2", appState.cs251state.cs251state.get(exchangeAddress))








    
  

};
test();