import { updateMaxRewardCanClaims, updateRTravaAndTravaForReward, updateTravaLPInfo } from "../src/Simulation/market/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import { SimulationClaimReward, SimulationConvertReward, getListTDTokenRewardsAddress } from "../src/Simulation/market/SimulationWalletTravaLP";
import { Contract, JsonRpcProvider } from "ethers";
import BigNumber from "bignumber.js";
import { getAddr } from "../src/utils/address";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../src/Simulation/basic/UpdateStateAccount";
import { MAX_UINT256 } from "../src/utils/config";
// start test

const test = async () => {
  console.log("=================BEFORE==========================");
  const provider = new JsonRpcProvider("https://bsc.publicnode.com")
  const chainId = Number((await provider.getNetwork()).chainId)
  const userAddress = "0x871DBcE2b9923A35716e7E83ee402B535298538E";
  const proxyAddress = "0x124aa737A67CE0345Ab54ed32d23A8D453788890";

  const appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId
  );

  let oldState = await updateTravaLPInfo(
    appState
  )
  // oldState = await updateRTravaAndTravaForReward(
  //   oldState
  // )
  // oldState = await updateTokenInPoolInfo(
  //   oldState
  // )
  // oldState = await updateRTravaAndTravaForReward(appState);
  // oldState = await updateMaxRewardCanClaims(oldState);
  // console.log(oldState.smartWalletState.tokenBalances);
  console.log(JSON.stringify(oldState.smartWalletState.travaLPState.lpReward));
  console.log(oldState.walletState.tokenBalances);
  // oldState = await updateUserTokenBalance(oldState, "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef".toLowerCase());
  // console.log("123", oldState.walletState.tokenBalances);
  // oldState = await SimulationClaimReward(
  //   oldState,
  //   userAddress,
  //   BigNumber(0).toFixed(0)
  //   );
    oldState = await updateUserTokenBalance(oldState, "0x170772a06affc0d375ce90ef59c8ec04c7ebf5d2".toLowerCase());
  // oldState = await updateSmartWalletTokenBalance(oldState, "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef");
  console.log(oldState.walletState.tokenBalances);

  console.log("=================START==========================");


  oldState = await SimulationConvertReward(
    oldState,
    userAddress,
    userAddress,
    MAX_UINT256
  );

  console.log("=================AFTER==========================");
  console.log(oldState.walletState.tokenBalances);
  // console.log(oldState.walletState.tokenBalances.get(appState.smartWalletState.travaLPState.lpReward.tokenAddress));
  // console.log(JSON.stringify(oldState.smartWalletState.tokenBalances.get(getAddr("TRAVA_TOKEN_IN_MARKET", chainId).toLowerCase())));
};
test();
