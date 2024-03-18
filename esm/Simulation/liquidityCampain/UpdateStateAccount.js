"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLiquidityCampainState = void 0;
const ethers_1 = require("ethers");
const LiquidityCampainConfig_1 = require("./LiquidityCampainConfig");
const orchai_combinator_bsc_simulation_1 = require("orchai-combinator-bsc-simulation");
const BEP20_json_1 = __importDefault(require("../../abis/BEP20.json"));
const IVault_json_1 = __importDefault(require("../../abis/IVault.json"));
const StakedToken_json_1 = __importDefault(require("../../abis/StakedToken.json"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const utils_1 = require("../../utils");
const AaveOracle_json_1 = __importDefault(require("../../abis/AaveOracle.json"));
function updateLiquidityCampainState(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const vaultConfigList = LiquidityCampainConfig_1.listLiquidityVault[appState1.chainId];
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
                    (0, orchai_combinator_bsc_simulation_1.multiCall)(IVault_json_1.default, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "LOCK_TIME",
                        params: [],
                    })), appState.web3, appState.chainId),
                    (0, orchai_combinator_bsc_simulation_1.multiCall)(IVault_json_1.default, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "getAssetData",
                        params: [address],
                    })), appState.web3, appState.chainId),
                    (0, orchai_combinator_bsc_simulation_1.multiCall)(IVault_json_1.default, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "MAX_TOTAL_DEPOSIT",
                        params: [],
                    })), appState.web3, appState.chainId),
                    (0, orchai_combinator_bsc_simulation_1.multiCall)(StakedToken_json_1.default, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "totalSupply",
                        params: [],
                    })), appState.web3, appState.chainId),
                    (0, orchai_combinator_bsc_simulation_1.multiCall)(IVault_json_1.default, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "getTotalRewardsBalance",
                        params: [appState.smartWalletState.address],
                    })), appState.web3, appState.chainId),
                    (0, orchai_combinator_bsc_simulation_1.multiCall)(IVault_json_1.default, stakedTokenAddress.map((address, _) => ({
                        address: address,
                        name: "balanceOf",
                        params: [appState.smartWalletState.address],
                    })), appState.web3, appState.chainId),
                    (0, orchai_combinator_bsc_simulation_1.multiCall)(BEP20_json_1.default, otherTokenInLpAddress.map((address, _) => ({
                        address: address,
                        name: "decimals",
                        params: [],
                    })), appState.web3, appState.chainId)
                ]);
                let oracleContract = new ethers_1.Contract((0, utils_1.getAddr)("ORACLE_ADDRESS", appState.chainId), AaveOracle_json_1.default, appState.web3);
                let bnbPrice = yield oracleContract.getAssetPrice((0, utils_1.getAddr)("WBNB_ADDRESS", appState.chainId));
                let wbnbContract = new ethers_1.Contract((0, utils_1.getAddr)("WBNB_ADDRESS", appState.chainId), BEP20_json_1.default, appState.web3);
                let wbnbBalanceTravalp = yield wbnbContract.balanceOf((0, utils_1.getAddr)("WBNB_TRAVA_LP_ADDRESS", appState.chainId));
                let travaContract = new ethers_1.Contract((0, utils_1.getAddr)("TRAVA_TOKEN_IN_STAKING", appState.chainId), BEP20_json_1.default, appState.web3);
                let travaBalanceTravalp = yield travaContract.balanceOf((0, utils_1.getAddr)("WBNB_TRAVA_LP_ADDRESS", appState.chainId));
                let travaPrice = (0, bignumber_js_1.default)(bnbPrice).multipliedBy(wbnbBalanceTravalp).div(travaBalanceTravalp);
                for (let i = 0; i < vaultConfigList.length; i++) {
                    let [priceData] = yield Promise.all([
                        (0, orchai_combinator_bsc_simulation_1.multiCall)(BEP20_json_1.default, [otherTokenInLpAddress[i], underlyingAddress[i]].map((address, _) => ({
                            address: address,
                            name: "balanceOf",
                            params: [lpAddress[i]],
                        })), appState.web3, appState.chainId)
                    ]);
                    let otherTokenInLCPrice = yield oracleContract.getAssetPrice(otherTokenInLpAddress[i]);
                    let otherTokenInLCBalance = priceData[0];
                    let underlyingTokenBalance = priceData[1];
                    let underlyingTokenPrice = (0, bignumber_js_1.default)(otherTokenInLCPrice).multipliedBy(otherTokenInLCBalance).div((0, bignumber_js_1.default)(10).pow(decimalsOtherLpToken[i])).div((0, bignumber_js_1.default)(underlyingTokenBalance).div((0, bignumber_js_1.default)(10).pow(vaultConfigList[i].reserveDecimals)));
                    if (underlyingTokenPrice.isNaN() || (0, bignumber_js_1.default)(underlyingTokenBalance).isEqualTo(0)) {
                        underlyingTokenPrice = (0, bignumber_js_1.default)(0);
                    }
                    let stakerRewardsToClaim = stakerRewardsToClaims[i];
                    let depositedData = depositedDatas[i];
                    let eps = (0, bignumber_js_1.default)(epsData[i][1]).toFixed();
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
                    console.log("tvlData", TVLDatas[i], underlyingToken.reserveDecimals, underlyingToken.price);
                    let TVL = (0, bignumber_js_1.default)(TVLDatas[i]).div((0, bignumber_js_1.default)(10).pow(underlyingToken.reserveDecimals)).multipliedBy(underlyingToken.price);
                    let APR = (0, bignumber_js_1.default)(eps).multipliedBy(rewardToken.price).div((0, bignumber_js_1.default)(10).pow(rewardToken.decimals)).multipliedBy(utils_1.YEAR_TO_SECONDS).div(TVL);
                    if (APR.isNaN()) {
                        APR = (0, bignumber_js_1.default)(0);
                    }
                    let accountVaults = {
                        claimable: vaultConfigList[i].claimable,
                        claimableReward: (0, bignumber_js_1.default)(stakerRewardsToClaim).toFixed(),
                        deposited: (0, bignumber_js_1.default)(depositedData).toFixed(),
                        TVL: TVL.toFixed(0),
                        APR: APR.toFixed(2),
                        underlyingToken: underlyingToken,
                        stakedToken: stakedToken,
                        rewardToken: rewardToken
                    };
                    let liquidityCampain = Object.assign(Object.assign({}, accountVaults), { lockTime: (0, bignumber_js_1.default)(lockTime[i]).toFixed(), maxTotalDeposit: (0, bignumber_js_1.default)(maxTotalDeposit[i]).toFixed() });
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
exports.updateLiquidityCampainState = updateLiquidityCampainState;
