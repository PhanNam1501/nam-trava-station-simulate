import { Contract, JsonRpcProvider, ethers } from "ethers";
import { updateTravaGovernanceState, updateUserLockBalance } from "../src/Simulation/trava/governance/UpdateStateAccount";
import { simulateTravaGovernanceCreateLock } from "../src/Simulation/trava/governance/SimulationGovernance";
import { ApplicationState } from "../src/State/ApplicationState";
import { convertHexStringToAddress, getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { MAX_UINT256, MONTH_TO_SECONDS, WEEK_TO_SECONDS } from "../src/utils/config";
import { updateForkCompoundLPState, updateUserInForkCompoundLPState } from "../src/Simulation/forkCompoundLP/UpdateStateAccount";
import { SimulationBorrowForkCompoundLP, SimulationCollateral, SimulationRepayForkCompoundLP, SimulationSupplyForkCompoundLP, SimulationWithdrawForkCompoundLP, updateLPtTokenInfo, updateSmartWalletTokenBalance, updateTravaLPInfo, updateUserTokenBalance } from "../src/Simulation";
import { SimulationSupplyForkAaveLP, SimulationWithdrawForkAaveLP, updateForkAaveLPState, updateUserInForkAaveLPState } from "../src/Simulation/forkAaveLP";
import { multiCall } from "../src/utils/helper";
import ForkCompoundController from "../src/abis/ForkCompoundController.json";
  // start 
  async function test(){
    console.log(BigNumber(0.1).toFixed())
    const provider = new JsonRpcProvider("https://bsc.publicnode.com");
    // const chainId = 56
    const chainId = 56
    //main net
    //https://bsc.publicnode.com
    //0x871DBcE2b9923A35716e7E83ee402B535298538E
    //test net
    //https://bsc-testnet.publicnode.com
    //0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43
    const userAddress = "0x00328B8a90652b37672F2f8c6c1d39CE718D7F89";
    const proxyAddress = "0x826D824BE55A403859A6Db67D5EeC5aC386307fE";

    //test AAVE
    // 0x5BAF597914E62182e5CCafbcc69C966919d5cBa8
    // https://bsc.publicnode.com

    // Controller "0xfD36E2c2a6789Db23113685031d7F16329158384"
    // BNB cToekn "0xa07c5b74c9b40447a954e1466938b865b6bbea36"
    // snapshot "0xfB0f09dB330dC842a6637BfB959209424BbFE8C7"
    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    
    console.log("_______________________TEST COMPOUND_______________________")

    // appState = await updateForkCompoundLPState(appState, "venus");
    appState = await updateUserInForkCompoundLPState(appState, userAddress, "venus");
    // appState = await SimulationSupplyForkCompoundLP(appState, userAddress, "venus", "0xe9e7cea3dedca5984780bafc599bd69add087d56", "1000")
    // appState = await SimulationWithdrawForkCompoundLP(appState, userAddress, "venus", "0xe9e7cea3dedca5984780bafc599bd69add087d56", MAX_UINT256)
    console.log("_______________________TEST Collateral_______________________")
    let inputCollateral = [
    {tokenAddress:"0xe9e7cea3dedca5984780bafc599bd69add087d56", enableAsColl: 1},
    {tokenAddress:"0xe9e7cea3dedca5984780bafc599bd69add087d56", enableAsColl: 1},
    {tokenAddress:"0xe9e7cea3dedca5984780bafc599bd69add087d56", enableAsColl: 1},
    ]
    appState = await SimulationCollateral(appState, userAddress, "venus", inputCollateral)


    // console.log("_______________________TEST AAVE_______________________")

    // appState = await updateUserInForkAaveLPState(appState, userAddress, "valas-finance");
    // appState = await updateForkAaveLPState(appState, "valas-finance");
    // appState = await SimulationSupplyForkAaveLP(appState, userAddress, "valas-finance", "0xe9e7cea3dedca5984780bafc599bd69add087d56", "1000")
    // appState = await SimulationWithdrawForkAaveLP(appState, userAddress, "valas-finance", "0xe9e7cea3dedca5984780bafc599bd69add087d56", MAX_UINT256)


  }
test()