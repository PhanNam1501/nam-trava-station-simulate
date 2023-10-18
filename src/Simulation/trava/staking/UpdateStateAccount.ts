import { Contract, Interface } from "ethers";
import { ApplicationState } from "../../../State/ApplicationState";
import StakedTokenAbi from "../../../abis/StakedToken.json";
import VestingTokenAbi from "../../../abis/VestingTrava.json";
import { getAddr } from "../../../utils/address";
import { listStakingVault } from "../../../utils/stakingVaultConfig";
import { YEAR_TO_SECONDS } from "../../../utils/config";
import { BaseAccountVault, RewardTokenData, StakedTokenData, UnderlyingTokenData } from "../../../State/TravaDeFiState";
import BigNumber from "bignumber.js";
import MultiCallABI from "../../../abis/Multicall.json";
import OracleABI from "../../../abis/AaveOracle.json";
import { updateSmartWalletTokenBalance } from "../../basic/UpdateStateAccount";
import BEP20ABI from "../../../abis/BEP20.json";

export async function updateAllAccountVault(appState1: ApplicationState) {
  const vaultConfigList = listStakingVault[appState1.chainId];
  let appState = { ...appState1 };

  let underlyingAddress = new Array<string>;
  let priceUnderlyingAddress = new Array<string>
  let lpAddress = new Array<string>;
  let stakedTokenAddress = new Array<string>;
  let rewardTokenAddress = new Array<string>;
  for (let i = 0; i < vaultConfigList.length; i++) {
    underlyingAddress.push(vaultConfigList[i].underlyingAddress);
    priceUnderlyingAddress.push(vaultConfigList[i].priceUnderlyingAddress);
    lpAddress.push(vaultConfigList[i].lpAddress)
    stakedTokenAddress.push(vaultConfigList[i].stakedTokenAddress);
    rewardTokenAddress.push(vaultConfigList[i].rewardToken.address)
  }

  let [
    depositedDatas, // data of total deposit in all vaults
    TVLDatas, // data of total supply all staked tokens
    bnbBalanceInVaults // balance of bnb in all vaults
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
    ),
    multiCall(
      BEP20ABI,
      lpAddress.map((address: string, _: number) => ({
        address: getAddr("WBNB_ADDRESS", appState.chainId),
        name: "balanceOf",
        params: [address],
      })),
      appState.web3,
      appState.chainId
    )
  ]);


  let oracleContract = new Contract(getAddr("ORACLE_ADDRESS", appState.chainId), OracleABI, appState.web3)
  let bnbPrice = await oracleContract.getAssetPrice(getAddr("WBNB_ADDRESS", appState.chainId));

  let wbnbContract = new Contract(getAddr("WBNB_ADDRESS", appState.chainId), BEP20ABI, appState.web3);
  let wbnbBalanceTravalp = await wbnbContract.balanceOf(getAddr("WBNB_TRAVA_LP_ADDRESS", appState.chainId));

  let travaContract = new Contract(getAddr("TRAVA_TOKEN_IN_STAKING", appState.chainId), BEP20ABI, appState.web3);
  let travaBalanceTravalp = await travaContract.balanceOf(getAddr("WBNB_TRAVA_LP_ADDRESS", appState.chainId));

  let travaPrice = BigNumber(bnbPrice).multipliedBy(wbnbBalanceTravalp).div(travaBalanceTravalp)
  if (travaPrice.isNaN()) {
    travaPrice = BigNumber(0);
  }

  for (let i = 0; i < vaultConfigList.length; i++) {

    //calculate claimable reward and eps (epoch permit seconds)
    let claimableReward = BigNumber(0);
    let eps = "0"
    if (vaultConfigList[i].id == "orai") {
      const vestingCR = new Contract(getAddr("VESTING_TRAVA_ADDRESS", appState.chainId), VestingTokenAbi, appState.web3);
      claimableReward = await vestingCR.getClaimableReward(appState.smartWalletState.address, vaultConfigList[i].underlyingAddress)
      eps = "0.005549"
    } else {
      const stakedCR = new Contract(vaultConfigList[i].stakedTokenAddress, StakedTokenAbi, appState.web3);
      claimableReward = await stakedCR.getTotalRewardsBalance(appState.smartWalletState.address)
      eps = BigNumber(await stakedCR.getAssetEmissionPerSecond(vaultConfigList[i].stakedTokenAddress)).div(vaultConfigList[i].reserveDecimals).toFixed()
    }

    /** calculate underlying token price
     * Consider vault underlying token / BNB, we have:
     * + bnb price * bnb balance in vault = underlying price * underlying balance in vault
     * + bnb price * bnb balance in vault + underlying price * underlying balance in vault = lp pair token price * lp pair token total supply
     * => 2 * bnb price * bnb balance in vault = 2 * underlying price * underlying balance in vault = lp pair token price * lp pair token total supply
     * if underlying token is not pair 
     *      return underlying price = bnb price * bnb balance in vault / underlying balance in vault
     *  else: 
     *      return lp pair token price = 2 * bnb price * bnb balance in vault / lp pair token total supply
     */

    let underlyingTokenPrice = BigNumber(0)
    if (vaultConfigList[i].underlyingAddress.toLowerCase() != vaultConfigList[i].lpAddress.toLowerCase()) {
      // if underlying is rTrava or Trava, it is calculated above
      if (vaultConfigList[i].priceUnderlyingAddress.toLowerCase() == getAddr("TRAVA_TOKEN_IN_STAKING", appState.chainId).toLowerCase()) {
        underlyingTokenPrice = travaPrice
      } else {
        let priceUnderlyingTokenContract = new Contract(vaultConfigList[i].priceUnderlyingAddress, BEP20ABI, appState.web3);
        let balanceOfUnderlyingTokenInVault = await priceUnderlyingTokenContract.balanceOf(vaultConfigList[i].lpAddress);
        underlyingTokenPrice = BigNumber(bnbPrice).multipliedBy(bnbBalanceInVaults[i]).div(balanceOfUnderlyingTokenInVault);
      }
    } else {
      let lpContract = new Contract(vaultConfigList[i].lpAddress, StakedTokenAbi, appState.web3);
      let totalSupply = await lpContract.totalSupply();
      underlyingTokenPrice = BigNumber(bnbPrice).multipliedBy(bnbBalanceInVaults[i]).multipliedBy(2).div(totalSupply);
    }

    if (underlyingTokenPrice.isNaN()) {
      underlyingTokenPrice = BigNumber(0);
    }

    // init state stakeToken
    let stakedToken: StakedTokenData = {
      id: vaultConfigList[i].id,
      name: vaultConfigList[i].name,
      code: vaultConfigList[i].code,
      stakedTokenAddress: vaultConfigList[i].stakedTokenAddress,
      eps: eps,
      reserveDecimals: vaultConfigList[i].reserveDecimals
    }

    // init state underlyingToken
    let underlyingToken: UnderlyingTokenData = {
      underlyingAddress: vaultConfigList[i].underlyingAddress,
      reserveDecimals: vaultConfigList[i].reserveDecimals,
      price: underlyingTokenPrice.toFixed(0) //underlyingTokenPriceDatas[i]
    }

    /**Caculate reward token price
     * if reward token price is trava, rewardTokenPrice = trava price which is caculated above
     */
    let rewardTokenPrice = BigNumber("0");
    if (vaultConfigList[i].rewardToken.address.toLowerCase() == getAddr("TRAVA_TOKEN_IN_STAKING", appState.chainId).toLowerCase()) {
      rewardTokenPrice = travaPrice
    }
    // init state rewardToken
    let rewardToken: RewardTokenData = {
      address: vaultConfigList[i].rewardToken.address,
      decimals: vaultConfigList[i].rewardToken.decimals,
      price: rewardTokenPrice.toFixed(0), // rewardTokenPriceDatas[i]
    }

    // Calculate TVL = TVL amount * price
    let TVL = BigNumber(TVLDatas[i]).div(underlyingToken.reserveDecimals).multipliedBy(underlyingToken.price)

    // Calculate APR = eps * Reward token price * 1 year to seconds / TVL / 100 
    let APR = BigNumber(eps).multipliedBy(rewardToken.price).multipliedBy(YEAR_TO_SECONDS).div(TVL);
    if (APR.isNaN()) {
      APR = BigNumber(0);
    }

    // Init state smart wallet in vault[i]
    let accountVaults: BaseAccountVault = {
      claimable: vaultConfigList[i].claimable,
      claimableReward: claimableReward.toString(),
      deposited: depositedDatas[i].toString(),
      TVL: TVL.toFixed(0),
      APR: APR.toFixed(),
      underlyingToken: underlyingToken,
      stakedToken: stakedToken,
      rewardToken: rewardToken
    }

    //store sate
    appState.smartWalletState.travaLPStakingStateList.set(vaultConfigList[i].stakedTokenAddress.toLowerCase(), accountVaults);
    if (!appState.smartWalletState.tokenBalances.has(vaultConfigList[i].stakedTokenAddress.toLowerCase())) {
      // store balance of stakedTokenAddress
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