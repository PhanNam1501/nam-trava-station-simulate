import { EthAddress } from "../../../utils/types";
import { ApplicationState } from "../../../State/ApplicationState";
import { Contract } from "ethers";
import ABITravaLP from "../../../abis/TravaLendingPool.json";
import IncentiveContractABI from "../../../abis/IncentiveContract.json";
import BEP20ABI from "../../../abis/BEP20.json";
import OracleABI from "../../../abis/AaveOracle.json";
import { convertHexStringToAddress, getAddr } from "../../../utils/address";
import _ from "lodash";
import { TokenInPoolData } from "../../../State/SmartWalletState";
import BigNumber from "bignumber.js";
import OraclePrice from "../../../utils/oraclePrice";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../../basic/UpdateStateAccount";
import { calculateMaxRewards } from "./SimulationWalletTravaLP";
import { getMode, multiCall } from "../../../utils/helper";
import { wallet_mode } from "orchai-combinator-bsc-simulation/esm/utils/types";


export async function getTokenBalance(appState: ApplicationState, tokenAddress: EthAddress) {
  const tokenContract = new Contract(
    tokenAddress,
    BEP20ABI,
    appState.web3
  );

  const tokenBalance = await tokenContract.balanceOf(
    appState.smartWalletState.address
  );

  const tokenDecimal = await tokenContract.decimals();

  return {
    address: String(tokenAddress).toLowerCase(),
    balance: String(tokenBalance),
    decimal: String(tokenDecimal)
  }
}

export async function updateLPtTokenInfo(
  appState1: ApplicationState,
  _tokenAddress: EthAddress,
  _from: EthAddress
) {
  try {
    const appState = { ...appState1 };
    let tokenAddress = convertHexStringToAddress(_tokenAddress);
    let tokenAddressState = tokenAddress.toLowerCase();
    let modeFrom =getMode(appState,_from);

    if (!appState[modeFrom].detailTokenInPool.has(tokenAddressState)
      && appState[modeFrom].detailTokenInPool?.get(tokenAddressState)?.tToken == undefined) {
      let tokenPrice = appState[modeFrom].detailTokenInPool.get(tokenAddressState)?.price;
      if (tokenPrice == undefined) {
        const oraclePrice = new OraclePrice(
          getAddr("ORACLE_ADDRESS", appState.chainId),
          appState.web3!
        );
        tokenPrice = String(await oraclePrice.getAssetPrice(tokenAddress));
      }

      const travaLP = new Contract(
        getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
        ABITravaLP,
        appState.web3!
      );

      let reverseList = await travaLP.getReservesList();


      if (
        reverseList.includes(tokenAddress)
      ) {
        // get reserve data
        const reserveData = await travaLP.getReserveData(tokenAddress);

        // token address
        const tTokenAddress = String(reserveData[6]).toLowerCase();

        const originTokenContract = new Contract(
          tokenAddress,
          BEP20ABI,
          appState.web3
        );

        const originTokenDecimal = await originTokenContract.decimals();
        const originBalanceInTToken = await originTokenContract.balanceOf(
          tTokenAddress
        );

        // get amount
        const tTokenContract = new Contract(
          tTokenAddress,
          BEP20ABI,
          appState.web3
        );

        const tTokenBalance = await tTokenContract.balanceOf(
          appState[modeFrom].address
        );

        const tokenDecimal = await tTokenContract.decimals();
        const tTokenTotalSupply = await tTokenContract.totalSupply();

        let binaryAssetConfig = BigNumber(reserveData[0]).toString(2);
        if (binaryAssetConfig.length < 80) {
          binaryAssetConfig = "0".repeat(80 - binaryAssetConfig.length) + binaryAssetConfig;
        }
        const maxLTV = parseInt(binaryAssetConfig.slice(-15), 2);
        const liqThres = parseInt(binaryAssetConfig.slice(-31, -16), 2);

        appState[modeFrom].detailTokenInPool =
          appState[modeFrom].detailTokenInPool.set(tokenAddressState, {
            decimals: originTokenDecimal,
            tToken: {
              address: tTokenAddress.toLowerCase(),
              balances: tTokenBalance.toString(),
              decimals: tokenDecimal.toString(),
              totalSupply: tTokenTotalSupply.toString(),
              originToken: {
                balances: originBalanceInTToken.toString()
              }
            },
            dToken: {
              address: "",
              balances: "",
              decimals: "",
              totalSupply: "",
              originToken: {
                balances: "",
              }
            },
            maxLTV: maxLTV.toFixed(0),
            liqThres: liqThres.toFixed(0),
            price: tokenPrice!
          });
      } else {
        throw new Error(`Can't update info of LP tToken ${tokenAddress}`);
      }
    }
    return appState;
  } catch (error) {
    throw new Error("Can't update LP tToken info !");
  }

}



export async function updateLPDebtTokenInfo(
  appState1: ApplicationState,
  _tokenAddress: EthAddress
) {
  try {
    const appState = { ...appState1 };
    let tokenAddress = convertHexStringToAddress(_tokenAddress);
    let tokenAddressState = tokenAddress.toLowerCase();

    if (!appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
      && appState.smartWalletState.detailTokenInPool.get(tokenAddressState)!.dToken == undefined) {
      let tokenPrice = appState.smartWalletState.detailTokenInPool.get(tokenAddressState)?.price;
      if (tokenPrice == undefined) {
        const oraclePrice = new OraclePrice(
          getAddr("ORACLE_ADDRESS", appState.chainId),
          appState.web3!
        );
        tokenPrice = String(await oraclePrice.getAssetPrice(tokenAddress));
      }

      const travaLP = new Contract(
        getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
        ABITravaLP,
        appState.web3!
      );
      let reverseList = await travaLP.getReservesList();


      if (reverseList.includes(tokenAddress)) {

        // get reserve data
        const reserveData = await travaLP.getReserveData(tokenAddress);


        // token address
        const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();

        const originTokenContract = new Contract(
          tokenAddress,
          BEP20ABI,
          appState.web3
        );

        const originTokenDecimal = await originTokenContract.decimals();
        const originBalanceInDToken = await originTokenContract.balanceOf(
          variableDebtTokenAddress
        );
        // get amount
        const debtTokenContract = new Contract(
          variableDebtTokenAddress,
          BEP20ABI,
          appState.web3
        );

        const debtTokenBalance = await debtTokenContract.balanceOf(
          appState.smartWalletState.address
        );

        const tokenDecimal = await debtTokenContract.decimals();
        const dTokenTotalSupply = await debtTokenContract.totalSupply();

        let binaryAssetConfig = BigNumber(reserveData[0]).toString(2);
        if (binaryAssetConfig.length < 80) {
          binaryAssetConfig = "0".repeat(80 - binaryAssetConfig.length) + binaryAssetConfig;
        }
        const maxLTV = parseInt(binaryAssetConfig.slice(-15), 2);
        let liqThres = parseInt(binaryAssetConfig.slice(-31, -16), 2);
        appState.smartWalletState.detailTokenInPool =
          appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
            decimals: originTokenDecimal,
            dToken: {
              address: variableDebtTokenAddress.toLowerCase(),
              balances: debtTokenBalance.toString(),
              decimals: tokenDecimal.toString(),
              totalSupply: dTokenTotalSupply.toString(),
              originToken: {
                balances: originBalanceInDToken.toString(),
              }
            },
            tToken: {
              address: "",
              balances: "",
              decimals: "",
              totalSupply: "",
              originToken: {
                balances: ""
              }
            },
            maxLTV: maxLTV.toFixed(0),
            liqThres: liqThres.toFixed(0),
            price: tokenPrice!
          });
      } else {
        throw new Error(`Can't update info of LP Debt Token ${tokenAddress}`);
      }
    }

    return appState;
  } catch (error) {
    throw new Error("Can't update LP Debt Token info !");
  }
}

export async function updateTokenInPoolInfo(
  appState: ApplicationState,
  _from: EthAddress
) {
  // console.log("???? ")
  // const appState = { ...appState1 };
  const travaLP = new Contract(
    getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
    ABITravaLP,
    appState.web3!
  );
  let reverseList = await travaLP.getReservesList();
  reverseList = reverseList.map((e: string) => e.toLowerCase());
  let [reserveData, tokenPriceData, tokenDecimal] = await Promise.all([
    multiCall(
      ABITravaLP,
      reverseList.map((address: string, _: number) => ({
        address: getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
        name: "getReserveData",
        params: [address],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      OracleABI,
      reverseList.map((address: string, _: number) => ({
        address: getAddr("ORACLE_ADDRESS", appState.chainId),
        name: "getAssetPrice",
        params: [address],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      BEP20ABI,
      reverseList.map((address: string, _: number) => ({
        address: address,
        name: "decimals",
        params: [],
      })),
      appState.web3,
      appState.chainId
    ),
  ]);
  reserveData = reserveData.flat();



  let tTokenList = [] as Array<string>;
  let dTokenList = [] as Array<string>;
  for (const r of reserveData) {
    tTokenList.push(r[6]);
    dTokenList.push(r[7]);
  }

  let modeFrom = getMode(appState, _from);

  let [tTokenBalance, tTokenDecimal, tTokenTotalSupply, originInTTokenBalance, dTokenBalance, dTokenDecimal, dTokenTotalSupply, originInDTokenBalance] = await Promise.all([
    multiCall(
      BEP20ABI,
      tTokenList.map((address: string, _: number) => ({
        address: address,
        name: "balanceOf",
        params: [appState[modeFrom].address],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      BEP20ABI,
      tTokenList.map((address: string, _: number) => ({
        address: address,
        name: "decimals",
        params: [],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      BEP20ABI,
      tTokenList.map((address: string, _: number) => ({
        address: address,
        name: "totalSupply",
        params: [],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      BEP20ABI,
      reverseList.map((address: string, index: number) => ({
        address: address,
        name: "balanceOf",
        params: [tTokenList[index]],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      BEP20ABI,
      dTokenList.map((address: string, _: number) => ({
        address: address,
        name: "balanceOf",
        params: [appState[modeFrom].address],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      BEP20ABI,
      dTokenList.map((address: string, _: number) => ({
        address: address,
        name: "decimals",
        params: [],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      BEP20ABI,
      dTokenList.map((address: string, _: number) => ({
        address: address,
        name: "totalSupply",
        params: [],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      BEP20ABI,
      reverseList.map((address: string, index: number) => ({
        address: address,
        name: "balanceOf",
        params: [dTokenList[index]],
      })),
      appState.web3,
      appState.chainId
    ),
  ]);

  let binaryAssetConfig;
  let maxLTV;
  let liqThres;
  let tToken: TokenInPoolData;
  let dToken: TokenInPoolData;
  for (let i = 0; i < reverseList.length; i++) {
    if (
      !appState[modeFrom].detailTokenInPool.has(reverseList[i].toString().toLowerCase())
    ) {
      let tokenInPool = appState[modeFrom].detailTokenInPool.get(reverseList[i].toString().toLowerCase());

      binaryAssetConfig = BigNumber(reserveData[i][0]).toString(2);
      if (binaryAssetConfig.length < 80) {
        binaryAssetConfig = "0".repeat(80 - binaryAssetConfig.length) + binaryAssetConfig;
      }
      maxLTV = parseInt(binaryAssetConfig.slice(-15), 2);
      liqThres = parseInt(binaryAssetConfig.slice(-31, -16), 2);

      tToken = {
        address: tTokenList[i].toString().toLowerCase(),
        balances: tTokenBalance[i].toString(),
        decimals: tTokenDecimal[i].toString(),
        totalSupply: tTokenTotalSupply[i].toString(),
        originToken: {
          balances: originInTTokenBalance[i].toString(),
        }
      }

      dToken = {
        address: dTokenList[i].toString().toLowerCase(),
        balances: dTokenBalance[i].toString(),
        decimals: dTokenDecimal[i].toString(),
        totalSupply: dTokenTotalSupply[i].toString(),
        originToken: {
          balances: originInDTokenBalance[i].toString(),
        }
      }

      if (tokenInPool?.tToken) {
        tToken = tokenInPool!.tToken
      }

      if (tokenInPool?.dToken) {
        dToken = tokenInPool!.dToken
      }

      appState[modeFrom].detailTokenInPool.set(reverseList[i].toString().toLowerCase(), {
        decimals: tokenDecimal[i].toString(),
        tToken: tToken,
        dToken: dToken,
        maxLTV: maxLTV.toFixed(0),
        liqThres: liqThres.toFixed(0),
        price: tokenPriceData[i].toString()
      });
    }
  }

  if (appState[modeFrom].travaLPState.lpReward.claimableReward == "") {
    const travaIncentiveContract = new Contract(
      getAddr("INCENTIVE_CONTRACT", appState.chainId),
      IncentiveContractABI,
      appState.web3!
    );
    
    let maxRewardCanGet = await calculateMaxRewards(appState);
    const rTravaAddress = await travaIncentiveContract.REWARD_TOKEN();

    appState[modeFrom].travaLPState.lpReward.claimableReward = maxRewardCanGet.toString();
    appState[modeFrom].travaLPState.lpReward.tokenAddress = String(rTravaAddress).toLowerCase();
  }

  return appState
}
// call this before all actions
export async function updateTravaLPInfo(
  appState1: ApplicationState,
  market?: EthAddress
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    // first update token in pool balances
    if (market == undefined) {
      market = getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId);
    }
    const TravaLendingPool = new Contract(
      market!,
      ABITravaLP,
      appState.web3!
    );
    const reserveAddressList = await TravaLendingPool.getReservesList(); //danh sách địa chỉ tài sản dự trữ trong LP
    let [userTokenInPoolBalance, smartWalletTokenInPoolBalance,] = await Promise.all([
      // gọi cùng 1 phương thức 'balanceOf' trên tất cả địa chỉ tài sản dự trữ
      multiCall( //lấy số dư của người dùng
        BEP20ABI,
        reserveAddressList.map((address: string, _: number) => ({
          address: address,
          name: "balanceOf",
          params: [appState.walletState.address],
        })),
        appState.web3,
        appState.chainId
      ),
      multiCall(//lấy số dư smart wallet
        BEP20ABI,
        reserveAddressList.map((address: string, _: number) => ({
          address: address,
          name: "balanceOf",
          params: [appState.smartWalletState.address],
        })),
        appState.web3,
        appState.chainId
      )
    ]);    

    if (reserveAddressList.length == 0) {
      throw new Error("No reserve in TravaLP");
    }
    // update balance for wallet
    for (let i = 0; i < reserveAddressList.length; i++) {
      // update token balance for wallet
      let reserveAddress = reserveAddressList[i].toString().toLowerCase();
      // const reserve = new Contract(reserveAddress, BEP20ABI, appState.web3);
      // reserveAddress = String(reserveAddress).toLowerCase();
      if (
        String(appState.walletState.tokenBalances.get(reserveAddress)!) ==
        "undefined"
      ) {
        appState.walletState.tokenBalances.set(
          reserveAddress,
          userTokenInPoolBalance[i].toString()
        );
      }

      if (
        String(appState.smartWalletState.tokenBalances.get(reserveAddress)!) ==
        "undefined"
      ) {
        appState.smartWalletState.tokenBalances.set(
          reserveAddress,
          smartWalletTokenInPoolBalance[i].toString()
        );
      }
    }

    // second update TravaLP state for wallet
    const userData = await TravaLendingPool.getUserAccountData(appState.walletState.address);

    // update appState for wallet
    appState.walletState.travaLPState.totalCollateralUSD =
      String(userData.totalCollateralUSD);
    appState.walletState.travaLPState.totalDebtUSD = String(userData.totalDebtUSD);
    appState.walletState.travaLPState.availableBorrowsUSD =
      String(userData.availableBorrowsUSD);
    appState.walletState.travaLPState.currentLiquidationThreshold =
    String(userData.currentLiquidationThreshold);
    appState.walletState.travaLPState.healthFactor = String(userData.healthFactor);
    appState.walletState.travaLPState.ltv = String(userData.ltv);

    // third update TravaLP state for smart wallet
    const smartWalletData = await TravaLendingPool.getUserAccountData(
      appState.smartWalletState.address
    );

    // update appState for smart wallet
    appState.smartWalletState.travaLPState.totalCollateralUSD =
      String(smartWalletData.totalCollateralUSD);
    appState.smartWalletState.travaLPState.totalDebtUSD =
      String(smartWalletData.totalDebtUSD);
    appState.smartWalletState.travaLPState.availableBorrowsUSD =
      String(smartWalletData.availableBorrowsUSD);
    appState.smartWalletState.travaLPState.currentLiquidationThreshold =
      String(smartWalletData.currentLiquidationThreshold);
    appState.smartWalletState.travaLPState.healthFactor =
      String(smartWalletData.healthFactor);
    appState.smartWalletState.travaLPState.ltv = String(smartWalletData.ltv);

    await updateTokenInPoolInfo(appState, appState.walletState.address);
    await updateTokenInPoolInfo(appState, appState.smartWalletState.address);

    return appState;
  } catch (e) {
    console.log(e);
    return appState1;
  }
}

export async function updateMaxRewardCanClaims(appState1: ApplicationState) {
  try {
    const appState = { ...appState1 };
    if (appState.smartWalletState.travaLPState.lpReward.claimableReward == "") {
      const travaLP = new Contract(
        getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
        ABITravaLP,
        appState.web3!
      );
      let reverseList = await travaLP.getReservesList();
      reverseList = reverseList.map((e: string) => e.toLowerCase());

      let [reserveData] = await Promise.all([
        multiCall(
          ABITravaLP,
          reverseList.map((address: string, _: number) => ({
            address: getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
            name: "getReserveData",
            params: [address],
          })),
          appState.web3,
          appState.chainId
        ),
      ]);
      reserveData = reserveData.flat();
      // console.log("reserveData", reserveData);

      let tTokenList = [] as Array<string>;
      let dTokenList = [] as Array<string>;
      for (const r of reserveData) {
        tTokenList.push(r[6]);
        dTokenList.push(r[7]);
      }


      const travaIncentiveContract = new Contract(
        getAddr("INCENTIVE_CONTRACT", appState.chainId),
        IncentiveContractABI,
        appState.web3!
      );
      let maxRewardCanGet = await travaIncentiveContract.getRewardsBalance(
        tTokenList.concat(dTokenList),
        appState.smartWalletState.address
      );
      appState.smartWalletState.travaLPState.lpReward.claimableReward = maxRewardCanGet.toString();
    }
    return appState;
  } catch (error) {
    throw new Error("Can't update LP tToken info !");
  }
}

export async function updateRTravaAndTravaForReward(
  appState1: ApplicationState
) {
  try {
    let appState = { ...appState1 };
    const incentiveContract = new Contract(
      getAddr("INCENTIVE_CONTRACT", appState.chainId),
      IncentiveContractABI,
      appState.web3!
    );
    const rTravaAddress = await incentiveContract.REWARD_TOKEN();

    appState = await updateUserTokenBalance(appState, rTravaAddress);
    appState = await updateSmartWalletTokenBalance(appState, rTravaAddress);

    appState = await updateUserTokenBalance(appState, getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId));
    appState = await updateSmartWalletTokenBalance(appState, getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId));

    appState.smartWalletState.travaLPState.lpReward.tokenAddress = String(rTravaAddress).toLowerCase();
    return appState;
  } catch (error) {
    throw new Error("Can't update LP tToken info !");
  }
}
