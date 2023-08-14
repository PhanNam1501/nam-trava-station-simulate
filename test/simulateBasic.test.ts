import { simulateSendToken, simulateUnwrap, simulateWrap } from "../Simulation/basic/SimulationBasic";
import { updateUserEthBalance,updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserTokenBalance } from "../Simulation/basic/UpdateStateAccount";
import { ApplicationState } from "../State/ApplicationState";
describe("Test Basic", () => {
    it("Test Basic", async () => {
      console.log("=================BEFORE==========================");
      const appState = new ApplicationState(
        "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
        "0x826D824BE55A403859A6Db67D5EeC5aC386307fE"
      );
      await Promise.all([updateUserEthBalance(appState),updateSmartWalletEthBalance(appState),updateUserTokenBalance(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"),updateSmartWalletTokenBalance(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6")]);
      console.log("User Balance is",(appState.walletState.ethBalances))
      console.log("User WBNB is ",appState.walletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"));
      console.log("Smart Wallet Balance is",(appState.smartWalletState.ethBalances));
      console.log("Smart Wallet WBNB is ",appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"));

      //Wrap 2 BNB
      await simulateWrap(appState,"2000000000000000000");

      console.log("User Balance after wrap 2 BNB",appState.walletState.ethBalances);
      console.log("Smart wallet WBNB after wrap",appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))

      await simulateSendToken(appState,"0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6","0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43","2000000000000000000")
      console.log("Smart wallet WBNB after send 2 WBNB",appState.smartWalletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))
      console.log("User WBNB after receive 2 WBNB",appState.walletState.tokenBalances.get("0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6"))

      await simulateUnwrap(appState,"2000000000000000000")
      console.log("User BNB after unwrap",appState.walletState.ethBalances);
    
    }); 
  });
  