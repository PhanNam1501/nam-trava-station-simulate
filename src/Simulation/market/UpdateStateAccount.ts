import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { Contract, Interface } from "ethers";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
import BEP20ABI from "../../abis/BEP20.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import _ from "lodash";
import { DetailTokenInPool } from "../../State/SmartWalletState";
import MultiCallABI from "../../abis/Multicall.json";

export async function updateLPtTokenInfo(
  appState1: ApplicationState,
  _tokenAddress: EthAddress
) {
  try {
    const appState = { ...appState1 };

    const travaLP = new Contract(
      getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
      ABITravaLP,
      appState.web3!
    );

    let reverseList = await travaLP.getReservesList();

    let tokenAddress = convertHexStringToAddress(_tokenAddress);
    let tokenAddressState = tokenAddress.toLowerCase();

    if (
      reverseList.includes(tokenAddress) &&
      !appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
    ) {
      // get reserve data
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const tTokenAddress = String(reserveData[6]).toLowerCase();

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

      appState.smartWalletState.detailTokenInPool =
        appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
          tToken: {
            address: tTokenAddress.toLowerCase(),
            balances: tTokenBalance.toString(),
            decimals: tokenDecimal.toString(),
          },
          dToken: {
            address: "",
            balances: "",
            decimals: "",
          },
        });
    } else if (
      reverseList.includes(tokenAddress) &&
      appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
    ) {
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const tTokenAddress = String(reserveData[6]).toLowerCase();

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

      let tokenInfo =
        appState.smartWalletState.detailTokenInPool.get(tokenAddressState)!;

      tokenInfo.tToken = {
        address: tTokenAddress.toLowerCase(),
        balances: tTokenBalance.toString(),
        decimals: tokenDecimal.toString(),
      };

      appState.smartWalletState.detailTokenInPool.set(
        tokenAddressState,
        tokenInfo
      );
    } else {
      throw new Error(`Can't update info of LP tToken ${tokenAddress}`);
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

    const travaLP = new Contract(
      getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
      ABITravaLP,
      appState.web3!
    );

    let reverseList = await travaLP.getReservesList();

    let tokenAddress = convertHexStringToAddress(_tokenAddress);
    let tokenAddressState = tokenAddress.toLowerCase();

    if (
      reverseList.includes(tokenAddress) &&
      !appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
    ) {
      // get reserve data
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();

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

      appState.smartWalletState.detailTokenInPool =
        appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
          dToken: {
            address: variableDebtTokenAddress.toLowerCase(),
            balances: debtTokenBalance.toString(),
            decimals: tokenDecimal.toString(),
          },
          tToken: {
            address: "",
            balances: "",
            decimals: "",
          },
        });
    } else if (
      reverseList.includes(tokenAddress) &&
      appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
    ) {
      const reserveData = await travaLP.getReserveData(tokenAddress);

      // token address
      const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();

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

      let tokenInfo =
        appState.smartWalletState.detailTokenInPool.get(tokenAddressState)!;
      tokenInfo.dToken = {
        address: variableDebtTokenAddress.toLowerCase(),
        balances: debtTokenBalance.toString(),
        decimals: tokenDecimal.toString(),
      };

      appState.smartWalletState.detailTokenInPool.set(
        tokenAddressState,
        tokenInfo
      );
    } else {
      throw new Error(`Can't update info of LP Debt Token ${tokenAddress}`);
    }

    return appState;
  } catch (error) {
    throw new Error("Can't update LP Debt Token info !");
  }
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
    if (reserveAddressList.length == 0) {
      throw new Error("No reserve in TravaLP");
    }
    // update balance for wallet
    for (let i = 0; i < reserveAddressList.length; i++) {
      // update token balance for wallet
      let reserveAddress = reserveAddressList[i];
      const reserve = new Contract(reserveAddress, BEP20ABI, appState.web3);
      reserveAddress = String(reserveAddress).toLowerCase();
      if (
        String(appState.walletState.tokenBalances.get(reserveAddress)!) ==
        "undefined"
      ) {
        const balance = await reserve.balanceOf(userAddress);

        appState.walletState.tokenBalances.set(reserveAddress, balance);
      }

      if (
        String(appState.smartWalletState.tokenBalances.get(reserveAddress)!) ==
        "undefined"
      ) {
        // update token balance for smart wallet
        const smartWalletBalance = await reserve.balanceOf(
          appState.smartWalletState.address
        );

        appState.smartWalletState.tokenBalances.set(
          reserveAddress,
          smartWalletBalance
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
    let tTokenList = [] as Array<string>;
    let dTokenList = [] as Array<string>;
    for (const r of reserveData) {
      tTokenList.push(r[6]);
      dTokenList.push(r[7]);
    }

    // let [balanceTList] = await Promise.all([
    //   multiCall(
    //     BEP20ABI,
    //     tTokenList.map((address: string, _: number) => ({
    //       address: address,
    //       name: 'balanceOf',
    //       params: [appState.smartWalletState.address],
    //     })),
    //     appState.web3,
    //     appState.chainId
    //   ),
    // ]);
    // balanceTList = balanceTList.flat();

    // let [balanceDList] = await Promise.all([
    //   multiCall(
    //     BEP20ABI,
    //     dTokenList.map((address: string, _: number) => ({
    //       address: address,
    //       name: 'balanceOf',
    //       params: [appState.smartWalletState.address],
    //     })),
    //     appState.web3,
    //     appState.chainId
    //   ),
    // ]);
    // balanceDList = balanceDList.flat();

    // let [maxRewardCanGets] = await Promise.all([
    //   multiCall(
    //     IncentiveContractABI,
    //     reverseList.map((address: string, index: number) => ({
    //       address: getAddr("INCENTIVE_CONTRACT", appState.chainId),
    //       name: 'getRewardsBalance',
    //       params: [[tTokenList[index], dTokenList[index]], appState.smartWalletState.address],
    //     })),
    //     appState.web3,
    //     appState.chainId
    //   ),
    // ]);
    // maxRewardCanGets = maxRewardCanGets.flat();

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

    // appState.smartWalletState.detailTokenInPool = new Map();
    // let counter = 0;
    // for(const token of reverseList) {
    //   if(balanceDList[counter] > 0 || balanceTList[counter] > 0) {
    //     appState.smartWalletState.detailTokenInPool = appState.smartWalletState.detailTokenInPool.set(
    //       token,
    //       {
    //         tToken: {
    //           address: tTokenList[counter].toLowerCase(),
    //           balances: balanceTList[counter].toString(),
    //         },
    //         dToken: {
    //           address: dTokenList[counter].toLowerCase(),
    //           balances: balanceDList[counter].toString(),
    //         },
    //         maxRewardCanGet: maxRewardCanGets[counter].toString()
    //       }
    //     );
    //   }
    //   counter++;
    // }
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
