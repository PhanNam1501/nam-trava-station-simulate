import { JsonRpcProvider } from "ethers";
import { ApplicationState } from "../src/State";
import { updateCamelotState } from "../src/Simulation/camelot/update";

import { addLiquidityC, removeLiquidityC, swapLiquidity, TokenMiddle, checkPair, swapLiquidityV2 } from "../src/Simulation/camelot/simulateCamelot"; 



const test = async () => {
  const provider = new JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);
  const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const proxyAddress = "0x3eEeF7BEA5Ce695c48e0Be3d929448Af9e9a74C3"
//   const exchangeAddress = "0xf45CF8f6E65314D0296Fa4Ad8758b3ACA833De2b"
//   const tokenAddr = "0x36C85D157E3745fb44c75478DD5524D25B3d41Da"
  const tokenAAddr = "0xc71Ca612Cd8b901c9a0e956e0F52EcDa2053f4aa"
  const tokenBAddr = "0xE12236d5F72a657A013735dA104070C92d56C7B8"
  const tokenCAddr = "0x9c68f97297891cd4b5f566548CE3F63a08c0a87c"
  const pairAB = "0x82b83598D9E8C629292524AC9f8261B240b6B34e"
  const pairAW = "0x61ff04CEde76ee76A97467C3b8012734315C0Ccb"
  const pairCW = "0xCEf9c53ef910e6C1738CA50638AdB657A9D0d23a"
  const from = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const to = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
//   const amountETHadd = "100"
//   const amountETHremove = "50"
//   const amountETHswap = "20"
  const tokenAamount = "50";
  const tokenBamount = "50";
  const liquidityremove = "10";
  const tokenswap = "20";

  let appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId,
    ""
  );
  appState = await updateCamelotState(appState, from, false);

  // const pair1 = await TokenMiddle(tokenAAddr, tokenCAddr);
  // console.log(pair1)
  // const check = await checkPair(tokenAAddr, tokenBAddr);
  // console.log(check)
 
  console.log("camelot state", appState.camelotstate.camelotstate.get(pairAB));
  appState = await addLiquidityC(appState, tokenAAddr, tokenBAddr,pairAB, tokenAamount, tokenBamount, from);
  console.log("camelot state after addliquidity", appState.camelotstate.camelotstate.get(pairAB));

  appState = await removeLiquidityC(appState, tokenAAddr, tokenBAddr,pairAB, liquidityremove, from);
  console.log("camelot state after removeliquidity", appState.camelotstate.camelotstate.get(pairAB));
  await swapLiquidityV2(appState, [tokenBAddr, tokenAAddr, tokenCAddr], tokenswap, from);
  
};
test();