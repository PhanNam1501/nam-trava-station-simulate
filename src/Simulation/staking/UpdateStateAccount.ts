import { Contract, Interface } from "ethers";
import { ApplicationState } from "../../State/ApplicationState";
import StakedTokenAbi from "../../abis/StakedToken.json";
import VestingTokenAbi from "../../abis/VestingTrava.json";
import { getAddr } from "../../utils/address";
import {  listStakingVault } from "../../utils/stakingVaultConfig";
import { YEAR_TO_SECONDS } from "../../utils/config";
import { BaseAccountVault, RewardTokenData, StakedTokenData, UnderlyingTokenData } from "../../State/TravaDeFiState";
import BigNumber from "bignumber.js";
import MultiCallABI from "../../abis/Multicall.json";
import OracleABI from "../../abis/AaveOracle.json";
import { updateSmartWalletTokenBalance } from "../basic/UpdateStateAccount";

export async function updateAllAccountVault(appState1: ApplicationState) {
  const vaultConfigList = listStakingVault[appState1.chainId];
  let appState = { ...appState1 };

  let underlyingAddress = new Array<string>;
  let priceUnderlyingAddress = new Array<string>
  let stakedTokenAddress = new Array<string>;
  let rewardTokenAddress = new Array<string>;
  for (let i = 0; i < vaultConfigList.length; i++) {
    underlyingAddress.push(vaultConfigList[i].underlyingAddress);
    priceUnderlyingAddress.push(vaultConfigList[i].priceUnderlyingAddress);
    stakedTokenAddress.push(vaultConfigList[i].stakedTokenAddress);
    rewardTokenAddress.push(vaultConfigList[i].rewardToken.address)
  }

  let [
    depositedDatas, 
    TVLDatas,
  ] = await Promise.all([
    multiCall(
      StakedTokenAbi,
      stakedTokenAddress.map((address: string, _: number) => ({
        address: address,
        name: "balanceOf",
        params: [appState.smartWalletState.address],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      StakedTokenAbi,
      stakedTokenAddress.map((address: string, _: number) => ({
        address: address,
        name: "totalSupply",
        params: [],
      })),
      appState.web3,
      appState.chainId
    )
  ]);
  


  // let [underlyingTokenPriceDatas, rewardTokenPriceDatas] = await Promise.all([
  //   multiCall(
  //     OracleABI,
  //     priceUnderlyingAddress.map((address: string, _: number) => ({
  //       address: getAddr("ORACLE_ADDRESS", appState.chainId),
  //       name: "getAssetPrice",
  //       params: [address],
  //     })),
  //     appState.web3,
  //     appState.chainId
  //   ),
  //   multiCall(
  //     OracleABI,
  //     rewardTokenAddress.map((address: string, _: number) => ({
  //       address: getAddr("ORACLE_ADDRESS", appState.chainId),
  //       name: "getAssetPrice",
  //       params: [address],
  //     })),
  //     appState.web3,
  //     appState.chainId
  //   )
  // ]);

  for (let i = 0; i < vaultConfigList.length; i++) {

    let claimableReward = BigNumber(0);
    let eps = "0"
    if(vaultConfigList[i].id == "orai") {
      const vestingCR = new Contract(getAddr("VESTING_TRAVA_ADDRESS", appState.chainId), VestingTokenAbi, appState.web3);
      claimableReward = await vestingCR.getClaimableReward(appState.smartWalletState.address, vaultConfigList[i].underlyingAddress)
      eps = "0.005549"
    } else {
      const stakedCR = new Contract(vaultConfigList[i].stakedTokenAddress, StakedTokenAbi, appState.web3);
      claimableReward = await stakedCR.getTotalRewardsBalance(appState.smartWalletState.address)
      eps =  BigNumber(await stakedCR.getAssetEmissionPerSecond(vaultConfigList[i].stakedTokenAddress)).div(vaultConfigList[i].reserveDecimals).toFixed()
    }
    
    let stakedToken: StakedTokenData = {
      id: vaultConfigList[i].id,
      name: vaultConfigList[i].name,
      code: vaultConfigList[i].code,
      stakedTokenAddress: vaultConfigList[i].stakedTokenAddress,
      eps: eps,
      reserveDecimals: vaultConfigList[i].reserveDecimals
    }

    let underlyingToken: UnderlyingTokenData = {
      underlyingAddress: vaultConfigList[i].underlyingAddress,
      reserveDecimals: vaultConfigList[i].reserveDecimals,
      price: "0" //underlyingTokenPriceDatas[i]
    }

    let rewardToken: RewardTokenData = {
      address: vaultConfigList[i].rewardToken.address,
      decimals: vaultConfigList[i].rewardToken.decimals,
      price: "0", // rewardTokenPriceDatas[i]
    }

    let TVL = BigNumber(TVLDatas[i]).div(underlyingToken.reserveDecimals).multipliedBy(underlyingToken.price)
    let APR = BigNumber(eps).multipliedBy(rewardToken.price).multipliedBy(YEAR_TO_SECONDS).div(TVL).div(100);
    if(APR.isNaN()) {
      APR = BigNumber(0);
    }

    let accountVaults: BaseAccountVault = {
      claimable: vaultConfigList[i].claimable,
      claimableReward: claimableReward.toString(),
      deposited: depositedDatas[i].toString(),
      TVL: TVL.toFixed(),
      APR: APR.toFixed(),
      underlyingToken: underlyingToken,
      stakedToken: stakedToken,
      rewardToken: rewardToken
    }

    appState.smartWalletState.travaLPStakingStateList.set(vaultConfigList[i].stakedTokenAddress.toLowerCase(), accountVaults);
    if (!appState.smartWalletState.tokenBalances.has(vaultConfigList[i].stakedTokenAddress.toLowerCase())) {
      appState = await updateSmartWalletTokenBalance(appState, vaultConfigList[i].stakedTokenAddress.toLowerCase())
    }
  }
  return appState;
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