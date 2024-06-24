
import { ApplicationState } from "../../State/ApplicationState";
import { Contract } from "ethers";
import _ from "lodash";
import { listLiquidityVault } from "./LiquidityCampainConfig";
import BEP20ABI from "../../abis/BEP20.json";
import IVaultABI from "../../abis/IVault.json";
import StakedTokenAbi from "../../abis/StakedToken.json";
import BigNumber from "bignumber.js";
import { BaseAccountVault, LiquidityCampain, RewardTokenData, StakedTokenData, UnderlyingTokenData } from "../../State";
import { YEAR_TO_SECONDS, getAddr } from "../../utils";
import OracleABI from "../../abis/AaveOracle.json";
import { EthAddress } from "../../utils/types";
import { multiCall } from "../../utils/helper";

export async function updateLiquidityCampainState(
    appState1: ApplicationState, 
    force?: boolean
    ): Promise<ApplicationState> {
        const vaultConfigList = listLiquidityVault[appState1.chainId];
    let appState = { ...appState1 };
    try {
        if (appState.smartWalletState.liquidityCampainState.isFetch == false || force == true){
            let underlyingAddress = new Array<EthAddress>;
            let priceUnderlyingAddress = new Array<EthAddress>
            let otherTokenInLpAddress = new Array<EthAddress>;
            let lpAddress = new Array<EthAddress>;
            let stakedTokenAddress = new Array<EthAddress>;
            let rewardTokenAddress = new Array<EthAddress>;
            for (let i = 0; i < vaultConfigList.length; i++) {
                underlyingAddress.push(vaultConfigList[i].underlyingAddress.toLowerCase());
                priceUnderlyingAddress.push(vaultConfigList[i].priceUnderlyingAddress.toLowerCase());
                otherTokenInLpAddress.push(vaultConfigList[i].otherTokenInLpAddress.toLowerCase());
                lpAddress.push(vaultConfigList[i].lpAddress.toLowerCase());
                stakedTokenAddress.push(vaultConfigList[i].stakedTokenAddress.toLowerCase());
                rewardTokenAddress.push(vaultConfigList[i].rewardToken.address.toLowerCase());
            }

            let [
                lockTime,
                epsData,
                maxTotalDeposit,
                TVLDatas,
                stakerRewardsToClaims,
                depositedDatas,
                decimalsOtherLpToken
              ] = await Promise.all([
                multiCall(
                    IVaultABI,
                    stakedTokenAddress.map((address: string, _: number) => ({
                    address: address,
                    name: "LOCK_TIME",
                    params: [],
                    })),
                    appState.web3,
                    appState.chainId
                ),
                multiCall(
                    IVaultABI,
                    stakedTokenAddress.map((address: string, _: number) => ({
                    address: address,
                    name: "getAssetData",
                    params: [address],
                    })),
                    appState.web3,
                    appState.chainId
                ),
                multiCall(
                    IVaultABI,
                    stakedTokenAddress.map((address: string, _: number) => ({
                    address: address,
                    name: "MAX_TOTAL_DEPOSIT",
                    params: [],
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
                    IVaultABI,
                    stakedTokenAddress.map((address: string, _: number) => ({
                    address: address,
                    name: "getTotalRewardsBalance",
                    params: [appState.smartWalletState.address],
                    })),
                    appState.web3,
                    appState.chainId
                ),
                multiCall(
                    IVaultABI,
                    stakedTokenAddress.map((address: string, _: number) => ({
                        address: address,
                        name: "balanceOf",
                        params: [appState.smartWalletState.address],
                    })),
                    appState.web3,
                    appState.chainId
                ),
                multiCall(
                    BEP20ABI,
                    otherTokenInLpAddress.map((address: string, _: number) => ({
                    address: address,
                    name: "decimals",
                    params: [],
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
            
            for (let i = 0; i < vaultConfigList.length; i++) {
                let [priceData] = await Promise.all([
                    multiCall(
                        BEP20ABI,
                        [otherTokenInLpAddress[i], underlyingAddress[i]].map((address: string, _: number) => ({
                        address: address,
                        name: "balanceOf",
                        params: [lpAddress[i]],
                        })),
                        appState.web3,
                        appState.chainId
                    )
                ]);
                let otherTokenInLCPrice = await oracleContract.getAssetPrice(otherTokenInLpAddress[i]);
                let otherTokenInLCBalance = priceData[0];
                let underlyingTokenBalance =  priceData[1];
                let underlyingTokenPrice = BigNumber(otherTokenInLCPrice).multipliedBy(otherTokenInLCBalance).div(BigNumber(10).pow(decimalsOtherLpToken[i])).div(BigNumber(underlyingTokenBalance).div(BigNumber(10).pow(vaultConfigList[i].reserveDecimals)))
                if (underlyingTokenPrice.isNaN() || BigNumber(underlyingTokenBalance).isEqualTo(0)) {
                  underlyingTokenPrice = BigNumber(0);
                }

                let stakerRewardsToClaim = stakerRewardsToClaims[i];
                let depositedData = depositedDatas[i];
                let eps = BigNumber(epsData[i][1]).toFixed();
                let stakedToken: StakedTokenData = {
                    id: vaultConfigList[i].id,
                    name: vaultConfigList[i].name,
                    code: vaultConfigList[i].code,
                    stakedTokenAddress: vaultConfigList[i].stakedTokenAddress.toLowerCase(),
                    eps: eps,
                    reserveDecimals: vaultConfigList[i].reserveDecimals
                }

                let underlyingToken: UnderlyingTokenData = {
                    underlyingAddress: vaultConfigList[i].underlyingAddress.toLowerCase(),
                    reserveDecimals: vaultConfigList[i].reserveDecimals,
                    price: underlyingTokenPrice.toFixed(0),
                }

                let rewardToken: RewardTokenData = {
                    address: vaultConfigList[i].rewardToken.address.toLowerCase(),
                    decimals: vaultConfigList[i].rewardToken.decimals,
                    price: travaPrice.toFixed(0),
                }
                // console.log("tvlData", TVLDatas[i], underlyingToken.reserveDecimals, underlyingToken.price)
                let TVL = BigNumber(TVLDatas[i]).div(BigNumber(10).pow(underlyingToken.reserveDecimals)).multipliedBy(underlyingToken.price)
                let APR = BigNumber(eps).multipliedBy(rewardToken.price).div(BigNumber(10).pow(rewardToken.decimals)).multipliedBy(YEAR_TO_SECONDS).div(TVL);
                if (APR.isNaN()) {
                    APR = BigNumber(0);
                }

                let accountVaults: BaseAccountVault = {
                    claimable: vaultConfigList[i].claimable,
                    claimableReward: BigNumber(stakerRewardsToClaim).toFixed(),
                    deposited: BigNumber(depositedData).toFixed(),
                    TVL: TVL.toFixed(0),
                    APR: APR.toFixed(2),
                    underlyingToken: underlyingToken,
                    stakedToken: stakedToken,
                    rewardToken: rewardToken
                }

                let liquidityCampain: LiquidityCampain = {
                    ...accountVaults,
                    lockTime: BigNumber(lockTime[i]).toFixed(),
                    maxTotalDeposit: BigNumber(maxTotalDeposit[i]).toFixed(),
                }
                appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(vaultConfigList[i].stakedTokenAddress.toLowerCase(), liquidityCampain);
            }
        appState.smartWalletState.liquidityCampainState.isFetch = true;
        return appState;
    }
    } catch (error) {
        console.error(error);
    }
    return appState;
}