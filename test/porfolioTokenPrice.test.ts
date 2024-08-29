import { JsonRpcProvider } from "ethers";
import { ApplicationState } from "../src/State";
import { updatePancakeFarmState } from "../src/Simulation/pancake-farm";
import { listFarmingV2List, MAX_UINT256 } from "../src/utils";
import { getPancakeFarmAPR, simulatePancakeFarmHarvestLP, simulatePancakeFarmStakeLP, simulatePancakeFarmUnStakeLP } from "../src/Simulation/pancake-farm/SimulationPancakeFarm";
import {getLPTokenPrice} from "../src/Portfolio/tokenPrice"


const test = async () => {
  const rpcUrl = "https://nd-548-567-990.p2pify.com/cbbfddee2b688acec746b6d0b4fdac3c"
  const provider = new JsonRpcProvider(rpcUrl);
  console.log("================= Test User Address ========================");
  const chainId = Number((await provider.getNetwork()).chainId);
  const userAddress = "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43"
  const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE"
  const listFarms = listFarmingV2List[chainId]
  const listLPAddress = new Array(listFarms.length)
  
  for(let i = 0; i < listFarms.length; i++) {
    listLPAddress[i] = listFarms[i].stakedToken.address
  }
  
  console.log(await getLPTokenPrice(listLPAddress, chainId, provider ))
};
test()
