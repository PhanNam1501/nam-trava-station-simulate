import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import OraclePrice from "../../utils/oraclePrice";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import BEP20ABI from "../../abis/BEP20.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Contract } from "ethers";
import _, { bind, multiply, update } from "lodash";
import { MAX_UINT256, percentMul, wadDiv } from "../../utils/config";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
import { BigNumber } from "bignumber.js";
import { updateLPDebtTokenInfo, updateLPtTokenInfo } from "./UpdateStateAccount";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import { DetailTokenInPool } from "../../State/SmartWalletState";

export function calculateNewAvailableBorrow(newTotalCollateral: BigNumber, newLTV: BigNumber, newTotalDebt: BigNumber): BigNumber {
  return percentMul(
    newTotalCollateral.toFixed(0),
    newLTV.toFixed(0)
  )
    .minus(newTotalDebt)
}
export function calculateNewHealFactor(newTotalCollateral: BigNumber, newLiquidationThreshold: BigNumber, newTotalDebt: BigNumber): BigNumber {
  if (newTotalDebt.isZero()) {
    return BigNumber(MAX_UINT256)
  }

  return wadDiv(
            percentMul(
              newTotalCollateral.toFixed(0), 
              newLiquidationThreshold.toFixed(0)
            ).toFixed(0), 
            newTotalDebt.toFixed(0)
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
  if (usd_changed.isZero()) {
    return oldLTV;
  }
  let newLTV = oldTotalColleteral
    .multipliedBy(oldLTV)
    .plus(usd_changed.multipliedBy(tokenLTV))
    .div(newTotalCollateral)
  return newLTV
}

//liquid threshold has a formula like LTV
export function calculateNewLiquidThreshold(oldTotalColleteral: BigNumber, oldLiqThres: BigNumber, newTotalCollateral: BigNumber, tokenLiqThres: BigNumber): BigNumber {
  if (newTotalCollateral.isZero()) {
    return BigNumber(0);
  }
  let usd_changed = newTotalCollateral.minus(oldTotalColleteral);
  let newLTV = oldTotalColleteral
    .multipliedBy(oldLiqThres)
    .plus(usd_changed.multipliedBy(tokenLiqThres))
    .div(newTotalCollateral)
  return newLTV
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
      if (appState.walletState.tokenBalances.has(_tokenAddress)) {
        await updateUserTokenBalance(appState, _tokenAddress);
      }

      if (
        amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)
      ) {
        amount = BigNumber(appState.walletState.tokenBalances.get(_tokenAddress)!);
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
      // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
      if (appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
        await updateSmartWalletTokenBalance(appState, _tokenAddress);
      }

      if (
        amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)
      ) {
        amount = BigNumber(appState.walletState.tokenBalances.get(_tokenAddress)!);
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
      await updateLPtTokenInfo(appState, _tokenAddress);
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
      ...tokenInfo.tToken,
      balances: BigNumber(tokenInfo.tToken.balances).plus(amount).toFixed(0),
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

    let tTokenReserveBalance = BigNumber(tokenInfo.tToken.balances);

    if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      _to = appState.walletState.address;
      //  check tokenAddress is on tokenBalance of wallet
      if (appState.walletState.tokenBalances.has(_tokenAddress)) {
        await updateUserTokenBalance(appState, _tokenAddress);
      }

      if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
        amount = getAmountFromBalanceUsd(BigNumber(appState.smartWalletState.travaLPState.availableBorrowsUSD), tokenInfo)
      }

      //calculate max borrow
      amount = BigNumber.max(BigNumber.min(amount, tTokenReserveBalance), 0)
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
        appState.smartWalletState.tokenBalances.has(_tokenAddress)
      ) {
        await updateSmartWalletTokenBalance(appState, _tokenAddress);
      }

      if (
        amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)
      ) {
        amount = getAmountFromBalanceUsd(BigNumber(appState.smartWalletState.travaLPState.availableBorrowsUSD), tokenInfo);
      }
      // calculate max amount
      amount = BigNumber.max(BigNumber.min(amount, tTokenReserveBalance), 0);
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
      ...tokenInfo.dToken,
      balances: BigNumber(tokenInfo.dToken.balances).plus(amount).toFixed(0),
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

    if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
      amount = BigNumber(appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!.dToken.balances);
    }

    if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
      // check tokenAddress is exist on reverseList
      if (appState.walletState.tokenBalances.has(_tokenAddress)) {
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
      // check tokenAddress is exist on reverseList
      if (
        appState.smartWalletState.tokenBalances.has(_tokenAddress)
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


    tokenInfo.dToken.balances = BigNumber(tokenInfo.dToken.balances).minus(amount).toFixed(0)
      ;

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
      amount = BigNumber(appState.smartWalletState.detailTokenInPool.get(_tokenAddress)!.tToken.balances);
    }

    if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      _to = appState.walletState.address.toLowerCase();
      // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
      if (appState.walletState.tokenBalances.has(_tokenAddress)) {
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
      if (appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
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
      ...tokenInfo.tToken,
      balances:
        BigNumber(tokenInfo.tToken.balances).minus(amount).toFixed(0),
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
  amount: string
): Promise<ApplicationState> {
  try {
    const appState = { ...appState1 };

    const incentiveContract = new Contract(
      getAddr("INCENTIVE_CONTRACT", appState.chainId),
      IncentiveContractABI,
      appState.web3!
    );
    const rTravaAddress = String(
      await incentiveContract.REWARD_TOKEN()
    ).toLowerCase();

    const currentReward = appState.smartWalletState.maxRewardCanClaim;
    appState.smartWalletState.maxRewardCanClaim = (
      BigInt(currentReward) - BigInt(amount)
    ).toString();

    const rTravaBalance =
      appState.smartWalletState.tokenBalances.get(rTravaAddress);
    if (rTravaBalance) {
      appState.smartWalletState.tokenBalances.set(
        rTravaAddress,
        (BigInt(rTravaBalance) + BigInt(amount)).toString()
      );
    } else {
      appState.smartWalletState.tokenBalances.set(
        rTravaAddress,
        BigInt(amount).toString()
      );
    }
    return appState;
  } catch (err) {
    throw err;
  }
}

export async function SimulationConvertReward(
  appState1: ApplicationState,
  to: EthAddress,
  amount: string
): Promise<ApplicationState> {
  try {
    const appState = { ...appState1 };

    const incentiveContract = new Contract(
      getAddr("INCENTIVE_CONTRACT", appState.chainId),
      IncentiveContractABI,
      appState.web3!
    );
    const rTravaAddress = (
      await incentiveContract.REWARD_TOKEN()
    ).toLowerCase();

    const rTravaBalance =
      appState.smartWalletState.tokenBalances.get(rTravaAddress);

    if (rTravaBalance) {
      let realAmount = amount;
      if (BigInt(amount) > BigInt(rTravaBalance)) {
        realAmount = rTravaBalance;
      }
      appState.smartWalletState.tokenBalances.set(
        rTravaAddress,
        (BigInt(rTravaBalance) - BigInt(realAmount)).toString()
      );
      const travaAddress = getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId);
      if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
        to = appState.smartWalletState.address;

        const travaBalance =
          appState.smartWalletState.tokenBalances.get(travaAddress);
        if (travaBalance) {
          appState.smartWalletState.tokenBalances.set(
            travaAddress,
            (BigInt(travaBalance) + BigInt(amount)).toString()
          );
        } else {
          appState.smartWalletState.tokenBalances.set(
            rTravaAddress,
            BigInt(amount).toString()
          );
        }
      } else if (
        to.toLowerCase() == appState.walletState.address.toLowerCase()
      ) {
        to = appState.walletState.address;

        const travaBalance =
          appState.walletState.tokenBalances.get(travaAddress);
        if (travaBalance) {
          appState.walletState.tokenBalances.set(
            travaAddress,
            (BigInt(travaBalance) + BigInt(amount)).toString()
          );
        } else {
          appState.walletState.tokenBalances.set(
            rTravaAddress,
            BigInt(amount).toString()
          );
        }
      }
    } else {
      throw new Error(
        `Token rTrava is not exist in reverseList or smart wallet does not have token rTrava.`
      );
    }
    return appState;
  } catch (err) {
    throw err;
  }
}
