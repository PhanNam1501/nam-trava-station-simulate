import { JsonRpcProvider } from "ethers";
import { ApplicationState } from "../src/State";
import { updatePancakeFarmState } from "../src/Simulation/pancake-farm";
import { MAX_UINT256 } from "../src/utils";
import { getPancakeFarmAPR, simulatePancakeFarmHarvestLP, simulatePancakeFarmStakeLP, simulatePancakeFarmUnStakeLP } from "../src/Simulation/pancake-farm/SimulationPancakeFarm";



const test = async () => {
  const provider = new JsonRpcProvider("https://nd-548-567-990.p2pify.com/cbbfddee2b688acec746b6d0b4fdac3c");
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);
  const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE"
  const v2WrapperAddress = "0x9669218e7ffACE40D78FF09C78aEA5F4DEb9aD4D".toLowerCase()

  const _amount = "100000000000000000000"
  
  let appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId,
    ""
  );
  appState = await updatePancakeFarmState(appState, proxyAddress, false)
  console.log("pancake farm state", appState.PancakeFarmState.PancakeFarmState.get(v2WrapperAddress));
  console.log(appState.tokenPrice)
  appState = await simulatePancakeFarmStakeLP(appState, v2WrapperAddress, userAddress, _amount, false )
  console.log("pancake farm state after stake", appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2WrapperAddress));
  console.log("token token balance in smart wallet", appState.walletState.tokenBalances)
  console.log("token balance in wallet", appState.walletState.tokenBalances)

  console.log("APR", await getPancakeFarmAPR(appState, v2WrapperAddress))
  appState = await simulatePancakeFarmUnStakeLP(appState, v2WrapperAddress, _amount, userAddress, false)
  console.log("pancake farm state after unstake", appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2WrapperAddress));
  console.log("token balance in smart wallet", appState.smartWalletState.tokenBalances)
  console.log("token balance in wallet", appState.walletState.tokenBalances)
  
  appState = await simulatePancakeFarmHarvestLP(appState, v2WrapperAddress,userAddress, false)
  console.log("pancake farm state after harvest", appState.smartWalletState.pancakeFarmState.userPancakeFarmState.get(v2WrapperAddress));
  console.log("token balance in smart wallet", appState.smartWalletState.tokenBalances)
  console.log("token balance in wallet", appState.walletState.tokenBalances)
  
};
test()
