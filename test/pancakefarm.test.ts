import { JsonRpcProvider } from "ethers";
import { ApplicationState } from "../src/State";
import { updatePancakeFarmState } from "../src/Simulation/pancake-farm";
import { PancakeFarmHarvestLP } from "../src/Simulation/pancake-farm/SimulationPancakeFarm";
import {PancakeFarmStakeLP} from "../src/Simulation/pancake-farm/SimulationPancakeFarm";
import { PancakeFarmUnStakeLP } from "../src/Simulation/pancake-farm/SimulationPancakeFarm";
import { MAX_UINT256 } from "../src/utils";



const test = async () => {
  const provider = new JsonRpcProvider("https://nd-548-567-990.p2pify.com/cbbfddee2b688acec746b6d0b4fdac3c");
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);
  const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE"
  const v2WrapperAddress = "0x9669218e7ffACE40D78FF09C78aEA5F4DEb9aD4D"

  const _amount = "100000000000000000000"
  
  let appState = new ApplicationState(
    userAddress,
    proxyAddress,
    provider,
    chainId,
    ""
  );
  appState = await updatePancakeFarmState(appState, v2WrapperAddress, false)
  console.log("pancake farm state", appState.PancakeFarmState.PancakeFarmState.get(v2WrapperAddress));
  appState = await PancakeFarmStakeLP(appState, v2WrapperAddress, userAddress, _amount, false )
  console.log("pancake farm state after stake", appState.PancakeFarmState.PancakeFarmState.get(v2WrapperAddress));
  console.log("token token balance in smart wallet", appState.smartWalletState.tokenBalances)
  console.log("token balance in wallet", appState.walletState.tokenBalances)
  appState = await PancakeFarmUnStakeLP(appState, v2WrapperAddress, _amount, userAddress, false)
  console.log("pancake farm state after unstake", appState.PancakeFarmState.PancakeFarmState.get(v2WrapperAddress));
  console.log("token balance in smart wallet", appState.smartWalletState.tokenBalances)
  console.log("token balance in wallet", appState.walletState.tokenBalances)
  appState = await PancakeFarmHarvestLP(appState, v2WrapperAddress,userAddress, false)
  console.log("pancake farm state after harvest", appState.PancakeFarmState.PancakeFarmState.get(v2WrapperAddress));
  console.log("token balance in smart wallet", appState.smartWalletState.tokenBalances)
  console.log("token balance in wallet", appState.walletState.tokenBalances)
};
test()
