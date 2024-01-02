
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { Contract } from "ethers";
import _ from "lodash";
import { listLiquidityVault } from "./LiquidityCampainConfig";
import { multiCall } from "orchai-combinator-bsc-simulation";
import BEP20ABI from "../../abis/BEP20.json";
import IVaultABI from "../../abis/IVault.json";
import StakedTokenAbi from "../../abis/StakedToken.json";
import BigNumber from "bignumber.js";
import { BaseAccountVault, LiquidityCampain, RewardTokenData, StakedTokenData, UnderlyingTokenData } from "../../State";
import { YEAR_TO_SECONDS, getAddr } from "../../utils";
import OracleABI from "../../abis/AaveOracle.json";

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
                joinTime,
                epsData,
                maxTotalDeposit,
                TVLDatas,
                priceDataBUSDTRAVA,
                stakerRewardsToClaims,
                amountsUserReferreds,
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
                    name: "JOIN_TIME",
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
                    BEP20ABI,
                    [getAddr("BUSD_TOKEN", appState.chainId), getAddr("TRAVA_TOKEN", appState.chainId)].map((address: string, _: number) => ({
                    address: address,
                    name: "balanceOf",
                    params: [getAddr("BUSD_TRAVA_LC_ADDRESS", appState.chainId)],
                    })),
                    appState.web3,
                    appState.chainId
                ),
                multiCall(
                    IVaultABI,
                    stakedTokenAddress.map((address: string, _: number) => ({
                    address: address,
                    name: "stakerRewardsToClaim",
                    params: [appState.smartWalletState.address],
                    })),
                    appState.web3,
                    appState.chainId
                ),
                multiCall(
                    IVaultABI,
                    stakedTokenAddress.map((address: string, _: number) => ({
                    address: address,
                    name: "amountsUserReferred",
                    params: [appState.smartWalletState.address],
                    })),
                    appState.web3,
                    appState.chainId
                ),
            ]);

            
            let oracleContract = new Contract(getAddr("ORACLE_ADDRESS", appState.chainId), OracleABI, appState.web3)
            let busdPrice = await oracleContract.getAssetPrice(getAddr("BUSD_TOKEN", appState.chainId));
            
            let busdBalanceTravalc = priceDataBUSDTRAVA[0];
            let travaBalanceTravalc =   priceDataBUSDTRAVA[1];
            let travaPrice = BigNumber(busdPrice).multipliedBy(busdBalanceTravalc).div(travaBalanceTravalc)
            if (travaPrice.isNaN()) {
                travaPrice = BigNumber(0);
            }
            
            
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
                    ),
                ]);
                let otherTokenInLCPrice = await oracleContract.getAssetPrice(otherTokenInLpAddress[i]);
                let otherTokenInLCBalance = priceData[0];
                let underlyingTokenBalance =  priceData[1];
                let underlyingTokenPrice = BigNumber(otherTokenInLCPrice).multipliedBy(otherTokenInLCBalance).div(underlyingTokenBalance)
                if (underlyingTokenPrice.isNaN() || BigNumber(underlyingTokenBalance).isEqualTo(0)) {
                  underlyingTokenPrice = BigNumber(0);
                }

                let stakerRewardsToClaim = stakerRewardsToClaims[i];
                let amountsUserReferred = amountsUserReferreds[i];
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
                    price: underlyingTokenPrice.toFixed(),
                }

                let rewardToken: RewardTokenData = {
                    address: vaultConfigList[i].rewardToken.address.toLowerCase(),
                    decimals: vaultConfigList[i].rewardToken.decimals,
                    price: travaPrice.toFixed(),
                }

                let TVL = BigNumber(TVLDatas[i]).div(underlyingToken.reserveDecimals).multipliedBy(underlyingToken.price)

                let APR = BigNumber(eps).multipliedBy(rewardToken.price).multipliedBy(YEAR_TO_SECONDS).div(TVL);
                if (APR.isNaN()) {
                    APR = BigNumber(0);
                }

                let accountVaults: BaseAccountVault = {
                    claimable: vaultConfigList[i].claimable,
                    claimableReward: BigNumber(stakerRewardsToClaim).toFixed(),
                    deposited: BigNumber(amountsUserReferred).toFixed(),
                    TVL: TVL.toFixed(),
                    APR: APR.toFixed(),
                    underlyingToken: underlyingToken,
                    stakedToken: stakedToken,
                    rewardToken: rewardToken
                }

                let liquidityCampain: LiquidityCampain = {
                    ...accountVaults,
                    lockTime: BigNumber(lockTime[i]).toFixed(),
                    joinTime: BigNumber(joinTime[i]).toFixed(),
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