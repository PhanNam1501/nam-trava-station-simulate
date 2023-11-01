import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js";
import { getAddr } from "../../../utils/address";
import { DAY_TO_SECONDS, HOUR_TO_SECONDS, WEEK_TO_SECONDS, YEAR_TO_SECONDS } from "../../../utils/config";
import { RewardTokenBalance, TokenInVeTrava, VeTravaState } from "../../../State/TravaGovenanceState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../../basic/UpdateStateAccount";
import { MAX_UINT256, percentMul, wadDiv } from "../../../utils/config";
import { EthAddress } from "../../../utils/types";
import { uint256 } from "trava-station-sdk";
import { roundDown, updateTravaGovernanceState } from "./UpdateStateAccount";

export function timeRemaining(_timeLock: BigNumber): BigNumber {
  const now = Math.floor(new Date().getTime() / 1000);
  if (_timeLock.isEqualTo(WEEK_TO_SECONDS)) {
    _timeLock = _timeLock.multipliedBy(2);
  }
  return BigNumber(roundDown(now + Number(_timeLock)) - now);
};


export async function simulateGovernanceCreateLock(
  _appState1: ApplicationState,
  _tokenAddress: EthAddress,
  _amount: uint256,
  _from: EthAddress,
  _period: uint256, //second
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
    appState.smartWalletState.veTravaListState.set(newId.toString(), veTravaState);
    appState.TravaGovernanceState.totalSupply = newId;

  } catch (err) {
    throw err;
  }
  return appState;
}

