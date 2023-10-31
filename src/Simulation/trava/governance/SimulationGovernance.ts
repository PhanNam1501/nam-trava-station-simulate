import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js";
import { getAddr } from "../../../utils/address";
import { DAY_TO_SECONDS, HOUR_TO_SECONDS, WEEK_TO_SECONDS, YEAR_TO_SECONDS } from "../../../utils/config";
import { LockBalance, RewardTokenData, TokenInGovernance } from "../../../State/TravaGovenanceState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../../basic/UpdateStateAccount";
import { MAX_UINT256, percentMul, wadDiv } from "../../../utils/config";


export async function simulateGovernanceCreateLock(
  _appState1: ApplicationState,
  _tokenAddress: string,
  _amount: string,
  _from: string,
  _period: string, //second
): Promise<ApplicationState> {
  const appState = { ..._appState1 };

  try {
    const tokenAddress = _tokenAddress.toLowerCase();
    let amount = BigNumber(_amount);
    const from = _from;
    const period = _period;
    if (from == appState.walletState.address) {
      if (!appState.walletState.tokenBalances.has(tokenAddress)) {
        await updateUserTokenBalance(appState, tokenAddress);
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
        await updateSmartWalletTokenBalance(appState, tokenAddress);
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
    let newId = appState.VeTravaState.totalSupply + 1;
    // init reward
    let rewardTokenData: RewardTokenData = {
      address: getAddr("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase(),
      compoundAbleRewards: "0",
      compoundedRewards: "0",
      balances: "0",
      decimals: "18",
    }

    let tokenInGovernance: TokenInGovernance = {
      address: tokenAddress.toLowerCase(),
      balances: amount.toFixed(0),
      decimals: "18",
    }

    let lockBalance: LockBalance = {
      id: newId.toString(),
      votingPower: votingPower.toFixed(),
      tokenInGovernance: tokenInGovernance,
      unlockTime: (BigNumber(period).plus(Math.floor(new Date().getTime() / 1000))).toString(),
      reward: rewardTokenData,
    }
    appState.smartWalletState.travaGovenanceState.set(newId.toString(), lockBalance);
    appState.VeTravaState.totalSupply += 1;

  } catch (err) {
    throw err;
  }
  return appState;
}

function timeRemaining(_timeLock: BigNumber) {
  const now = Math.floor(new Date().getTime() / 1000);
  if (_timeLock.isEqualTo(WEEK_TO_SECONDS)) {
    _timeLock = _timeLock.multipliedBy(2);
  }
  return BigNumber(roundDown(now + Number(_timeLock)) - now);
};

function roundDown(timestamp: number) {
  const thursday = Math.floor(timestamp / WEEK_TO_SECONDS) * WEEK_TO_SECONDS;
  const dt = 5 * DAY_TO_SECONDS + 15 * HOUR_TO_SECONDS;
  if (thursday + dt < timestamp) return thursday + dt;
  else return thursday - WEEK_TO_SECONDS + dt;
}
