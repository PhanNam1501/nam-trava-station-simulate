import { Contract, JsonRpcProvider, ethers } from "ethers";
import { updateTravaGovernanceState, updateUserLockBalance } from "../src/Simulation/trava/governance/UpdateStateAccount";
import { simulateTravaGovernanceCreateLock } from "../src/Simulation/trava/governance/SimulationGovernance";
import { ApplicationState } from "../src/State/ApplicationState";
import { convertHexStringToAddress, getAddr } from "../src/utils/address";
import BigNumber from "bignumber.js";
import { MAX_UINT256, MONTH_TO_SECONDS, WEEK_TO_SECONDS } from "../src/utils/config";
import { updateForkCompoundLPState, updateUserInForkCompoundLPState } from "../src/Simulation/forkCompoundLP/UpdateStateAccount";
import { SimulationBorrowForkCompoundLP, SimulationCollateral, SimulationRepayForkCompoundLP, SimulationSupplyForkCompoundLP, SimulationWithdrawForkCompoundLP, cTokenToDetailTokenAddress, calculateMaxAmountForkCompoundBorrow, updateLPtTokenInfo, updateSmartWalletTokenBalance, updateTravaLPInfo, updateUserTokenBalance } from "../src/Simulation";
import { SimulationSupplyForkAaveLP, SimulationWithdrawForkAaveLP, updateForkAaveLPState, updateUserInForkAaveLPState } from "../src/Simulation/forkAaveLP";
import { multiCall } from "../src/utils/helper";
import cToken from "../src/abis/cToken.json";
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
    const proxyAddress = "0x00328B8a90652b37672F2f8c6c1d39CE718D7F89";

    //test AAVE
    // 0x5BAF597914E62182e5CCafbcc69C966919d5cBa8
    // https://bsc.publicnode.com

    // Controller "0xfD36E2c2a6789Db23113685031d7F16329158384"
    // BNB cToekn "0xa07c5b74c9b40447a954e1466938b865b6bbea36"
    // USDC "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
    // USDC cToken "0xeca88125a5adbe82614ffc12d0db554e2e2867c8"

    let appState = new ApplicationState( 
    userAddress,
    proxyAddress,
    provider,
    chainId
    )
    
    // console.log("_______________________TEST COMPOUND_______________________")

    appState = await updateForkCompoundLPState(appState, "venus");
    appState = await updateUserInForkCompoundLPState(appState, userAddress, "venus");
    appState = await SimulationSupplyForkCompoundLP(appState, userAddress, "venus", "0xe9e7cea3dedca5984780bafc599bd69add087d56", "1000")
    appState = await SimulationBorrowForkCompoundLP(appState, userAddress, "venus", "0xe9e7cea3dedca5984780bafc599bd69add087d56", MAX_UINT256)

    // console.log("_______________________TEST AAVE_______________________")

    // appState = await updateUserInForkAaveLPState(appState, userAddress, "valas-finance");
    // appState = await updateForkAaveLPState(appState, "valas-finance");
    // appState = await SimulationSupplyForkAaveLP(appState, userAddress, "valas-finance", "0xe9e7cea3dedca5984780bafc599bd69add087d56", "1000")
    // appState = await SimulationWithdrawForkAaveLP(appState, userAddress, "valas-finance", "0xe9e7cea3dedca5984780bafc599bd69add087d56", MAX_UINT256)


    // console.log("_______________________TEST Collateral_______________________")
    // let inputCollateral = [
    // {tokenAddress:"0x0000000000000000000000000000000000000000", enableAsColl: 0}, // BNB
    // //0xa07c5b74c9b40447a954e1466938b865b6bbea36

    // {tokenAddress:"0xe9e7cea3dedca5984780bafc599bd69add087d56", enableAsColl: 0}, // BUSD
    // //0x95c78222b3d6e262426483d42cfa53685a67ab9d
    
    // {tokenAddress:"0x55d398326f99059ff775485246999027b3197955", enableAsColl: 1}, // USDT
    // //0xfd5840cd36d94d7229439859c0112a4185bc0255
    
    // {tokenAddress:"0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", enableAsColl: 1}, // USDC
    // //0xeca88125a5adbe82614ffc12d0db554e2e2867c8
    // ]
    // // DOGE coin 0xbA2aE424d960c26247Dd6c32edC70B295c744C43
    // appState = await SimulationCollateral(appState, userAddress, "venus", inputCollateral)
    // console.log(appState.walletState.forkedCompoundLPState.get("venus"))


    // let oracleContract = new Contract("0xfd5840cd36d94d7229439859c0112a4185bc0255", cToken, appState.web3)
    // let a = await oracleContract.getAccountSnapshot("0x00328B8a90652b37672F2f8c6c1d39CE718D7F89")
    // console.log(a)

    // let controllerContract = new Contract("0xfD36E2c2a6789Db23113685031d7F16329158384", ForkCompoundController, appState.web3)
    // let b = await controllerContract.markets("0xfd5840cd36d94d7229439859c0112a4185bc0255")
    // console.log(b)

    //Các điều kiện check
    // 1. Phải có tồn tại acc 
    // 2. Đồng đó phải không có khoản vay
    // 3. Thất bại nếu người gửi không được phép đổi tất cả mã thông báo của họ
      // MarketFacet.sol
        //      uint256 allowed = redeemAllowedInternal(vTokenAddress, msg.sender, tokensHeld);
        //        if (allowed != 0) {
        //          FAIL
        //          }  
        //
        //
          // FacetBase.sol
          //   function redeemAllowedInternal(
          //     address vToken,
          //     address redeemer,
          //     uint256 redeemTokens
          // )
            //   /* Otherwise, perform a hypothetical liquidity check to guard against shortfall */
            //   (Error err, , uint256 shortfall) = getHypotheticalAccountLiquidityInternal(
            //       redeemer,
            //       VToken(vToken),
            //       redeemTokens,
            //       0
            //   );
            //   if (shortfall != 0) {
            //       FAIL
            //   }
              // function getHypotheticalAccountLiquidityInternal(
              //   address account,
              //   VToken vTokenModify,
              //   uint256 redeemTokens,
              //   uint256 borrowAmount
              // ) internal view returns (Error, uint256, uint256) {
              //     (uint256 err, uint256 liquidity, uint256 shortfall) = comptrollerLens.getHypotheticalAccountLiquidity(
              //         address(this),
              //         account,
              //         vTokenModify,
              //         redeemTokens,
              //         borrowAmount
              //     );
              //     return (Error(err), liquidity, shortfall);
              // }
              //
              //
                // ComptrollerLens.sol
                //   /**
                //  * @notice Computes the hypothetical liquidity and shortfall of an account given a hypothetical borrow
                //  *      A snapshot of the account is taken and the total borrow amount of the account is calculated
                //  * @param comptroller Address of comptroller
                //  * @param account Address of the borrowed vToken
                //  * @param vTokenModify Address of collateral for vToken
                //  * @param redeemTokens Number of vTokens being redeemed
                //  * @param borrowAmount Amount borrowed
                //  * @return Returns a tuple of error code, liquidity, and shortfall
                //  */
                  // /**
                  //  * @dev Local vars for avoiding stack-depth limits in calculating account liquidity.
                  //  *  Note that `vTokenBalance` is the number of vTokens the account owns in the market,
                  //  *  whereas `borrowBalance` is the amount of underlying that the account has borrowed.
                  //  */
                  // struct AccountLiquidityLocalVars {
                  //   uint sumCollateral;
                  //   uint sumBorrowPlusEffects;
                  //   uint vTokenBalance;
                  //   uint borrowBalance;
                  //   uint exchangeRateMantissa;
                  //   uint oraclePriceMantissa;
                  //   Exp collateralFactor;
                  //   Exp exchangeRate;
                  //   Exp oraclePrice;
                  //   Exp tokensToDenom;
                  // }
      // node: Khi tắt đi thì sẽ phải check xem có bị thiếu hụt hay không có nghĩa là sẽ
      //        phải check thứ tự hoạt động của colleral

    // 4. Trả về true nếu người gửi chưa tham gia Market
  }
test()