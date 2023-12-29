
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { Contract } from "ethers";
import _ from "lodash";
import { getMode } from "../../utils/helper";
import { listLiquidityVault } from "./LiquidityCampainConfig";
import { multiCall } from "orchai-combinator-bsc-simulation";
import BEP20ABI from "../../abis/BEP20.json";
import IVaultABI from "../../abis/IVault.json";
import StakedTokenAbi from "../../abis/StakedToken.json";
import BigNumber from "bignumber.js";
import { BaseAccountVault, LiquidityCampain, LiquidityCampainState, RewardTokenData, StakedTokenData, UnderlyingTokenData } from "../../State";
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

            // get join time and lock time
            let [
                lockTime,
                joinTime,
                TVLDatas,
                priceDataBUSDTRAVA,
                priceDataBUSDTOD,
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
                    BEP20ABI,
                    [getAddr("BUSD_TOKEN", appState.chainId), getAddr("TOD_TOKEN", appState.chainId)].map((address: string, _: number) => ({
                    address: address,
                    name: "balanceOf",
                    params: [getAddr("BUSD_TOD_LC_ADDRESS", appState.chainId)],
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
        
            let busdBalanceTODlc = priceDataBUSDTOD[0];
            let todBalanceTODlc =  priceDataBUSDTOD[1];
            let todPrice = BigNumber(busdPrice).multipliedBy(busdBalanceTODlc).div(todBalanceTODlc)
            if (todPrice.isNaN()) {
              todPrice = BigNumber(0);
            }

            for (let i = 0; i < vaultConfigList.length; i++) {
                let vaultContract = new Contract(vaultConfigList[i].stakedTokenAddress, IVaultABI, appState.web3);
                let stakerRewardsToClaim = await vaultContract.stakerRewardsToClaim(appState.smartWalletState.address);
                let amountsUserReferred = await vaultContract.amountsUserReferred(appState.smartWalletState.address);
                let eps = 0; // TODO
                // init state stakeToken
                let stakedToken: StakedTokenData = {
                    id: vaultConfigList[i].id,
                    name: vaultConfigList[i].name,
                    code: vaultConfigList[i].code,
                    stakedTokenAddress: vaultConfigList[i].stakedTokenAddress.toLowerCase(),
                    eps: "", // TODO
                    reserveDecimals: vaultConfigList[i].reserveDecimals
                }

                // init state underlyingToken
                let underlyingToken: UnderlyingTokenData = {
                    underlyingAddress: vaultConfigList[i].underlyingAddress.toLowerCase(),
                    reserveDecimals: vaultConfigList[i].reserveDecimals,
                    price: "",
                }
                if (vaultConfigList[i].id == "TRAVA") {
                    underlyingToken.price = travaPrice.toFixed();
                } else if (vaultConfigList[i].id == "TOD") {
                    underlyingToken.price = todPrice.toFixed();
                } else {
                    throw new Error("Not support underlying token");
                }


                // init state rewardToken
                let rewardToken: RewardTokenData = {
                    address: vaultConfigList[i].rewardToken.address.toLowerCase(),
                    decimals: vaultConfigList[i].rewardToken.decimals,
                    price: travaPrice.toFixed(),
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
                    claimableReward: BigNumber(stakerRewardsToClaim).toFixed(),
                    deposited: BigNumber(amountsUserReferred).toFixed(),
                    TVL: TVL.toFixed(),
                    APR: APR.toFixed(),
                    underlyingToken: underlyingToken,
                    stakedToken: stakedToken,
                    rewardToken: rewardToken
                }

                // Init Liquidity Campain State
                let liquidityCampain: LiquidityCampain = {
                    ...accountVaults,
                    lockTime: BigNumber(lockTime[i]).toFixed(),
                    joinTime: BigNumber(joinTime[i]).toFixed(),
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