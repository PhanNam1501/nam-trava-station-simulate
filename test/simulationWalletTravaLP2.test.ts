import { updateMaxRewardCanClaims, updateRTravaAndTravaForReward, updateTravaLPInfo } from "../src/Simulation/market/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import { SimulationClaimReward, SimulationConvertReward } from "../src/Simulation/market/SimulationWalletTravaLP";
import { Contract, JsonRpcProvider } from "ethers";
import BigNumber from "bignumber.js";
import { getAddr } from "../src/utils/address";
// start test

const test = async () => {
  console.log("=================BEFORE==========================");
  const provider = new JsonRpcProvider("https://bsc.publicnode.com")
  const chainId = Number((await provider.getNetwork()).chainId)
  const userAddress = "0x68a6c841040B05D60434d81000f523Bf6355b31D";
  const proxyAddress = "0x72DE03F7828a473A64b4A415bD76820EBAFf2B2C";

  const appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId
  );

  let oldState = await updateTravaLPInfo(
    appState,
    proxyAddress
  )
  oldState = await updateRTravaAndTravaForReward(
    oldState
  )
  // oldState = await updateTokenInPoolInfo(
  //   oldState
  // )
  // oldState = await updateRTravaAndTravaForReward(appState);
  // oldState = await updateMaxRewardCanClaims(oldState);
  // console.log(oldState.smartWalletState.tokenBalances);
  console.log(JSON.stringify(oldState.smartWalletState.travaLPState));
  console.log(JSON.stringify(oldState.smartWalletState.tokenBalances.get(getAddr("TRAVA_TOKEN_IN_MARKET", chainId).toLowerCase())));
  console.log("=================START==========================");

  let newState = await SimulationClaimReward(
    oldState,
    userAddress,
    BigNumber(1e16).toFixed(0)
  );
  
  newState = await SimulationConvertReward(
    newState,
    userAddress,
    proxyAddress,
    BigNumber(5e15).toFixed(0)
  );

  console.log("=================AFTER==========================");
  console.log(newState.smartWalletState.travaLPState.lpReward.claimableReward);
  console.log(newState.walletState.tokenBalances.get(appState.smartWalletState.travaLPState.lpReward.tokenAddress));
  console.log(JSON.stringify(oldState.smartWalletState.tokenBalances.get(getAddr("TRAVA_TOKEN_IN_MARKET", chainId).toLowerCase())));
};
test();
