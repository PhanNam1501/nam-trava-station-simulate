import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js";
import { getAddr } from "../../../utils/address";
import { DAY_TO_SECONDS, HOUR_TO_SECONDS, WEEK_TO_SECONDS, YEAR_TO_SECONDS } from "../../../utils/config";
import { LockBalance, RewardTokenData, TokenInGovernance } from "../../../State/TravaGovenanceState";
import { Contract, Interface } from "ethers";
import MultiCallABI from "../../../abis/Multicall.json";
import VeABI from "../../../abis/Ve.json";
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
    let VeAddress = getAddr("VE_TRAVA_ADDRESS", appState.chainId);
    let [
      id, // data of total deposit in all vaults
    ] = await Promise.all([
      multiCall(
        VeABI,
        [VeAddress].map((address: string, _: number) => ({
          address: address,
          name: "supplyNFT",
          params: [],
        })),
        appState.web3,
        appState.chainId
      ),
    ]);

    let newId = (BigNumber(id).plus(1)).toFixed();
    // init reward
    let rewardTokenData: RewardTokenData = {
      address: '0xce9f0487f07988003f511d6651153a6dacc32f50',
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
      id: newId,
      votingPower: votingPower.toFixed(),
      tokenInGovernance: tokenInGovernance,
      unlockTime: (BigNumber(period).plus(Math.floor(new Date().getTime() / 1000))).toString(),
      reward: rewardTokenData,
    }
    appState.smartWalletState.travaGovenanceState.set(newId, lockBalance);



    return appState;
  } catch (err) {
    throw err;
  }
}

function timeRemaining(_timeLock: BigNumber) {
  const now = Math.floor(new Date().getTime() / 1000);
  if (_timeLock.isEqualTo(WEEK_TO_SECONDS)) {
    _timeLock = _timeLock.multipliedBy(2);
  }
  return BigNumber(roundDown(now + Number(_timeLock)) - now);
};

function roundDown(timestamp: number) {
  // thứ năm gần nhất
  const thursday = Math.floor(timestamp / WEEK_TO_SECONDS) * WEEK_TO_SECONDS;
  const dt = 5 * DAY_TO_SECONDS + 15 * HOUR_TO_SECONDS;
  if (thursday + dt < timestamp) return thursday + dt;
  else return thursday - WEEK_TO_SECONDS + dt;
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