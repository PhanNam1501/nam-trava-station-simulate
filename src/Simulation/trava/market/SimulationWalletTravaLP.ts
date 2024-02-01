import { EthAddress } from "../../../utils/types";
import { ApplicationState } from "../../../State/ApplicationState";
import { convertHexStringToAddress, getAddr } from "../../../utils/address";
import { Contract } from "ethers";
import _ from "lodash";
import { MAX_UINT256, percentMul, wadDiv } from "../../../utils/config";
import IncentiveContractABI from "../../../abis/IncentiveContract.json";
import { BigNumber } from "bignumber.js";
import { updateLPDebtTokenInfo, updateLPtTokenInfo } from "./UpdateStateAccount";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../../basic/UpdateStateAccount";
import { DetailTokenInPool } from "../../../State/SmartWalletState";
import { SmartWalletState } from "orchai-combinator-bsc-simulation";
import { getMode} from "../../../utils/helper";


export async function calculateMaxRewards(appState: ApplicationState): Promise<string> {
  let listTDTokenRewardsAddress = getListTDTokenRewardsAddress(appState);
  const travaIncentiveContract = new Contract(
    getAddr("INCENTIVE_CONTRACT", appState.chainId),
    IncentiveContractABI,
    appState.web3!
  );
  let maxRewardCanGet = await travaIncentiveContract.getRewardsBalance(
    listTDTokenRewardsAddress,
    appState.smartWalletState.address
  );
  return maxRewardCanGet;
}

export function getListTDTokenRewardsAddress(appState: ApplicationState): Array<EthAddress> {
  let detailTokenInPool = appState.smartWalletState.detailTokenInPool;
  let listTDTokenRewardsAddress = new Array();
  detailTokenInPool.forEach(token => {
    if(BigNumber(token.tToken.balances).isGreaterThan(0)) {
      listTDTokenRewardsAddress.push(convertHexStringToAddress(token.tToken.address));
    }
    if(BigNumber(token.dToken.balances).isGreaterThan(0.00001)){
      listTDTokenRewardsAddress.push(convertHexStringToAddress(token.dToken.address));
    }
  })
  return listTDTokenRewardsAddress;
}

export function calculateMaxAmountSupply(appState: ApplicationState, _tokenAddress: string, mode: "walletState" | "smartWalletState"): BigNumber {
  let tokenAddress = _tokenAddress.toLowerCase();

  const walletBalance = appState[mode].tokenBalances.get(tokenAddress)!;
  if (typeof walletBalance == undefined) {
    throw new Error("Token is not init in " + mode + " state!")
  }

  let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress)!;
  if (typeof tokenInfo == undefined) {
    throw new Error("Token is not init in smart wallet lending pool state!")
  }

  return BigNumber(appState[mode].tokenBalances.get(tokenAddress)!);
}

export function calculateMaxAmountBorrow(appState: ApplicationState, _tokenAddress: string): BigNumber {
  let tokenAddress = _tokenAddress.toLowerCase();

  let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress)!;
  if (typeof tokenInfo == undefined) {
    throw new Error("Token is not init in smart wallet lending pool state!")
  }
  const tTokenReserveBalanceRaw = BigNumber(tokenInfo.tToken.originToken.balances);
  const tTokenReserveBalance = BigNumber(tTokenReserveBalanceRaw).div(BigNumber("10").pow(tokenInfo.tToken.decimals));
  const availableBorrowsUSD = BigNumber(appState.smartWalletState.travaLPState.availableBorrowsUSD);
  const nativeAvailableBorrow = availableBorrowsUSD.div(tokenInfo.price);
  return BigNumber.max(BigNumber.min(nativeAvailableBorrow, tTokenReserveBalance), 0).multipliedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
}

export function calculateMaxAmountRepay(appState: ApplicationState, _tokenAddress: string, mode: "walletState" | "smartWalletState"): BigNumber {
  let tokenAddress = _tokenAddress.toLowerCase();

  const walletBalance = appState[mode].tokenBalances.get(tokenAddress)!;
  if (typeof walletBalance == undefined) {
    throw new Error("Token is not init in " + mode + " state!")
  }

  let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress.toLowerCase())!;
  if (typeof tokenInfo == undefined) {
    throw new Error("Token is not init in smart wallet lending pool state!")
  }
  let dTokenBalance = tokenInfo.dToken.balances;
  const borrowed = new BigNumber(dTokenBalance);

  return BigNumber.max(BigNumber.min(walletBalance, borrowed), 0);
}

export function calculateMaxAmountWithdraw(appState: ApplicationState, _tokenAddress: string): BigNumber {
  let tokenAddress = _tokenAddress.toLowerCase();
  let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress.toLowerCase())!;

  if (typeof tokenInfo == undefined) {
    throw new Error("Token is not init in smart wallet lending pool state!")
  }
  const depositedRaw = tokenInfo.tToken.balances;
  const deposited = BigNumber(depositedRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));

  const tTokenReserveBalanceRaw = tokenInfo.tToken.originToken.balances;
  const tTokenReserveBalance = BigNumber(tTokenReserveBalanceRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));

  let nativeAvailableWithdraw = BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD)
    .minus(BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD).div(BigNumber(appState.smartWalletState.travaLPState.ltv)))
    .div(tokenInfo.price);
  const available = BigNumber(tokenInfo.tToken.totalSupply).minus(tokenInfo.dToken.totalSupply).div(tokenInfo.price);

  if (nativeAvailableWithdraw.isNaN()) {
    nativeAvailableWithdraw = BigNumber(0);
  }

  return BigNumber.max(
    BigNumber.min(deposited, nativeAvailableWithdraw, tTokenReserveBalance, available),
    0
  ).multipliedBy(BigNumber("10").pow(tokenInfo.tToken.decimals))
}


export function calculateNewAvailableBorrow(newTotalCollateral: BigNumber, newLTV: BigNumber, newTotalDebt: BigNumber): BigNumber {
  return percentMul(
    newTotalCollateral,
    newLTV
  )
    .minus(newTotalDebt)
}
export function calculateNewHealFactor(newTotalCollateral: BigNumber, newLiquidationThreshold: BigNumber, newTotalDebt: BigNumber): BigNumber {
  if (newTotalDebt.toFixed(0) == "0") {
    return BigNumber(MAX_UINT256)
  }
  return wadDiv(
    percentMul(
      newTotalCollateral,
      newLiquidationThreshold
    ),
    newTotalDebt
  )
}
// ltv = sum(C[i] * ltv[i]) / sum(C[i]) with C[i] is colleteral of token[i] and ltv[i] is ltv of this token
// <=> oldLtv = sum(C[i] * ltv[i]) / oldTotalColleteral
// newLTV = (sum(C[i] * ltv[i]) + (new C'[i] * ltv[i] )) /(oldTotalColleteral + C'[i])
// => newLTV = (oldLTV * oldTotalColleteral + new C'[i] * ltv[i]) / newTotalColleteral
// <=> newLTV = (oldLTV * oldTotalColleteral + new amount * tokenPrice[i] / tokenDecimal[i]) / newTOtalColleteral
// if amount == 0, LTV is unchanged
export function calculateNewLTV(oldTotalColleteral: BigNumber, oldLTV: BigNumber, newTotalCollateral: BigNumber, tokenLTV: BigNumber): BigNumber {
  let usd_changed = newTotalCollateral.minus(oldTotalColleteral);
  if (usd_changed.toFixed(0) == "0") {
    return oldLTV;
  }

  if (newTotalCollateral.toFixed(0) == "0") {
    return BigNumber(0);
  }

  let newLTV = oldTotalColleteral
    .multipliedBy(oldLTV)
    .plus(usd_changed.multipliedBy(tokenLTV))
    .div(newTotalCollateral)
  return newLTV
}

//liquid threshold has a formula like LTV
export function calculateNewLiquidThreshold(oldTotalColleteral: BigNumber, oldLiqThres: BigNumber, newTotalCollateral: BigNumber, tokenLiqThres: BigNumber): BigNumber {
  if (newTotalCollateral.toFixed(0) == "0") {
    return BigNumber(0);
  }
  let usd_changed = newTotalCollateral.minus(oldTotalColleteral);
  let newLiqThres = oldTotalColleteral
    .multipliedBy(oldLiqThres)
    .plus(usd_changed.multipliedBy(tokenLiqThres))
    .div(newTotalCollateral)
  return newLiqThres
}

export function getBalanceUsdFromAmount(amount: BigNumber, tokenInfo: DetailTokenInPool): BigNumber {
  //get token decimals
  const tokenDecimal = tokenInfo.tToken.decimals;
  const originTokenDecimal = BigNumber(
    Math.pow(10, parseInt(tokenDecimal!))
  );

  const tokenPrice = tokenInfo.price;
  const balanceUSD = amount
    .multipliedBy(tokenPrice)
    .div(originTokenDecimal)
  return balanceUSD
}

export function getAmountFromBalanceUsd(balanceUsd: BigNumber, tokenInfo: DetailTokenInPool): BigNumber {
  //get token decimals
  const tokenDecimal = tokenInfo.tToken.decimals;
  const originTokenDecimal = BigNumber(
    Math.pow(10, parseInt(tokenDecimal!))
  );

  const tokenPrice = tokenInfo.price;
  const amount = balanceUsd
    .multipliedBy(originTokenDecimal)
    .div(tokenPrice)
  return amount
}

export async function SimulationSupply(
  appState1: ApplicationState,
  _from: EthAddress,
  _tokenAddress: EthAddress,
  _amount: string
): Promise<ApplicationState> {
  try {
    let amount = BigNumber(_amount);
    const appState = { ...appState1 };

    _tokenAddress = _tokenAddress.toLowerCase();

    if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {

      // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
      if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
        await updateUserTokenBalance(appState, _tokenAddress);
      }

      if (
        amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)
      ) {
        amount = calculateMaxAmountSupply(appState, _tokenAddress, "walletState")

      }

      // get token amount
      const tokenAmount = BigNumber(
        appState.walletState.tokenBalances.get(_tokenAddress)!
      );
      // check amount tokenName on appState is enough .Before check convert string to number
      // if (tokenAmount >= BigInt(amount)) {
      // update appState amount tokenName
      const newAmount = tokenAmount.minus(amount).toFixed(0);
      appState.walletState.tokenBalances.set(_tokenAddress, newAmount);

    } else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      // console.log("amount", amount.toFixed(0))
      // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
      if (!appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
        await updateSmartWalletTokenBalance(appState, _tokenAddress);
      }

      if (
        amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)
      ) {
        amount = calculateMaxAmountSupply(appState, _tokenAddress, "smartWalletState")
      }
      // get token amount
      const tokenAmount = appState.smartWalletState.tokenBalances.get(_tokenAddress)!;
      // check amount tokenName on appState is enough .Before check convert string to number
      // if (tokenAmount >= BigInt(amount)) {
      // update appState amount tokenName
      const newAmount = BigNumber(tokenAmount).minus(amount);
      appState.smartWalletState.tokenBalances.set(_tokenAddress, newAmount.toFixed(0));
    }

    // check tokenAddress is exist on reverseList
    if (!appState.smartWalletState.detailTokenInPool.has(_tokenAddress)) {
      await updateLPtTokenInfo(appState, _tokenAddress, "smartWalletState");
    }

    //Update Smart Wallet Position
    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

    let supplyUSD = getBalanceUsdFromAmount(BigNumber(amount), tokenInfo);

    let oldTotalCollateralUSD = appState.smartWalletState.travaLPState.totalCollateralUSD;
    // newTotalCollateral = oldTotalCOlletearl + amountToken * price / its decimal
    let newTotalCollateralUSD = BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD)
      .plus(supplyUSD)

    let oldLTV = appState.smartWalletState.travaLPState.ltv;
    let newLTV = calculateNewLTV(BigNumber(oldTotalCollateralUSD), BigNumber(oldLTV), newTotalCollateralUSD, BigNumber(tokenInfo.maxLTV))


    //Calculate liquid threshold
    let oldLiquidTreshold = appState.smartWalletState.travaLPState.currentLiquidationThreshold;
    let newLiquidTreshold = calculateNewLiquidThreshold(BigNumber(oldTotalCollateralUSD), BigNumber(oldLiquidTreshold), newTotalCollateralUSD, BigNumber(tokenInfo.liqThres));


    // update state of smart wallet trava lp
    // update healthFactor .((deposited + amount * asset.price) * currentLiquidationThreshold) / borrowe
    // if totalDebtUSD = 0  , not update healthFactor
    const healthFactor = calculateNewHealFactor(newTotalCollateralUSD, newLiquidTreshold, BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD));
    const availableBorrowsUSD = calculateNewAvailableBorrow(newTotalCollateralUSD, newLTV, BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD));

    appState.smartWalletState.travaLPState.totalCollateralUSD = newTotalCollateralUSD.toFixed(0);
    appState.smartWalletState.travaLPState.currentLiquidationThreshold = newLiquidTreshold.toFixed(0);
    appState.smartWalletState.travaLPState.ltv = newLTV.toFixed(0);
    appState.smartWalletState.travaLPState.healthFactor = healthFactor.toFixed(0);
    appState.smartWalletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0)

    tokenInfo.tToken = {
      address: tokenInfo.tToken.address,
      decimals: tokenInfo.tToken.decimals,
      balances: BigNumber(tokenInfo.tToken.balances).plus(amount).toFixed(0),
      totalSupply: BigNumber(tokenInfo.tToken.totalSupply).plus(supplyUSD).toFixed(0),
      originToken: {
        balances: BigNumber(tokenInfo.tToken.originToken.balances).plus(amount).toFixed(0)
      }
    };

    appState.smartWalletState.detailTokenInPool.set(
      _tokenAddress,
      tokenInfo
    );

    return appState;
  } catch (err) {
    throw err;
  }
}

// need add debt token to smart wallet state
export async function SimulationBorrow(
  appState1: ApplicationState,
  _to: EthAddress,
  _tokenAddress: EthAddress,
  _amount: string
): Promise<ApplicationState> {
  try {
    // console.log("amount", _amount)
    let amount = BigNumber(_amount);

    const appState = { ...appState1 };

    _tokenAddress = _tokenAddress.toLowerCase();

    // add debToken to smart wallet state if not exist
    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

    if (typeof tokenInfo.dToken == undefined) {
      await updateLPDebtTokenInfo(appState, _tokenAddress);
    }

    if (typeof tokenInfo.tToken == undefined) {
      await updateLPDebtTokenInfo(appState, _tokenAddress);
    }

    if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
      amount = calculateMaxAmountBorrow(
        appState,
        _tokenAddress
      )
    }

    if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      _to = appState.walletState.address;
      //  check tokenAddress is on tokenBalance of wallet
      if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
        await updateUserTokenBalance(appState, _tokenAddress);
      }

      appState.walletState.tokenBalances.set(
        _tokenAddress,
        BigNumber(appState.walletState.tokenBalances.get(_tokenAddress)!)
          .plus(amount)
          .toFixed(0)
      );
    } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      _to = appState.smartWalletState.address;

      //  check tokenAddress is on tokenBalance of smartWallet
      if (
        !appState.smartWalletState.tokenBalances.has(_tokenAddress)
      ) {
        await updateSmartWalletTokenBalance(appState, _tokenAddress);
      }

      // add debToken to smart wallet state if not exist
      appState.smartWalletState.tokenBalances.set(
        _tokenAddress,
        BigNumber(appState.smartWalletState.tokenBalances.get(_tokenAddress)!)
          .plus(amount)
          .toFixed(0)
      );
    }

    //Update Smart Wallet Position
    let borrowUSD = getBalanceUsdFromAmount(amount, tokenInfo);

    // update totalDebtUSD : borrowed + amount * asset.price
    let newTotalDebtUSD = BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD)
      .plus(borrowUSD)

    let newHealthFactor = calculateNewHealFactor(
      BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD),
      BigNumber(appState.smartWalletState.travaLPState.currentLiquidationThreshold),
      newTotalDebtUSD
    )

    // update availableBorrowUSD :  deposited * ltv - borrowed - amount * asset.price
    let newAvailableBorrow = calculateNewAvailableBorrow(
      BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD),
      BigNumber(appState.smartWalletState.travaLPState.ltv),
      newTotalDebtUSD
    )

    appState.smartWalletState.travaLPState.totalDebtUSD = newTotalDebtUSD.toFixed(0);
    appState.smartWalletState.travaLPState.availableBorrowsUSD = newAvailableBorrow.toFixed(0);
    appState.smartWalletState.travaLPState.healthFactor = newHealthFactor.toFixed(0);

    tokenInfo.dToken = {
      address: tokenInfo.dToken.address,
      decimals: tokenInfo.dToken.decimals,
      balances: BigNumber(tokenInfo.dToken.balances).plus(amount).toFixed(0),
      totalSupply: BigNumber(tokenInfo.dToken.totalSupply).plus(borrowUSD).toFixed(0),
      originToken: {
        balances: BigNumber(tokenInfo.dToken.originToken.balances).minus(amount).toFixed(0)
      }
    };

    appState.smartWalletState.detailTokenInPool.set(
      _tokenAddress,
      tokenInfo
    );
    return appState;
  } catch (err) {
    throw err;
  }
}

// need remove debt token from smart wallet state
export async function SimulationRepay(
  appState1: ApplicationState,
  _from: EthAddress,
  _tokenAddress: EthAddress,
  _amount: string
): Promise<ApplicationState> {
  try {
    let amount = BigNumber(_amount);
    const appState = { ...appState1 };

    _tokenAddress = _tokenAddress.toLowerCase();

    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

    if (typeof tokenInfo.tToken == undefined) {
      await updateLPDebtTokenInfo(appState, _tokenAddress);
    }

    if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
      if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
        amount = calculateMaxAmountRepay(appState, _tokenAddress, "walletState");
      }
      // check tokenAddress is exist on reverseList
      if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
        await updateUserTokenBalance(appState, _tokenAddress);
      }
      // set debt token balance to debtTokenSmartWalletBalance - amount
      appState.walletState.tokenBalances.set(
        _tokenAddress,
        BigNumber(appState.walletState.tokenBalances.get(_tokenAddress)!)
          .minus(amount)
          .toFixed(0)
      );

    } else if (
      _from.toLowerCase() == appState.smartWalletState.address.toLowerCase()
    ) {
      if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
        amount = calculateMaxAmountRepay(appState, _tokenAddress, "smartWalletState");
      }
      // check tokenAddress is exist on reverseList
      if (
        !appState.smartWalletState.tokenBalances.has(_tokenAddress)
      ) {
        await updateSmartWalletTokenBalance(appState, _tokenAddress);
      }
      // set debt token balance to debtTokenSmartWalletBalance - amount
      appState.smartWalletState.tokenBalances.set(
        _tokenAddress,
        BigNumber(appState.smartWalletState.tokenBalances.get(_tokenAddress)!)
          .minus(amount)
          .toFixed(0)
      );
    }

    // repay piece of borrowed token = amount * asset.price
    let repayUSD = getBalanceUsdFromAmount(amount, tokenInfo);

    // update totalDebtUSD : borrowed - amount * asset.price
    let newTotalDebt = BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD).minus(repayUSD)
    let healthFactor = calculateNewHealFactor(
      BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD),
      BigNumber(appState.smartWalletState.travaLPState.currentLiquidationThreshold),
      newTotalDebt
    )

    // update availableBorrowUSD :  availableBorrowsUSD + amount * asset.price
    let availableBorrowsUSD = calculateNewAvailableBorrow(
      BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD),
      BigNumber(appState.smartWalletState.travaLPState.ltv),
      newTotalDebt
    )

    appState.smartWalletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0);
    appState.smartWalletState.travaLPState.totalDebtUSD = newTotalDebt.toFixed(0);
    appState.smartWalletState.travaLPState.healthFactor = healthFactor.toFixed(0)

    tokenInfo.dToken = {
      address: tokenInfo.dToken.address,
      decimals: tokenInfo.dToken.decimals,
      balances: BigNumber(tokenInfo.dToken.balances).minus(amount).toFixed(0),
      totalSupply: BigNumber(tokenInfo.dToken.totalSupply).minus(repayUSD).toFixed(0),
      originToken: {
        balances: BigNumber(tokenInfo.dToken.originToken.balances).plus(amount).toFixed(0)
      }
    };

    appState.smartWalletState.detailTokenInPool.set(
      _tokenAddress,
      tokenInfo
    );

    return appState;
  } catch (err) {
    throw err;
  }
}

// need remove tToken from smart wallet state
export async function SimulationWithdraw(
  appState1: ApplicationState,
  _to: EthAddress,
  _tokenAddress: EthAddress,
  _amount: string
): Promise<ApplicationState> {
  try {
    let amount = BigNumber(_amount);
    const appState = { ...appState1 };

    _tokenAddress = _tokenAddress.toLowerCase();

    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!;

    if (typeof tokenInfo.tToken == undefined) {
      await updateLPDebtTokenInfo(appState, _tokenAddress);
    }

    if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
      amount = calculateMaxAmountWithdraw(appState, _tokenAddress);
    }

    if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      _to = appState.walletState.address.toLowerCase();
      // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
      if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
        await updateUserTokenBalance(appState, _tokenAddress);
      }
      // update token balances
      appState.walletState.tokenBalances.set(
        _tokenAddress,
        BigNumber(appState.walletState.tokenBalances.get(_tokenAddress)!)
          .plus(amount)
          .toFixed(0)
      );

    } else if (
      _to.toLowerCase() == appState.smartWalletState.address.toLowerCase()
    ) {
      _to = appState.smartWalletState.address.toLowerCase();
      // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
      if (!appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
        await updateSmartWalletTokenBalance(appState, _tokenAddress);
      }
      // update token balances
      appState.smartWalletState.tokenBalances.set(
        _tokenAddress,
        BigNumber(appState.smartWalletState.tokenBalances.get(_tokenAddress)!).plus(amount).toFixed(0)
      );
    }

    let withdrawUSD = getBalanceUsdFromAmount(amount, tokenInfo);
    let oldTotalCollateralUSD = appState.smartWalletState.travaLPState.totalCollateralUSD;
    let newTotalCollateralUSD = BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD).minus(withdrawUSD);
    // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

    let oldLTV = appState.smartWalletState.travaLPState.ltv;
    let newLTV = calculateNewLTV(BigNumber(oldTotalCollateralUSD), BigNumber(oldLTV), newTotalCollateralUSD, BigNumber(tokenInfo.maxLTV))

    //Calculate liquid threshold
    let oldLiquidTreshold = appState.smartWalletState.travaLPState.currentLiquidationThreshold;
    let newLiquidTreshold = calculateNewLiquidThreshold(BigNumber(oldTotalCollateralUSD), BigNumber(oldLiquidTreshold), newTotalCollateralUSD, BigNumber(tokenInfo.liqThres));

    // if totalDebtUSD = 0  , not update healthFactor
    const healthFactor = calculateNewHealFactor(newTotalCollateralUSD, newLiquidTreshold, BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD));
    const availableBorrowsUSD = calculateNewAvailableBorrow(newTotalCollateralUSD, newLTV, BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD));


    appState.smartWalletState.travaLPState.totalCollateralUSD = newTotalCollateralUSD.toFixed(0);
    appState.smartWalletState.travaLPState.currentLiquidationThreshold = newLiquidTreshold.toFixed(0);
    appState.smartWalletState.travaLPState.ltv = newLTV.toFixed(0);
    appState.smartWalletState.travaLPState.healthFactor = healthFactor.toFixed(0);
    appState.smartWalletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0)

    tokenInfo.tToken = {
      address: tokenInfo.tToken.address,
      decimals: tokenInfo.tToken.decimals,
      balances: BigNumber(tokenInfo.tToken.balances).minus(amount).toFixed(0),
      totalSupply: BigNumber(tokenInfo.tToken.totalSupply).minus(withdrawUSD).toFixed(0),
      originToken: {
        balances: BigNumber(tokenInfo.tToken.originToken.balances).minus(amount).toFixed(0)
      }
    };

    appState.smartWalletState.detailTokenInPool.set(
      _tokenAddress,
      tokenInfo
    );

    return appState;
  } catch (err) {
    throw err;
  }
}

export async function SimulationClaimReward(
  appState1: ApplicationState,
  _to: EthAddress,
  _amount: string
): Promise<ApplicationState> {
  let appState = { ...appState1 };
  try {
    let amount = BigNumber(_amount);

    const rTravaAddress = appState.smartWalletState.travaLPState.lpReward.tokenAddress;

    let maxReward = appState.smartWalletState.travaLPState.lpReward.claimableReward;

    if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
      amount = BigNumber(maxReward);
    }

    appState.smartWalletState.travaLPState.lpReward.claimableReward = (
      BigNumber(maxReward).minus(amount)
    ).toFixed(0);


    if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      _to = appState.walletState.address;
      if (!appState.walletState.tokenBalances.has(rTravaAddress)) {
        appState = await updateUserTokenBalance(appState, rTravaAddress);
      }
      appState.walletState.tokenBalances.set(
        rTravaAddress,
        BigNumber(appState.walletState.tokenBalances.get(rTravaAddress)!).plus(amount).toFixed(0)
      );
    } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      _to = appState.smartWalletState.address;
      if (!appState.smartWalletState.tokenBalances.has(rTravaAddress)) {
        
        appState = await updateSmartWalletTokenBalance(appState, rTravaAddress);
      }
      appState.smartWalletState.tokenBalances.set(
        rTravaAddress,
        BigNumber(appState.smartWalletState.tokenBalances.get(rTravaAddress)!).plus(amount).toFixed(0)
      );
    }
  } catch (err) {
    throw err;
  }
  return appState;
}

export async function SimulationConvertReward(
  appState1: ApplicationState,
  from: EthAddress,
  to: EthAddress,
  _amount: string
): Promise<ApplicationState> {
  let appState = { ...appState1 };
  try {
    let amount = BigNumber(_amount);
    const rTravaAddress = appState.smartWalletState.travaLPState.lpReward.tokenAddress;

    if (from == appState.walletState.address) {
      if (!appState.walletState.tokenBalances.has(rTravaAddress)) {
        appState = await updateUserTokenBalance(appState, rTravaAddress);
      }

      const rTravaBalance = appState.walletState.tokenBalances.get(rTravaAddress)!;

      if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
        amount = BigNumber(rTravaBalance);
      }

      appState.walletState.tokenBalances.set(
        rTravaAddress,
        BigNumber(rTravaBalance).minus(amount).toFixed(0)
      );

    } else if (from == appState.smartWalletState.address) {
      if (!appState.smartWalletState.tokenBalances.has(rTravaAddress)) {
        appState = await updateSmartWalletTokenBalance(appState, rTravaAddress);
      }

      const rTravaBalance = appState.smartWalletState.tokenBalances.get(rTravaAddress)!;

      if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
        amount = BigNumber(rTravaBalance);
      }

      appState.smartWalletState.tokenBalances.set(
        rTravaAddress,
        BigNumber(rTravaBalance).minus(amount).toFixed(0)
      );
    }

    const travaAddress = getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase();

    if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      to = appState.walletState.address;

      if (!appState.walletState.tokenBalances.has(travaAddress)) {
        appState = await updateUserTokenBalance(appState, travaAddress);
      }
      
      const travaBalance = appState.walletState.tokenBalances.get(travaAddress)!;
      appState.walletState.tokenBalances.set(
        travaAddress,
        BigNumber(travaBalance).plus(amount).toFixed(0)
        )
      } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
        to = appState.smartWalletState.address;
        
        if (!appState.smartWalletState.tokenBalances.has(travaAddress)) {
          
          appState = await updateSmartWalletTokenBalance(appState, travaAddress);
        }

      const travaBalance = appState.smartWalletState.tokenBalances.get(travaAddress)!;
      appState.smartWalletState.tokenBalances.set(
        travaAddress,
        BigNumber(travaBalance).plus(amount).toFixed(0)
      )
    }
  } catch (err) {
    throw err;
  }
  return appState;
}
