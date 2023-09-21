import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { Contract, Interface } from "ethers";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
import BEP20ABI from "../../abis/BEP20.json";
import OracleABI from "../../abis/AaveOracle.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import _ from "lodash";
import { DetailTokenInPool, TokenData } from "../../State/SmartWalletState";
import MultiCallABI from "../../abis/Multicall.json";
import BigNumber from "bignumber.js";
import OraclePrice from "../../utils/oraclePrice";


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
  _tokenAddress: EthAddress
) {
  try {
    const appState = { ...appState1 };
    let tokenAddress = convertHexStringToAddress(_tokenAddress);
    let tokenAddressState = tokenAddress.toLowerCase();

    if (!appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
      && appState.smartWalletState.detailTokenInPool.get(tokenAddressState)!.tToken == undefined) {
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
          appState.smartWalletState.address
        );

        const tokenDecimal = await tTokenContract.decimals();
        const tTokenTotalSupply = await tTokenContract.totalSupply();

        let binaryAssetConfig = BigNumber(reserveData[0]).toString(2);
        if (binaryAssetConfig.length < 80) {
          binaryAssetConfig = "0".repeat(80 - binaryAssetConfig.length) + binaryAssetConfig;
        }
        const maxLTV = parseInt(binaryAssetConfig.slice(-15), 2);
        const liqThres = parseInt(binaryAssetConfig.slice(-31, -16), 2);

        appState.smartWalletState.detailTokenInPool =
          appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
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

async function updateTokenInPoolInfo(
  appState: ApplicationState
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
  console.log("tTokenList", tTokenList)
  console.log("dTokenList", dTokenList)

  let [tTokenBalance, tTokenDecimal, tTokenTotalSupply, originInTTokenBalance, dTokenBalance, dTokenDecimal, dTokenTotalSupply, originInDTokenBalance] = await Promise.all([
    multiCall(
      BEP20ABI,
      tTokenList.map((address: string, _: number) => ({
        address: address,
        name: "balanceOf",
        params: [appState.smartWalletState.address],
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
        params: [appState.smartWalletState.address],
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
  let tToken: TokenData;
  let dToken: TokenData;
  for (let i = 0; i < reverseList.length; i++) {
    if (
      !appState.smartWalletState.detailTokenInPool.has(reverseList[i].toString().toLowerCase())
    ) {
      let tokenInPool = appState.smartWalletState.detailTokenInPool.get(reverseList[i].toString().toLowerCase());

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

      appState.smartWalletState.detailTokenInPool.set(reverseList[i].toString().toLowerCase(), {
        decimals: tokenDecimal[i].toString(),
        tToken: tToken,
        dToken: dToken,
        maxLTV: maxLTV.toFixed(0),
        liqThres: liqThres.toFixed(0),
        price: tokenPriceData[i].toString()
      });
    }
  }
  return appState
}
// call this before all actions
export async function updateTravaLPInfo(
  appState1: ApplicationState,
  userAddress: EthAddress,
  market?: EthAddress
): Promise<ApplicationState> {
  const appState = { ...appState1 };
  try {
    // first update token in pool balances
    const TravaLendingPool = new Contract(
      getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
      ABITravaLP,
      appState.web3!
    );

    const reserveAddressList = await TravaLendingPool.getReservesList();

    let [userTokenInPoolBalance, smartWalletTokenInPoolBalance,] = await Promise.all([
      multiCall(
        BEP20ABI,
        reserveAddressList.map((address: string, _: number) => ({
          address: address,
          name: "balanceOf",
          params: [appState.walletState.address],
        })),
        appState.web3,
        appState.chainId
      ),
      multiCall(
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
    const userData = await TravaLendingPool.getUserAccountData(userAddress);

    // update appState for wallet
    appState.walletState.travaLPState.totalCollateralUSD =
      String(userData.totalCollateralUSD);
    appState.walletState.travaLPState.totalDebtUSD = String(userData.totalDebtUSD);
    appState.walletState.travaLPState.availableBorrowsUSD =
      String(userData.availableBorrowsUSD);
    appState.walletState.travaLPState.currentLiquidationThreshold =
      userData.currentLiquidationThreshold;
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

    await updateTokenInPoolInfo(appState)
    return appState;
  } catch (e) {
    console.log(e);
    return appState1;
  }
}

const multiCall = async (abi: any, calls: any, provider: any, chainId: any) => {
  let _provider = provider;
  const multi = new Contract(
    getAddr("MULTI_CALL_ADDRESS", chainId),
    MultiCallABI,
    _provider
  );
  const itf = new Interface(abi);

  const callData = calls.map((call: any) => [
    call.address.toLowerCase(),
    itf.encodeFunctionData(call.name as string, call.params),
  ]);
  const { returnData } = await multi.aggregate(callData);
  return returnData.map((call: any, i: any) =>
    itf.decodeFunctionResult(calls[i].name, call)
  );
};

export async function updateMaxRewardCanClaims(appState1: ApplicationState) {
  try {
    const appState = { ...appState1 };
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
    appState.smartWalletState.maxRewardCanClaim = maxRewardCanGet.toString();
    return appState;
  } catch (error) {
    throw new Error("Can't update LP tToken info !");
  }
}

export async function updateRTravaAndTravaForReward(
  appState1: ApplicationState
) {
  try {
    const appState = { ...appState1 };
    const incentiveContract = new Contract(
      getAddr("INCENTIVE_CONTRACT", appState.chainId),
      IncentiveContractABI,
      appState.web3!
    );
    const rTravaAddress = await incentiveContract.REWARD_TOKEN();

    const rTravaContract = new Contract(rTravaAddress, BEP20ABI, appState.web3);
    const rTravaBalance = await rTravaContract.balanceOf(
      appState.smartWalletState.address
    );
    const rTravaBalance2 = await rTravaContract.balanceOf(
      appState.walletState.address
    );

    const travaContract = new Contract(
      getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId),
      BEP20ABI,
      appState.web3
    );
    const travaBalance = await travaContract.balanceOf(
      appState.smartWalletState.address
    );
    const travaBalance2 = await travaContract.balanceOf(
      appState.walletState.address
    );

    appState.smartWalletState.tokenBalances.set(
      getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase(),
      travaBalance.toString()
    );
    appState.walletState.tokenBalances.set(
      getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase(),
      travaBalance2.toString()
    );
    appState.smartWalletState.tokenBalances.set(
      String(rTravaAddress).toLowerCase(),
      rTravaBalance.toString()
    );
    appState.walletState.tokenBalances.set(
      String(rTravaAddress).toLowerCase(),
      rTravaBalance2.toString()
    );
    return appState;
  } catch (error) {
    throw new Error("Can't update LP tToken info !");
  }
}
