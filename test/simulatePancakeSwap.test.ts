import { Contract, JsonRpcProvider, ethers } from "ethers";
import { updateTravaGovernanceState, updateUserLockBalance } from "../src/Simulation/trava/governance/UpdateStateAccount";
import { simulateTravaGovernanceCreateLock } from "../src/Simulation/trava/governance/SimulationGovernance";
import { ApplicationState } from "../src/State/ApplicationState";
import { convertHexStringToAddress, getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { MAX_UINT256, MONTH_TO_SECONDS, WEEK_TO_SECONDS } from "../src/utils/config";
import { updateForkCompoundLPState, updateUserInForkCompoundLPState } from "../src/Simulation/forkCompoundLP/UpdateStateAccount";
import { SimulationBorrowForkCompoundLP, SimulationCollateral, SimulationRepayForkCompoundLP, SimulationSupplyForkCompoundLP, SimulationWithdrawForkCompoundLP, cTokenToDetailTokenAddress, calculateMaxAmountForkCompoundBorrow, simulateAddliquidity, updateLPtTokenInfo, updateSmartWalletTokenBalance, updateTravaLPInfo, updateUserTokenBalance } from "../src/Simulation";
import { SimulationSupplyForkAaveLP, SimulationWithdrawForkAaveLP, updateForkAaveLPState, updateUserInForkAaveLPState } from "../src/Simulation/forkAaveLP";
import { multiCall } from "../src/utils/helper";
import cToken from "../src/abis/cToken.json";
import ForkCompoundController from "../src/abis/ForkCompoundController.json";
import { updatePancakeSwapV2 } from "../src/Simulation/pancakeSwapV2/UpdateStateAccount";
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
    const proxyAddress = "0x1Ef0246F251211676810778415370C135526F5D1";

    //test AAVE
    // 0x5BAF597914E62182e5CCafbcc69C966919d5cBa8
    // https://bsc.publicnode.com

    // Controller "0xfD36E2c2a6789Db23113685031d7F16329158384"
    // BNB cToekn "0xa07c5b74c9b40447a954e1466938b865b6bbea36"
    // USDC "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
    // USDC cToken "0xeca88125a5adbe82614ffc12d0db554e2e2867c8"
    // USDT "0x55d398326f99059fF775485246999027B3197955"

    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    
    appState = await updatePancakeSwapV2(appState);
    console.log(appState.pancakeSwapV2Pair.pancakeV2Pairs.get("0xadBba1EF326A33FDB754f14e62A96D5278b942Bd".toLowerCase())!)
    // console.log("_______________________TEST COMPOUND_______________________")
    appState = await simulateAddliquidity(appState, "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", "0xadBba1EF326A33FDB754f14e62A96D5278b942Bd", "1", "1");
    console.log(appState.pancakeSwapV2Pair.pancakeV2Pairs.get("0xadBba1EF326A33FDB754f14e62A96D5278b942Bd".toLowerCase())!)
  }
test()