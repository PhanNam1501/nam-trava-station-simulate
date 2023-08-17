import { updateUserTokenBalance } from "../Simulation/basic/UpdateStateAccount";
import { simulateSwap } from "../Simulation/swap/SimulationSwap";
import { ApplicationState } from "../State/ApplicationState";
import {JsonRpcProvider} from "ethers"
async function test(){
      const appState = new ApplicationState(
        "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
        "0x826D824BE55A403859A6Db67D5EeC5aC386307fE",
        new JsonRpcProvider("https://bsc-testnet.publicnode.com"),
      );
      console.log("Web3 is",appState.web3)
      await Promise.all([updateUserTokenBalance(appState,"0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37"),updateUserTokenBalance(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6")])
      console.log("===Before swap===")
      console.log("TRAVA Balance",appState.walletState.tokenBalances.get("0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37"))
      console.log("WBNB Balance",appState.walletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))
      //Swap 1000 TRAVA for 0.01 WBNB
      await simulateSwap(appState,"0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37","0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6","1000000000000000000000","100000000000000000")
      console.log("===After swap===")
      console.log("TRAVA Balance",appState.walletState.tokenBalances.get("0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37"))
      console.log("WBNB Balance",appState.walletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))
}
test();