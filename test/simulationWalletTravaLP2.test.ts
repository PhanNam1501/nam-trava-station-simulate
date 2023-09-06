import { updateListToken, updateRTravaAndTravaForReward } from "../src/Simulation/market/UpdateStateAccount";
import { ApplicationState } from "../src/State/ApplicationState";
import { SimulationClaimReward, SimulationConvertReward } from "../src/Simulation/market/SimulationWalletTravaLP";
import { Contract, JsonRpcProvider } from "ethers";
// start test

const test = async () => {
  console.log("=================BEFORE==========================");
  const provider = new JsonRpcProvider("https://data-seed-prebsc-2-s2.bnbchain.org:8545")
  const chainId = Number((await provider.getNetwork()).chainId)
  const appState = new ApplicationState(
    "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    new JsonRpcProvider("https://data-seed-prebsc-2-s2.bnbchain.org:8545"),
    chainId
  );
  let oldState = await updateRTravaAndTravaForReward(appState);
  oldState = await updateListToken(oldState);
  console.log(oldState.smartWalletState.detailTokenInPool);
  console.log(oldState.smartWalletState.tokenBalances);
  console.log(JSON.stringify(oldState));
  
  let newState = await SimulationClaimReward(
    oldState,
    "0x910cb19698eac48a6ab7ccc9542b756f2bdd67c6",
    "10000000000000000000"
  );
  
  newState = await SimulationConvertReward(
    newState,
    "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
    "5000000000000000000"
  );

  console.log("=================AFTER==========================");
  console.log(newState.smartWalletState.detailTokenInPool);
  console.log(newState.smartWalletState.tokenBalances);
  console.log(JSON.stringify(newState));
};
test();
