import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js";
import { convertHexStringToAddress, getAddr } from "../../../utils/address";
import { BASE18, DAY_TO_SECONDS, HOUR_TO_SECONDS, MAX_LOCK_TIMES, WEEK_TO_SECONDS, YEAR_TO_SECONDS } from "../../../utils/config";
import { RewardTokenBalance, TokenInVeTrava, VeTravaState } from "../../../State/TravaGovenanceState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../../basic/UpdateStateAccount";
import { MAX_UINT256, percentMul, wadDiv } from "../../../utils/config";
import { BigNumberish, EthAddress, wallet_mode } from "../../../utils/types";
import { uint256 } from "trava-station-sdk";
import { roundDown, updateTravaGovernanceState, updateUserLockBalance } from "./UpdateStateAccount";
import { FromAddressError } from "../../../utils/error";

export function getTimeLeft(time: uint256) {
  return Math.max(new Date(time).getTime() - new Date().getTime(), 0) / 1000;
}
export function calcVotingPower(amount: uint256, timeRemaining: uint256, maxTime = MAX_LOCK_TIMES) {
  return BigNumber(amount).times(timeRemaining).div(maxTime);
}

export function getAmountInTrava(tokenBalance: uint256, increaseAmount: uint256, tokenRatio: uint256, claimedReward: uint256): BigNumber {
  return BigNumber(tokenBalance).plus(increaseAmount).times(tokenRatio).plus(claimedReward);
}

export function getPredictVotingPower(tokenBalance: uint256, increaseAmount: uint256, tokenRatio: uint256, claimedReward: uint256, timeEnd: uint256) {
  let amountInTrava = getAmountInTrava(tokenBalance, increaseAmount, tokenRatio, claimedReward).toFixed(0);
  let timeLeft = getTimeLeft(timeEnd).toFixed(0);
  return calcVotingPower(amountInTrava, timeLeft);
}

export function timeRemaining(_timeLock: BigNumber): BigNumber {
  const now = Math.floor(new Date().getTime() / 1000);
  if (_timeLock.isEqualTo(WEEK_TO_SECONDS)) {
    _timeLock = _timeLock.multipliedBy(2);
  }
  return BigNumber(roundDown(now + Number(_timeLock)) - now);
};

export async function simulateTravaGovernanceCreateLock(
  _appState1: ApplicationState,
  _tokenAddress: EthAddress,
  _amount: uint256,
  _period: uint256, //second
  _from: EthAddress,
  _to: EthAddress
): Promise<ApplicationState> {
  let appState = { ..._appState1 };

  try {
    const tokenAddress = _tokenAddress.toLowerCase();
    let amount = BigNumber(_amount);
    const from = _from;
    const period = _period;

    if (appState.TravaGovernanceState.totalSupply == "") {
      appState = await updateTravaGovernanceState(appState);
    }

    if (from == appState.walletState.address) {
      if (!appState.walletState.tokenBalances.has(tokenAddress)) {
        appState = await updateUserTokenBalance(appState, tokenAddress);
      }

      if (!appState.walletState.veTravaListState.isFetch) {
        appState = await updateUserLockBalance(appState, from);
      }


      let travaBalance = BigNumber(appState.walletState.tokenBalances.get(tokenAddress)!);
      if (amount.isEqualTo(MAX_UINT256)) {
        amount = travaBalance;
      }
      appState.walletState.tokenBalances.set(
        tokenAddress,
        travaBalance.minus(amount).toFixed(0)
      );
    }
    if (from == appState.smartWalletState.address) {
      if (!appState.smartWalletState.tokenBalances.has(tokenAddress)) {
        appState = await updateSmartWalletTokenBalance(appState, tokenAddress);
      }

      if (!appState.smartWalletState.veTravaListState.isFetch) {
        appState = await updateUserLockBalance(appState, from);
      }


      let travaBalance =
        BigNumber(appState.smartWalletState.tokenBalances.get(tokenAddress)!);
      if (amount.isEqualTo(MAX_UINT256)) {
        amount = travaBalance;
      }
      appState.smartWalletState.tokenBalances.set(
        tokenAddress,
        travaBalance.minus(amount).toFixed(0)
      );
    }

    let remainingPeriod = BigNumber(timeRemaining(BigNumber(period)));
    let votingPower = (amount.multipliedBy(remainingPeriod).dividedBy(YEAR_TO_SECONDS * 4)).integerValue();

    //init ID
    let newId = BigNumber(appState.TravaGovernanceState.totalSupply).plus(1).toFixed(0);

    // init reward
    let rewardTokenBalance: RewardTokenBalance = {
      compoundAbleRewards: "0",
      compoundedRewards: "0",
      balances: "0"
    }

    // init token in governance
    let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress)!;
    let tokenInVeTrava: TokenInVeTrava = {
      balances: amount.toFixed(0),
      tokenLockOption: tokenLockOption
    }

    let veTravaState: VeTravaState = {
      id: newId.toString(),
      votingPower: votingPower.toFixed(),
      tokenInVeTrava: tokenInVeTrava,
      unlockTime: (BigNumber(period).plus(Math.floor(new Date().getTime() / 1000))).toString(),
      rewardTokenBalance: rewardTokenBalance,
    }

    if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      if (!appState.walletState.veTravaListState.isFetch) {
        appState = await updateUserLockBalance(appState, appState.walletState.address);
      }

      appState.walletState.veTravaListState.veTravaList.set(newId.toString(), veTravaState);
    } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      if (!appState.smartWalletState.veTravaListState.isFetch) {
        appState = await updateUserLockBalance(appState, appState.smartWalletState.address);
      }
      appState.smartWalletState.veTravaListState.veTravaList.set(newId.toString(), veTravaState);
    }
    appState.TravaGovernanceState.totalSupply = newId;

  } catch (err) {
    throw err;
  }
  return appState;
}

export async function simulateTravaGovernanceIncreaseBalance(
  appState1: ApplicationState,
  _tokenId: uint256,
  _amount: uint256,
  _from: EthAddress
) {
  let appState = appState1;
  try {
    if (appState.TravaGovernanceState.totalSupply == "") {
      appState = await updateTravaGovernanceState(appState);
    }

    let mode: wallet_mode;
    if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
      mode = "walletState"
    } else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      mode = "smartWalletState"
    } else {
      throw new FromAddressError()
    }

    if (!appState.smartWalletState.veTravaListState.isFetch) {
      await updateUserLockBalance(appState, appState.smartWalletState.address);
    }

    if (!appState.smartWalletState.veTravaListState.veTravaList.has(_tokenId)) {
      throw new Error("Invalid owner of token id!");
    }

    let veTrava = appState.smartWalletState.veTravaListState.veTravaList.get(_tokenId)!;
    let tokenAddress = veTrava.tokenInVeTrava.tokenLockOption.address.toLowerCase()

    if (!appState[mode].tokenBalances.has(tokenAddress)) {
      appState = await updateUserTokenBalance(appState, tokenAddress);
      appState = await updateSmartWalletTokenBalance(appState, tokenAddress);
    }

    let tokenBalance = appState[mode].tokenBalances.get(tokenAddress)!;
    let amount = BigNumber(_amount);
    if (amount.isEqualTo(MAX_UINT256)) {
      amount = BigNumber(tokenBalance);
    }

    let remainBalance = BigNumber(tokenBalance).minus(amount)
    let deposited = veTrava.tokenInVeTrava.balances;
    let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress)!;
    let newVotingPower = getPredictVotingPower(deposited, amount.toFixed(0), tokenLockOption.ratio, veTrava.rewardTokenBalance.compoundedRewards, veTrava.unlockTime);

    veTrava.tokenInVeTrava.balances = BigNumber(deposited).plus(amount).toFixed(0);
    veTrava.votingPower = newVotingPower.toFixed(0);

    appState.smartWalletState.veTravaListState.veTravaList.set(_tokenId, veTrava);
    appState[mode].tokenBalances.set(tokenAddress, remainBalance.toFixed(0))
  } catch (err) {
    throw (err)
  }
  return appState;
}

export async function simulateTravaGovernanceChangeUnlockTime(
  appState1: ApplicationState,
  _tokenId: uint256,
  _unlockTime: uint256
) {
  let appState = appState1;
  try {
    if (appState.TravaGovernanceState.totalSupply == "") {
      appState = await updateTravaGovernanceState(appState);
    }

    if (!appState.smartWalletState.veTravaListState.isFetch) {
      await updateUserLockBalance(appState, appState.smartWalletState.address);
    }

    if (!appState.smartWalletState.veTravaListState.veTravaList.has(_tokenId)) {
      throw new Error("Invalid owner of token id!");
    }

    let veTrava = appState.smartWalletState.veTravaListState.veTravaList.get(_tokenId)!;
    let tokenAddress = veTrava.tokenInVeTrava.tokenLockOption.address.toLowerCase()
    let deposited = veTrava.tokenInVeTrava.balances;
    let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress)!;
    let newVotingPower = getPredictVotingPower(deposited, "0", tokenLockOption.ratio, veTrava.rewardTokenBalance.compoundedRewards, _unlockTime);

    veTrava.unlockTime = _unlockTime;
    veTrava.votingPower = newVotingPower.toFixed(0);

    appState.smartWalletState.veTravaListState.veTravaList.set(_tokenId, veTrava);
  } catch (err) {
    throw (err)
  }
  return appState;
}

export async function simulateTravaGovernanceCompound(
  appState1: ApplicationState,
  _tokenId: uint256
) {
  let appState = appState1;
  try {
    if (appState.TravaGovernanceState.totalSupply == "") {
      appState = await updateTravaGovernanceState(appState);
    }

    if (!appState.smartWalletState.veTravaListState.isFetch) {
      await updateUserLockBalance(appState, appState.smartWalletState.address);
    }

    if (!appState.smartWalletState.veTravaListState.veTravaList.has(_tokenId)) {
      throw new Error("Invalid owner of token id!");
    }

    let veTrava = appState.smartWalletState.veTravaListState.veTravaList.get(_tokenId)!;
    let tokenAddress = veTrava.tokenInVeTrava.tokenLockOption.address.toLowerCase()

    let deposited = veTrava.tokenInVeTrava.balances;
    let compoundAbleRewards = veTrava.rewardTokenBalance.compoundAbleRewards;
    let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress)!;
    let amount = BigNumber(compoundAbleRewards).div(tokenLockOption.ratio)
    let newVotingPower = getPredictVotingPower(deposited, amount.toFixed(0), tokenLockOption.ratio, veTrava.rewardTokenBalance.compoundedRewards, veTrava.unlockTime);

    veTrava.tokenInVeTrava.balances = amount.plus(veTrava.tokenInVeTrava.balances).toFixed()
    veTrava.rewardTokenBalance.compoundAbleRewards = "0";
    veTrava.rewardTokenBalance.compoundedRewards = BigNumber(veTrava.rewardTokenBalance.compoundedRewards).plus(compoundAbleRewards).toFixed(0)
    veTrava.votingPower = newVotingPower.toFixed(0);

    appState.smartWalletState.veTravaListState.veTravaList.set(_tokenId, veTrava);
  } catch (err) {
    throw (err)
  }
  return appState;
}

export async function simulateTravaGovernanceWithdraw(
  appState1: ApplicationState,
  _tokenId: uint256,
  _to: EthAddress
) {
  let appState = appState1;
  try {
    if (appState.TravaGovernanceState.totalSupply == "") {
      appState = await updateTravaGovernanceState(appState);
    }

    if (!appState.smartWalletState.veTravaListState.isFetch) {
      await updateUserLockBalance(appState, appState.smartWalletState.address);
    }

    if (!appState.smartWalletState.veTravaListState.veTravaList.has(_tokenId)) {
      throw new Error("Invalid owner of token id!");
    }

    let veTrava = appState.smartWalletState.veTravaListState.veTravaList.get(_tokenId)!;
    let tokenAddress = veTrava.tokenInVeTrava.tokenLockOption.address.toLowerCase()

    let deposited = veTrava.tokenInVeTrava.balances;
    let rewardBalance = veTrava.rewardTokenBalance.compoundedRewards;
    let rewardTokenAddress = appState.TravaGovernanceState.rewardTokenInfo.address.toLowerCase();

    if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      if (!appState.walletState.tokenBalances.has(rewardTokenAddress)) {
        appState = await updateUserTokenBalance(appState, rewardTokenAddress);
      }

      if (!appState.walletState.tokenBalances.has(tokenAddress)) {
        appState = await updateUserTokenBalance(appState, tokenAddress);
      }

      let balance = appState.walletState.tokenBalances.get(rewardTokenAddress)!
      appState.walletState.tokenBalances.set(
        tokenAddress,
        BigNumber(balance).plus(deposited).toFixed(0)
      )

      appState.walletState.tokenBalances.set(
        tokenAddress,
        BigNumber(rewardBalance).plus(deposited).toFixed(0)
      )

    } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {

      if (!appState.walletState.tokenBalances.has(rewardTokenAddress)) {
        appState = await updateSmartWalletTokenBalance(appState, rewardTokenAddress);
      }

      if (!appState.walletState.tokenBalances.has(tokenAddress)) {
        appState = await updateSmartWalletTokenBalance(appState, tokenAddress);
      }

      let balance = appState.smartWalletState.tokenBalances.get(rewardTokenAddress)!
      appState.smartWalletState.tokenBalances.set(
        tokenAddress,
        BigNumber(balance).plus(deposited).toFixed(0)
      )

      appState.smartWalletState.tokenBalances.set(
        tokenAddress,
        BigNumber(rewardBalance).plus(deposited).toFixed(0)
      )
    }

    appState.smartWalletState.veTravaListState.veTravaList.delete(_tokenId);
  } catch (err) {
    throw (err)
  }
  return appState;
}

export async function simulateTravaGovernanceMerge(
  appState1: ApplicationState,
  _tokenId1: uint256,
  _tokenId2: uint256,
  _from: EthAddress,
  _to: EthAddress
) {
  let appState = appState1;
  try {
    if (appState.TravaGovernanceState.totalSupply == "") {
      appState = await updateTravaGovernanceState(appState);
    }

    let mode: wallet_mode;
    if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
      mode = "walletState"
    } else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      mode = "smartWalletState"
    } else {
      throw new FromAddressError()
    }

    if (!appState[mode].veTravaListState.isFetch) {
      await updateUserLockBalance(appState, appState[mode].address);
    }

    if (!appState[mode].veTravaListState.veTravaList.has(_tokenId1) || !appState[mode].veTravaListState.veTravaList.has(_tokenId2)) {
      throw new Error("Invalid owner of token id!");
    }

    let veTrava1 = appState[mode].veTravaListState.veTravaList.get(_tokenId1)!;
    let tokenAddress1 = veTrava1.tokenInVeTrava.tokenLockOption.address.toLowerCase()
    let tokenLockOption1 = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress1)!;
    let deposited1 = veTrava1.tokenInVeTrava.balances;
    let compoundedRewards1 = veTrava1.rewardTokenBalance.compoundedRewards;
    let compoundAbleRewards1 = veTrava1.rewardTokenBalance.compoundAbleRewards;
    let balanceRewards1 = veTrava1.rewardTokenBalance.balances;

    let veTrava2 = appState[mode].veTravaListState.veTravaList.get(_tokenId2)!;
    let tokenAddress2 = veTrava2.tokenInVeTrava.tokenLockOption.address.toLowerCase()
    let tokenLockOption2 = appState.TravaGovernanceState.tokensInGovernance.get(tokenAddress2)!;
    let deposited2 = veTrava2.tokenInVeTrava.balances;
    let compoundAbleRewards2 = veTrava2.rewardTokenBalance.compoundAbleRewards;
    let compoundedRewards2 = veTrava2.rewardTokenBalance.compoundedRewards;
    let balanceRewards2 = veTrava2.rewardTokenBalance.balances;

    // let rewardTokenAddress = appState.TravaGovernanceState.rewardTokenInfo.address.toLowerCase();

    let maxUnlockTime = veTrava1.unlockTime;
    if (BigNumber(maxUnlockTime).isLessThan(veTrava2.unlockTime)) {
      maxUnlockTime = veTrava2.unlockTime
    }

    let newVotingPower1 = getPredictVotingPower(deposited1, "0", tokenLockOption1.ratio, veTrava1.rewardTokenBalance.compoundedRewards, maxUnlockTime);
    let newVotingPower2 = getPredictVotingPower(deposited1, "0", tokenLockOption2.ratio, veTrava2.rewardTokenBalance.compoundedRewards, maxUnlockTime);

    veTrava2.rewardTokenBalance.compoundAbleRewards = BigNumber(compoundAbleRewards2).plus(compoundAbleRewards1).toFixed(0)
    veTrava2.rewardTokenBalance.compoundedRewards = BigNumber(compoundedRewards2).plus(compoundedRewards1).toFixed(0)
    veTrava2.rewardTokenBalance.balances = BigNumber(balanceRewards2).plus(balanceRewards1).toFixed(0)

    veTrava2.tokenInVeTrava.balances = BigNumber(deposited2).plus(deposited1).toFixed(0)
    veTrava2.unlockTime = maxUnlockTime
    veTrava2.votingPower = BigNumber(newVotingPower2).plus(newVotingPower1).toFixed(0)

    appState[mode].veTravaListState.veTravaList.delete(_tokenId1);
    appState[mode].veTravaListState.veTravaList.set(_tokenId2, veTrava2);
  } catch (err) {
    throw (err)
  }
  return appState;
}
