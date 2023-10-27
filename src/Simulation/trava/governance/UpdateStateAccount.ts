import { Contract, Interface, id } from "ethers";
import { getAddr } from "../../../utils/address";
import MultiCallABI from "../../../abis/Multicall.json";
import VeABI from "../../../abis/Ve.json";
import IncentiveABI from "../../../abis/Incentive.json";
import { LockBalance, TokenInGovernance, RewardTokenData } from "../../../State/TravaGovenanceState";
import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js"
export async function updateAllLockBalance(appState1: ApplicationState) {
    let appState = { ...appState1 };

    // id: string; x 
    // status: string; caculate by unlockTime x
    // votingPower: string; x 
    // tokenInGovernance: TokenInGovernance; (in locked) [3] x
    // balance
    // unlockTime: string; (in locked) [2] x
    // reward: RewardTokenData;
    //0xAe68A6Aa889DddDB27B458bc9038aBD308ff147C
    
    let VeAddress = "0x7E41803de7781f53D1901A3d70A3D3747b3B3B63";
    let IncentiveAddress = '0xf8F913DFd1Cfd0ef4AE8a04f41B47441c1d0A893';
    let [
      ids, // data of total deposit in all vaults
    ] = await Promise.all([
      multiCall(
        VeABI,
        [VeAddress].map((address: string, _: number) => ({
          address: address,
          name: "getveNFTOfUser",
          params: [appState.walletState.address],
        })),
        appState.web3,
        appState.chainId
      ),
    ]);

    ids = ids[0][0];
    let votingPowers : string[] = [];
    let lockedValues : string[] = [];
    let decimalTokens : string[] = [];
    let rewardTokens : string[] = [];
    let compoundAbleRewards : string[] = [];
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      let [
        votingPower,
        lockedValue,
        decimalToken,
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
            name: "decimals",
            params: [],
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
      decimalTokens.push(decimalToken[0]);
      rewardTokens.push(rewardToken[0])
      compoundAbleRewards.push(compoundAbleReward[0])
    }


    for (let i = 0; i < ids.length; i++) {
      //Math
      const now = Math.floor(new Date().getTime() / 1000);
      let round_ts = roundDown(now)

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
            params: [ids[i],round_ts],
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
      let veNFT1 = veNFT[0][0];
      let totalVe1 = totalVe[0][0];
      let warmUpReward1 = warmUpReward[0][0];
      let warmUp_ts1 = BigNumber(warmUp_ts[0][0]);
      let eps1 = eps[0][0];
      let unclaimedReward = (now1.minus(round_ts1)).multipliedBy(veNFT1).dividedBy(totalVe1).multipliedBy(eps1);
      if (warmUp_ts1.isGreaterThan(now1)) {
        unclaimedReward = warmUpReward1;
      }
      let balance = unclaimedReward.plus(compoundAbleRewards[i][0]);

      // init token in governance
      let tokenInGovernance: TokenInGovernance = {
        address: lockedValues[i][3].toLowerCase(),
        balances: lockedValues[i][1].toString(),
        decimals: decimalTokens[i].toString(),
      }
      // init reward
      let rewardTokenData: RewardTokenData = {
        address: rewardTokens[i][0].toLowerCase(),
        compoundAbleRewards: compoundAbleRewards[i][0].toString(),
        compoundedRewards: lockedValues[i][0].toString(),
        balances: balance.toFixed(0),
        decimals: decimalTokens[i].toString(),
      }

      // init state lockBalance
      let lockBalance: LockBalance = {
        id: ids[i].toString(),
        votingPower: votingPowers[i].toString(),
        tokenInGovernance: tokenInGovernance,
        unlockTime: lockedValues[i][2].toString(),
        reward: rewardTokenData,
      }
      appState.smartWalletState.travaGovenanceState.set(ids[i].toString(), lockBalance);
    }
    return appState;
}

function roundDown(timestamp: number) { 
  // thứ năm gần nhất
   const thursday = (timestamp / (7*24*3600)) * (7*24*3600); 
   const dt = 5*(24*3600) + 15*(3600); 
   if (thursday + dt < timestamp) return thursday + dt; 
   else return thursday - (7*24*3600) + dt; 
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