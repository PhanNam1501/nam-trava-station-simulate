import { JsonRpcProvider } from "ethers";
import { ApplicationState } from "../src/State";
import { updateCamelotV3State } from "../src/Simulation/camelot_v3/update";
import { BigNumber } from "bignumber.js";
import { addLiquidity, collect, removeliquidity, writeTimepoint, swap, nextTickInTheSameRow} from "../src/Simulation/camelot_v3/simulateCamelotV3"; 



const test = async () => {
  const provider = new JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);
  const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const proxyAddress = "0x3eEeF7BEA5Ce695c48e0Be3d929448Af9e9a74C3"
//   const exchangeAddress = "0xf45CF8f6E65314D0296Fa4Ad8758b3ACA833De2b"
//   const tokenAddr = "0x36C85D157E3745fb44c75478DD5524D25B3d41Da"
//   const tokenAAddr = "0xc71Ca612Cd8b901c9a0e956e0F52EcDa2053f4aa"
//   const tokenBAddr = "0xE12236d5F72a657A013735dA104070C92d56C7B8"
//   const tokenCAddr = "0x9c68f97297891cd4b5f566548CE3F63a08c0a87c"
  
  const from = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const to = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const tokenId = "3";
//   const amountETHadd = "100"
//   const amountETHremove = "50"
//   const amountETHswap = "20"
const nft = "0xB2dADcb54FfaE9Bf71b1d554a7E7Ef8F57E517d0";
const pool = "0xB5cB56f595ecfb653FA92e2024D9d56DfBB60CE4";
  

  let appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId,
    ""
  );
  appState = await updateCamelotV3State(appState, from, false);

  // const pair1 = await TokenMiddle(tokenAAddr, tokenCAddr);
  // console.log(pair1)
  // const check = await checkPair(tokenAAddr, tokenBAddr);
  // console.log(check)
 
  console.log("camelotv3 state", appState.camelotv3state.camelotv3state.get(nft));
  let globalS = appState.camelotv3state.globalstate.get(pool);
  console.log("globalState: ",  appState.camelotv3state.globalstate.get(pool));
  // console.log("poolState: ", appState.camelotv3state.poolstate.get(pool));
  // console.log("tickLower: ", appState.camelotv3state.ticklowerstate.get(pool));
  // console.log("tickUpper: ", appState.camelotv3state.tickupperstate.get(pool));

//   const num = await addLiquidity(appState, tokenId, "100", "100", from, to);
//   console.log("camelotv3 state", appState.camelotv3state.camelotv3state.get(nft));
//   console.log("poolState: ", appState.camelotv3state.poolstate.get(pool));
//   console.log("tickLower: ", appState.camelotv3state.ticklowerstate.get(pool));
//   console.log("tickUpper: ", appState.camelotv3state.tickupperstate.get(pool));

  // const num1 = await removeliquidity(appState, tokenId, "100", to);
  // console.log("camelotv3 state", appState.camelotv3state.camelotv3state.get(nft));
  // console.log("globalState: ",  appState.camelotv3state.globalstate.get(pool));
  // console.log("poolState: ", appState.camelotv3state.poolstate.get(pool));
  // console.log("tickLower: ", appState.camelotv3state.ticklowerstate.get(pool));
  // console.log("tickUpper: ", appState.camelotv3state.tickupperstate.get(pool));

  // const num2 = await collect(appState, tokenId, "50", "50", to);
  // console.log("camelotv3 state", appState.camelotv3state.camelotv3state.get(nft));
  // console.log("globalState: ",  appState.camelotv3state.globalstate.get(pool));
  // console.log("poolState: ", appState.camelotv3state.poolstate.get(pool));
  // console.log("tickLower: ", appState.camelotv3state.ticklowerstate.get(pool));
  // console.log("tickUpper: ", appState.camelotv3state.tickupperstate.get(pool));
  const currentTime = new Date().getTime();
  const time = Math.floor(currentTime / 1000);
  // const a = await getSingleTimepoint(BigNumber(time), BigNumber(86400), BigNumber(-2266), 17, 0, BigNumber(572));
  // console.log(a);

  const b = await writeTimepoint(18, BigNumber(time), BigNumber(-2266), BigNumber(572), BigNumber(0));
  console.log(b)

  // const fee = await getNewFee(BigNumber(time), BigNumber(-2266), 16, BigNumber(572));
  // console.log("Fee:" , fee.toString());
  // const [tick,] = await nextTickInTheSameRow(BigNumber(-2048), true);
  // console.log(tick.toString());
  const swap1 = await swap(appState, from, tokenId, to, true, "20","0");
  
  
  
};
test();