import { getAddr } from "../../../utils/address";
import VeABI from "../../../abis/Ve.json";
import IncentiveABI from "../../../abis/Incentive.json";
import { VeTravaState, RewardTokenBalance, rewardTokenInfo } from "../../../State/TravaGovenanceState";
import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js"
import { DAY_TO_SECONDS, HOUR_TO_SECONDS, WEEK_TO_SECONDS } from "../../../utils/config";
import { multiCall } from "../../../utils/helper";
import { TokenInVeTrava } from './../../../State/TravaGovenanceState';
import { Contract } from "ethers";
import { tokenLockOptions } from "./travaGovernanceConfig";
import { EthAddress } from "../../../utils/types";

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
        appState.TravaGovernanceState.tokensInGovernance.set(key, listTokenInGovernance[i])
      }
      appState.TravaGovernanceState.totalSupply = totalSupply;
      appState.TravaGovernanceState.rewardTokenInfo = rewardTokenInfo;
    }

  } catch (err) {
    throw new Error();
  }
  return appState;
}

export async function updateAllLockBalance(appState1: ApplicationState) {
  let appState = { ...appState1 };
  try {
    if (appState.TravaGovernanceState.totalSupply == "") {
      appState = await updateTravaGovernanceState(appState);
    }

    let VeAddress = getAddr("VE_TRAVA_ADDRESS", appState.chainId);
    let IncentiveAddress = getAddr("INCENTIVE_VAULT_ADDRESS", appState.chainId);

    const veContract = new Contract(
      VeAddress,
      VeABI,
      appState.web3
    )

    let ids = await veContract.getveNFTOfUser(appState.walletState.address);

    ids = ids[0][0];
    let votingPowers: string[] = [];
    let lockedValues: string[] = [];
    let rewardTokens: string[] = [];
    let compoundAbleRewards: string[] = [];
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      let [
        votingPower,
        lockedValue,
        rewardToken,
        compoundAbleReward,
      ] = await Promise.all([
        multiCall(
          VeABI,
          [VeAddress].map((address: string, _: number) => ({
            address: address,
            name: "balanceOfNFT",
            params: [id],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          VeABI,
          [VeAddress].map((address: string, _: number) => ({
            address: address,
            name: "locked",
            params: [id],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          VeABI,
          [VeAddress].map((address: string, _: number) => ({
            address: address,
            name: "rewardToken",
            params: [],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          IncentiveABI,
          [IncentiveAddress].map((address: string, _: number) => ({
            address: address,
            name: "claimable",
            params: [id],
          })),
          appState.web3,
          appState.chainId
        ),
      ]);
      votingPowers.push(votingPower[0][0]);
      lockedValues.push(lockedValue[0]);
      rewardTokens.push(rewardToken[0])
      compoundAbleRewards.push(compoundAbleReward[0])
    }

    //Math
    const now = Math.floor(new Date().getTime() / 1000);
    let round_ts = roundDown(now)

    // let [veNFTs] = await Promise.all(
    //   [
    //     multiCall(
    //       IncentiveABI,
    //       ids.map((id: any, _: number) => ({
    //         address: IncentiveAddress,
    //         name: "ve_for_at",
    //         params: [id, round_ts],
    //       })),
    //       appState.web3,
    //       appState.chainId
    //     ),
    //   ]
    // )
    for (let i = 0; i < ids.length; i++) {

      let [
        veNFT,
        totalVe,
        warmUpReward,
        warmUp_ts,
        eps
      ] = await Promise.all([
        multiCall(
          IncentiveABI,
          [IncentiveAddress].map((address: string, _: number) => ({
            address: address,
            name: "ve_for_at",
            params: [ids[i], round_ts],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          VeABI,
          [VeAddress].map((address: string, _: number) => ({
            address: address,
            name: "totalSupplyAtT",
            params: [round_ts],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          IncentiveABI,
          [IncentiveAddress].map((address: string, _: number) => ({
            address: address,
            name: "claimWarmUpReward",
            params: [ids[i]],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          VeABI,
          [VeAddress].map((address: string, _: number) => ({
            address: address,
            name: "user_point_history__ts",
            params: [ids[i], 1],
          })),
          appState.web3,
          appState.chainId
        ),
        multiCall(
          IncentiveABI,
          [IncentiveAddress].map((address: string, _: number) => ({
            address: address,
            name: "emissionPerSecond",
            params: [],
          })),
          appState.web3,
          appState.chainId
        ),
      ]);
      let now1 = BigNumber(now);
      let round_ts1 = BigNumber(round_ts);
      let veNFT1 = BigNumber(veNFT[0][0]);
      let totalVe1 = BigNumber(totalVe[0][0]);
      let warmUpReward1 = BigNumber(warmUpReward[0][0]);
      let warmUp_ts1 = BigNumber(warmUp_ts[0][0]);
      let eps1 = BigNumber(eps[0][0]);
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

      appState.smartWalletState.veTravaListState.set(ids[i].toString(), veTravaState);
    }
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
