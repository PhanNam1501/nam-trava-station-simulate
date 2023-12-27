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
import { multiCall } from "orchai-combinator-bsc-simulation";
import BEP20ABI from "../../abis/BEP20.json";
import IVaultABI from "../../abis/IVault.json";
import StakedTokenAbi from "../../abis/StakedToken.json";
import BigNumber from "bignumber.js";
import { YEAR_TO_SECONDS, getAddr } from "../../utils";
import OracleABI from "../../abis/AaveOracle.json";
import { error } from "console";
export function updateLiquidityCampainState(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const vaultConfigList = listLiquidityVault[appState1.chainId];
        let appState = Object.assign({}, appState1);
        try {
            if (appState.smartWalletState.liquidityCampainState.isFetch == false || force == true) {
                let underlyingAddress = new Array;
                let priceUnderlyingAddress = new Array;
                let stakedTokenAddress = new Array;
                let rewardTokenAddress = new Array;
                for (let i = 0; i < vaultConfigList.length; i++) {
                    underlyingAddress.push(vaultConfigList[i].underlyingAddress);
                    priceUnderlyingAddress.push(vaultConfigList[i].priceUnderlyingAddress);
                    stakedTokenAddress.push(vaultConfigList[i].stakedTokenAddress);
                    rewardTokenAddress.push(vaultConfigList[i].rewardToken.address);
                }
                // get join time and lock time
                let [lockTime, joinTime, TVLDatas,] = yield Promise.all([
                    multiCall(IVaultABI, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "LOCK_TIME",
                        params: [],
                    })), appState.web3, appState.chainId),
                    multiCall(IVaultABI, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "JOIN_TIME",
                        params: [],
                    })), appState.web3, appState.chainId),
                    multiCall(StakedTokenAbi, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "totalSupply",
                        params: [],
                    })), appState.web3, appState.chainId),
                ]);
                let oracleContract = new Contract(getAddr("ORACLE_ADDRESS", appState.chainId), OracleABI, appState.web3);
                let busdPrice = yield oracleContract.getAssetPrice(getAddr("BUSD_TOKEN", appState.chainId));
                let busdContract = new Contract(getAddr("BUSD_TOKEN", appState.chainId), BEP20ABI, appState.web3);
                let busdBalanceTravalc = yield busdContract.balanceOf(getAddr("BUSD_TRAVA_LC_ADDRESS", appState.chainId));
                let travaContract = new Contract(getAddr("TRAVA_TOKEN", appState.chainId), BEP20ABI, appState.web3);
                let travaBalanceTravalc = yield travaContract.balanceOf(getAddr("BUSD_TRAVA_LC_ADDRESS", appState.chainId));
                let travaPrice = BigNumber(busdPrice).multipliedBy(busdBalanceTravalc).div(travaBalanceTravalc);
                if (travaPrice.isNaN()) {
                    travaPrice = BigNumber(0);
                }
                let busdBalanceTODlc = yield busdContract.balanceOf(getAddr("BUSD_TOD_LC_ADDRESS", appState.chainId));
                let todContract = new Contract(getAddr("TOD_TOKEN", appState.chainId), BEP20ABI, appState.web3);
                let todBalanceTODlc = yield todContract.balanceOf(getAddr("BUSD_TOD_LC_ADDRESS", appState.chainId));
                let todPrice = BigNumber(busdPrice).multipliedBy(busdBalanceTODlc).div(todBalanceTODlc);
                if (todPrice.isNaN()) {
                    todPrice = BigNumber(0);
                }
                console.log("travaPrice", travaPrice.toFixed());
                console.log("todPrice", todPrice.toFixed());
                for (let i = 0; i < vaultConfigList.length; i++) {
                    let vaultContract = new Contract(vaultConfigList[i].stakedTokenAddress, IVaultABI, appState.web3);
                    let stakerRewardsToClaim = yield vaultContract.stakerRewardsToClaim(appState.smartWalletState.address);
                    let amountsUserReferred = yield vaultContract.amountsUserReferred(appState.smartWalletState.address);
                    let eps = 0; // TODO
                    // init state stakeToken
                    let stakedToken = {
                        id: vaultConfigList[i].id,
                        name: vaultConfigList[i].name,
                        code: vaultConfigList[i].code,
                        stakedTokenAddress: vaultConfigList[i].stakedTokenAddress.toLowerCase(),
                        eps: "",
                        reserveDecimals: vaultConfigList[i].reserveDecimals
                    };
                    // init state underlyingToken
                    let underlyingToken = {
                        underlyingAddress: vaultConfigList[i].underlyingAddress.toLowerCase(),
                        reserveDecimals: vaultConfigList[i].reserveDecimals,
                        price: "",
                    };
                    if (vaultConfigList[i].id == "TRAVA") {
                        underlyingToken.price = travaPrice.toFixed();
                    }
                    else if (vaultConfigList[i].id == "TOD") {
                        underlyingToken.price = todPrice.toFixed();
                    }
                    else {
                        error("Not support underlying token");
                    }
                    // init state rewardToken
                    let rewardToken = {
                        address: vaultConfigList[i].rewardToken.address.toLowerCase(),
                        decimals: vaultConfigList[i].rewardToken.decimals,
                        price: travaPrice.toFixed(),
                    };
                    // Calculate TVL = TVL amount * price
                    let TVL = BigNumber(TVLDatas[i]).div(underlyingToken.reserveDecimals).multipliedBy(underlyingToken.price);
                    // Calculate APR = eps * Reward token price * 1 year to seconds / TVL / 100 
                    let APR = BigNumber(eps).multipliedBy(rewardToken.price).multipliedBy(YEAR_TO_SECONDS).div(TVL);
                    if (APR.isNaN()) {
                        APR = BigNumber(0);
                    }
                    // Init state smart wallet in vault[i]
                    let accountVaults = {
                        claimable: vaultConfigList[i].claimable,
                        claimableReward: BigNumber(stakerRewardsToClaim).toFixed(),
                        deposited: BigNumber(amountsUserReferred).toFixed(),
                        TVL: TVL.toFixed(),
                        APR: APR.toFixed(),
                        underlyingToken: underlyingToken,
                        stakedToken: stakedToken,
                        rewardToken: rewardToken
                    };
                    // Init Liquidity Campain State
                    let liquidityCampain = Object.assign(Object.assign({}, accountVaults), { lockTime: BigNumber(lockTime[i]).toFixed(), joinTime: BigNumber(joinTime[i]).toFixed() });
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
