var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Contract } from "ethers";
import { listLiquidityVault } from "./LiquidityCampainConfig";
import BEP20ABI from "../../abis/BEP20.json";
import IVaultABI from "../../abis/IVault.json";
import StakedTokenAbi from "../../abis/StakedToken.json";
import BigNumber from "bignumber.js";
import { YEAR_TO_SECONDS, getAddr } from "../../utils";
import OracleABI from "../../abis/AaveOracle.json";
import { multiCall } from "../../utils/helper";
export function updateLiquidityCampainState(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const vaultConfigList = listLiquidityVault[appState1.chainId];
        let appState = Object.assign({}, appState1);
        try {
            if (appState.smartWalletState.liquidityCampainState.isFetch == false || force == true) {
                let underlyingAddress = new Array;
                let priceUnderlyingAddress = new Array;
                let otherTokenInLpAddress = new Array;
                let lpAddress = new Array;
                let stakedTokenAddress = new Array;
                let rewardTokenAddress = new Array;
                for (let i = 0; i < vaultConfigList.length; i++) {
                    underlyingAddress.push(vaultConfigList[i].underlyingAddress.toLowerCase());
                    priceUnderlyingAddress.push(vaultConfigList[i].priceUnderlyingAddress.toLowerCase());
                    otherTokenInLpAddress.push(vaultConfigList[i].otherTokenInLpAddress.toLowerCase());
                    lpAddress.push(vaultConfigList[i].lpAddress.toLowerCase());
                    stakedTokenAddress.push(vaultConfigList[i].stakedTokenAddress.toLowerCase());
                    rewardTokenAddress.push(vaultConfigList[i].rewardToken.address.toLowerCase());
                }
                let [lockTime, epsData, maxTotalDeposit, TVLDatas, stakerRewardsToClaims, depositedDatas, decimalsOtherLpToken] = yield Promise.all([
                    multiCall(IVaultABI, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "LOCK_TIME",
                        params: [],
                    })), appState.web3, appState.chainId),
                    multiCall(IVaultABI, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "getAssetData",
                        params: [address],
                    })), appState.web3, appState.chainId),
                    multiCall(IVaultABI, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "MAX_TOTAL_DEPOSIT",
                        params: [],
                    })), appState.web3, appState.chainId),
                    multiCall(StakedTokenAbi, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "totalSupply",
                        params: [],
                    })), appState.web3, appState.chainId),
                    multiCall(IVaultABI, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "getTotalRewardsBalance",
                        params: [appState.smartWalletState.address],
                    })), appState.web3, appState.chainId),
                    multiCall(IVaultABI, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "balanceOf",
                        params: [appState.smartWalletState.address],
                    })), appState.web3, appState.chainId),
                    multiCall(BEP20ABI, otherTokenInLpAddress.map((address, _) => ({
                        address: address,
                        name: "decimals",
                        params: [],
                    })), appState.web3, appState.chainId)
                ]);
                let oracleContract = new Contract(getAddr("ORACLE_ADDRESS", appState.chainId), OracleABI, appState.web3);
                let bnbPrice = yield oracleContract.getAssetPrice(getAddr("WBNB_ADDRESS", appState.chainId));
                let wbnbContract = new Contract(getAddr("WBNB_ADDRESS", appState.chainId), BEP20ABI, appState.web3);
                let wbnbBalanceTravalp = yield wbnbContract.balanceOf(getAddr("WBNB_TRAVA_LP_ADDRESS", appState.chainId));
                let travaContract = new Contract(getAddr("TRAVA_TOKEN_IN_STAKING", appState.chainId), BEP20ABI, appState.web3);
                let travaBalanceTravalp = yield travaContract.balanceOf(getAddr("WBNB_TRAVA_LP_ADDRESS", appState.chainId));
                let travaPrice = BigNumber(bnbPrice).multipliedBy(wbnbBalanceTravalp).div(travaBalanceTravalp);
                for (let i = 0; i < vaultConfigList.length; i++) {
                    let [priceData] = yield Promise.all([
                        multiCall(BEP20ABI, [otherTokenInLpAddress[i], underlyingAddress[i]].map((address, _) => ({
                            address: address,
                            name: "balanceOf",
                            params: [lpAddress[i]],
                        })), appState.web3, appState.chainId)
                    ]);
                    let otherTokenInLCPrice = yield oracleContract.getAssetPrice(otherTokenInLpAddress[i]);
                    let otherTokenInLCBalance = priceData[0];
                    let underlyingTokenBalance = priceData[1];
                    let underlyingTokenPrice = BigNumber(otherTokenInLCPrice).multipliedBy(otherTokenInLCBalance).div(BigNumber(10).pow(decimalsOtherLpToken[i])).div(BigNumber(underlyingTokenBalance).div(BigNumber(10).pow(vaultConfigList[i].reserveDecimals)));
                    if (underlyingTokenPrice.isNaN() || BigNumber(underlyingTokenBalance).isEqualTo(0)) {
                        underlyingTokenPrice = BigNumber(0);
                    }
                    let stakerRewardsToClaim = stakerRewardsToClaims[i];
                    let depositedData = depositedDatas[i];
                    let eps = BigNumber(epsData[i][1]).toFixed();
                    let stakedToken = {
                        id: vaultConfigList[i].id,
                        name: vaultConfigList[i].name,
                        code: vaultConfigList[i].code,
                        stakedTokenAddress: vaultConfigList[i].stakedTokenAddress.toLowerCase(),
                        eps: eps,
                        reserveDecimals: vaultConfigList[i].reserveDecimals
                    };
                    let underlyingToken = {
                        underlyingAddress: vaultConfigList[i].underlyingAddress.toLowerCase(),
                        reserveDecimals: vaultConfigList[i].reserveDecimals,
                        price: underlyingTokenPrice.toFixed(0),
                    };
                    let rewardToken = {
                        address: vaultConfigList[i].rewardToken.address.toLowerCase(),
                        decimals: vaultConfigList[i].rewardToken.decimals,
                        price: travaPrice.toFixed(0),
                    };
                    // console.log("tvlData", TVLDatas[i], underlyingToken.reserveDecimals, underlyingToken.price)
                    let TVL = BigNumber(TVLDatas[i]).div(BigNumber(10).pow(underlyingToken.reserveDecimals)).multipliedBy(underlyingToken.price);
                    let APR = BigNumber(eps).multipliedBy(rewardToken.price).div(BigNumber(10).pow(rewardToken.decimals)).multipliedBy(YEAR_TO_SECONDS).div(TVL);
                    if (APR.isNaN()) {
                        APR = BigNumber(0);
                    }
                    let accountVaults = {
                        claimable: vaultConfigList[i].claimable,
                        claimableReward: BigNumber(stakerRewardsToClaim).toFixed(),
                        deposited: BigNumber(depositedData).toFixed(),
                        TVL: TVL.toFixed(0),
                        APR: APR.toFixed(2),
                        underlyingToken: underlyingToken,
                        stakedToken: stakedToken,
                        rewardToken: rewardToken
                    };
                    let liquidityCampain = Object.assign(Object.assign({}, accountVaults), { lockTime: BigNumber(lockTime[i]).toFixed(), maxTotalDeposit: BigNumber(maxTotalDeposit[i]).toFixed() });
                    appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(vaultConfigList[i].stakedTokenAddress.toLowerCase(), liquidityCampain);
                }
                appState.smartWalletState.liquidityCampainState.isFetch = true;
                return appState;
            }
        }
        catch (error) {
            console.error(error);
        }
        return appState;
    });
}
