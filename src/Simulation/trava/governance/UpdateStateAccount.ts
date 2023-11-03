import { convertHexStringToAddress, getAddr } from "../../../utils/address";
import VeABI from "../../../abis/Ve.json";
import IncentiveABI from "../../../abis/Incentive.json";
import { VeTravaState, RewardTokenBalance, rewardTokenInfo, TokenLock } from "../../../State/TravaGovenanceState";
import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js"
import { BASE18, DAY_TO_SECONDS, HOUR_TO_SECONDS, WEEK_TO_SECONDS } from "../../../utils/config";
import { multiCall } from "../../../utils/helper";
import { TokenInVeTrava } from './../../../State/TravaGovenanceState';
import ValuatorABI from "../../../abis/IValuator.json";
import { Contract } from "ethers";
import { tokenLockOptions } from "./travaGovernanceConfig";
import { BigNumberish, EthAddress, wallet_mode } from "../../../utils/types";
import { FromAddressError } from "../../../utils/error";

export async function updateTravaGovernanceState(appState1: ApplicationState, force = false) {
  let appState = { ...appState1 };
  try {
    if (appState.TravaGovernanceState.totalSupply == "" || force) {
      const veContract = new Contract(
        getAddr("VE_TRAVA_ADDRESS", appState.chainId),
        VeABI,
        appState.web3
      )

      const totalSupply = await veContract.supplyNFT();
      const rewardTokenInfo: rewardTokenInfo = {
        address: getAddr("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase(),
        decimals: "18"
      }
      
      const listTokenInGovernance = tokenLockOptions[appState.chainId];
      
      for (let i = 0; i < listTokenInGovernance.length; i++) {
        let key = listTokenInGovernance[i].address.toLowerCase()
        let tokenRatio = (await getTokenRatio(appState, listTokenInGovernance[i].address))
        let tokenLock: TokenLock = {
          ...listTokenInGovernance[i],
          ratio: tokenRatio.toFixed(0)
        }
        appState.TravaGovernanceState.tokensInGovernance.set(key, tokenLock)
      }
      appState.TravaGovernanceState.totalSupply = totalSupply;
      appState.TravaGovernanceState.rewardTokenInfo = rewardTokenInfo;
    }

  } catch (err) {
    console.log(err)
  }
  return appState;
}

export async function updateUserLockBalance(appState1: ApplicationState, _userAddress: EthAddress) {
  let appState = { ...appState1 };
  try {
    if (appState.TravaGovernanceState.totalSupply == "") {
      appState = await updateTravaGovernanceState(appState);
    }

    let mode: wallet_mode;
    if (_userAddress.toLowerCase() == appState.walletState.address.toLowerCase()) {
      mode = "walletState"
    } else if (_userAddress.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      mode = "smartWalletState"
    } else {
      throw new FromAddressError()
    }

    let VeAddress = getAddr("VE_TRAVA_ADDRESS", appState.chainId);
    let IncentiveAddress = getAddr("INCENTIVE_VAULT_ADDRESS", appState.chainId);

    const veContract = new Contract(
      VeAddress,
      VeABI,
      appState.web3
    )

    let ids = await veContract.getveNFTOfUser(appState[mode].address);
    let votingPowers: string[] = [];
    let lockedValues: string[] = [];
    let rewardTokens: string[] = [];
    let compoundAbleRewards: string[] = [];
    let [
      listVotingPower,
      listLockedValue,
      listRewardToken,
      listCompoundAbleReward
    ] = await Promise.all(
    [
      multiCall(
        VeABI,
        ids.map((id: any, _: number) => ({
          address: VeAddress,
          name: "balanceOfNFT",
          params: [id],
        })),
        appState.web3,
        appState.chainId
      ),
      multiCall(
        VeABI,
        ids.map((id: any, _: number) => ({
          address: VeAddress,
          name: "locked",
          params: [id],
        })),
        appState.web3,
        appState.chainId
      ),
      multiCall(
        VeABI,
        ids.map((id: any, _: number) => ({
          address: VeAddress,
          name: "rewardToken",
          params: [],
        })),
        appState.web3,
        appState.chainId
      ),
      multiCall(
        IncentiveABI,
        ids.map((id: any, _: number) => ({
          address: IncentiveAddress,
          name: "claimable",
          params: [id],
        })),
        appState.web3,
        appState.chainId
      ),    
    ])

    for (let i = 0; i < ids.length; i++) {
      let votingPower = listVotingPower[i];
      let lockedValue = listLockedValue[i];
      let rewardToken = listRewardToken[i];
      let compoundAbleReward = listCompoundAbleReward[i];
      votingPowers.push(votingPower[0]);
      lockedValues.push(lockedValue);
      rewardTokens.push(rewardToken)
      compoundAbleRewards.push(compoundAbleReward)
    }

    //Math
    const now = Math.floor(new Date().getTime() / 1000);
    let round_ts = roundDown(now)

    let [
        listVeNFT,
        listTotalVe,
        listWarmUpReward,
        listWarmUp_ts,
        listEps
    ] = await Promise.all(
      [
        multiCall(
          IncentiveABI,
          ids.map((id: any, _: number) => ({
            address: IncentiveAddress,
            name: "ve_for_at",
            params: [id, round_ts],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          VeABI,
          ids.map((id: any, _: number) => ({
            address: VeAddress,
            name: "totalSupplyAtT",
            params: [round_ts],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          IncentiveABI,
          ids.map((id: any, _: number) => ({
            address: IncentiveAddress,
            name: "claimWarmUpReward",
            params: [id],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          VeABI,
          ids.map((id: any, _: number) => ({
            address: VeAddress,
            name: "user_point_history__ts",
            params: [id, 1],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          IncentiveABI,
          ids.map((id: any, _: number) => ({
            address: IncentiveAddress,
            name: "emissionPerSecond",
            params: [],
          })),
          appState.web3,
          appState.chainId
        ),
      ]
    )

    for (let i = 0; i < ids.length; i++) {
      let now1 = BigNumber(now);
      let round_ts1 = BigNumber(round_ts);
      let veNFT1 = BigNumber(listVeNFT[i][0]);
      let totalVe1 = BigNumber(listTotalVe[i][0]);
      let warmUpReward1 = BigNumber(listWarmUpReward[i][0]);
      let warmUp_ts1 = BigNumber(listWarmUp_ts[i][0]);
      let eps1 = BigNumber(listEps[i][0]);
      let unclaimedReward = BigNumber(0);

      if (warmUp_ts1.isGreaterThan(now1)) {
        unclaimedReward = warmUpReward1;
      }
      else {
        unclaimedReward = (now1.minus(round_ts1)).multipliedBy(veNFT1).dividedBy(totalVe1).multipliedBy(eps1);
      }
      let balance = unclaimedReward.plus(compoundAbleRewards[i][0]);

      // init token in governance
      let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(lockedValues[i][3].toLowerCase())!;
      let tokenInVeTrava: TokenInVeTrava = {
        balances: lockedValues[i][1].toString(),
        tokenLockOption: tokenLockOption
      }
      // init reward
      let rewardTokenBalance: RewardTokenBalance = {
        // address: rewardTokens[i][0].toLowerCase(),
        compoundAbleRewards: compoundAbleRewards[i][0].toString(),
        compoundedRewards: lockedValues[i][0].toString(),
        balances: balance.toFixed(0),
        // decimals: decimalTokens[i].toString(),
      }

      // init state lockBalance
      let veTravaState: VeTravaState = {
        id: ids[i].toString(),
        votingPower: votingPowers[i].toString(),
        tokenInVeTrava: tokenInVeTrava,
        unlockTime: lockedValues[i][2].toString(),
        rewardTokenBalance: rewardTokenBalance,
      }

      appState[mode].veTravaListState.veTravaList.set(ids[i].toString(), veTravaState);
    }
    appState[mode].veTravaListState.isFetch = true;

  } catch (err) {
    throw err;
  }
  return appState;
}

export function roundDown(timestamp: number) {
  // thứ năm gần nhất
  const thursday = Math.floor(timestamp / WEEK_TO_SECONDS) * WEEK_TO_SECONDS;
  const dt = 5 * DAY_TO_SECONDS + 15 * HOUR_TO_SECONDS;
  if (thursday + dt < timestamp) return thursday + dt;
  else return thursday - WEEK_TO_SECONDS + dt;
}

export async function getTokenRatio(appState: ApplicationState, _tokenAddress: EthAddress): Promise<BigNumber> {
  let tokenAddress = convertHexStringToAddress(_tokenAddress);
  let ratio = BigNumber(0)
  if (tokenAddress.toLowerCase() == getAddr("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase()) {
    ratio = BigNumber(1);
  } else {
    let isNormalToken = [getAddr("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase(), getAddr("RTRAVA_TOKEN_ADDRESS", appState.chainId).toLowerCase()].includes(
      tokenAddress.toLowerCase()
    );

    const valuatorAddress = isNormalToken
      ? getAddr("TOKEN_VALUATOR_ADDRESS", appState.chainId)
      : getAddr("LP_VALUATOR_ADDRESS", appState.chainId)
    
    const valuatorContract = new Contract(
      valuatorAddress,
      ValuatorABI,
      appState.web3
    )
    const ratioRaw = await valuatorContract.ratio(tokenAddress);
    console.log("ratioRaw", ratioRaw)
    ratio = BigNumber(String(ratioRaw));
  }
  return ratio
}

