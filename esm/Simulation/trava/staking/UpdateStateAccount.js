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
exports.updateAllAccountVault = void 0;
const ethers_1 = require("ethers");
const StakedToken_json_1 = __importDefault(require("../../../abis/StakedToken.json"));
const VestingTrava_json_1 = __importDefault(require("../../../abis/VestingTrava.json"));
const address_1 = require("../../../utils/address");
const stakingVaultConfig_1 = require("../../../utils/stakingVaultConfig");
const config_1 = require("../../../utils/config");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const AaveOracle_json_1 = __importDefault(require("../../../abis/AaveOracle.json"));
const UpdateStateAccount_1 = require("../../basic/UpdateStateAccount");
const BEP20_json_1 = __importDefault(require("../../../abis/BEP20.json"));
const helper_1 = require("../../../utils/helper");
function updateAllAccountVault(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const vaultConfigList = stakingVaultConfig_1.listStakingVault[appState1.chainId];
        let appState = Object.assign({}, appState1);
        let underlyingAddress = new Array;
        let priceUnderlyingAddress = new Array;
        let lpAddress = new Array;
        let stakedTokenAddress = new Array;
        let rewardTokenAddress = new Array;
        for (let i = 0; i < vaultConfigList.length; i++) {
            underlyingAddress.push(vaultConfigList[i].underlyingAddress);
            priceUnderlyingAddress.push(vaultConfigList[i].priceUnderlyingAddress);
            lpAddress.push(vaultConfigList[i].lpAddress);
            stakedTokenAddress.push(vaultConfigList[i].stakedTokenAddress);
            rewardTokenAddress.push(vaultConfigList[i].rewardToken.address);
        }
        let [depositedDatas, // data of total deposit in all vaults
        TVLDatas, // data of total supply all staked tokens
        bnbBalanceInVaults // balance of bnb in all vaults
        ] = yield Promise.all([
            (0, helper_1.multiCall)(StakedToken_json_1.default, stakedTokenAddress.map((address, _) => ({
                address: address,
                name: "balanceOf",
                params: [appState.smartWalletState.address],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(StakedToken_json_1.default, stakedTokenAddress.map((address, _) => ({
                address: address,
                name: "totalSupply",
                params: [],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, lpAddress.map((address, _) => ({
                address: (0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId),
                name: "balanceOf",
                params: [address],
            })), appState.web3, appState.chainId)
        ]);
        let oracleContract = new ethers_1.Contract((0, address_1.getAddr)("ORACLE_ADDRESS", appState.chainId), AaveOracle_json_1.default, appState.web3);
        let bnbPrice = yield oracleContract.getAssetPrice((0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId));
        let wbnbContract = new ethers_1.Contract((0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId), BEP20_json_1.default, appState.web3);
        let wbnbBalanceTravalp = yield wbnbContract.balanceOf((0, address_1.getAddr)("WBNB_TRAVA_LP_ADDRESS", appState.chainId));
        let travaContract = new ethers_1.Contract((0, address_1.getAddr)("TRAVA_TOKEN_IN_STAKING", appState.chainId), BEP20_json_1.default, appState.web3);
        let travaBalanceTravalp = yield travaContract.balanceOf((0, address_1.getAddr)("WBNB_TRAVA_LP_ADDRESS", appState.chainId));
        let travaPrice = (0, bignumber_js_1.default)(bnbPrice).multipliedBy(wbnbBalanceTravalp).div(travaBalanceTravalp);
        if (travaPrice.isNaN()) {
            travaPrice = (0, bignumber_js_1.default)(0);
        }
        for (let i = 0; i < vaultConfigList.length; i++) {
            //calculate claimable reward and eps (epoch permit seconds)
            let claimableReward = (0, bignumber_js_1.default)(0);
            let eps = "0";
            if (vaultConfigList[i].id == "orai") {
                const vestingCR = new ethers_1.Contract((0, address_1.getAddr)("VESTING_TRAVA_ADDRESS", appState.chainId), VestingTrava_json_1.default, appState.web3);
                claimableReward = yield vestingCR.getClaimableReward(appState.smartWalletState.address, vaultConfigList[i].underlyingAddress);
                eps = "0.005549";
            }
            else {
                const stakedCR = new ethers_1.Contract(vaultConfigList[i].stakedTokenAddress, StakedToken_json_1.default, appState.web3);
                claimableReward = yield stakedCR.getTotalRewardsBalance(appState.smartWalletState.address);
                eps = (0, bignumber_js_1.default)(yield stakedCR.getAssetEmissionPerSecond(vaultConfigList[i].stakedTokenAddress)).div(vaultConfigList[i].reserveDecimals).toFixed();
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
            let underlyingTokenPrice = (0, bignumber_js_1.default)(0);
            if (vaultConfigList[i].underlyingAddress.toLowerCase() != vaultConfigList[i].lpAddress.toLowerCase()) {
                // if underlying is rTrava or Trava, it is calculated above
                if (vaultConfigList[i].priceUnderlyingAddress.toLowerCase() == (0, address_1.getAddr)("TRAVA_TOKEN_IN_STAKING", appState.chainId).toLowerCase()) {
                    underlyingTokenPrice = travaPrice;
                }
                else {
                    let priceUnderlyingTokenContract = new ethers_1.Contract(vaultConfigList[i].priceUnderlyingAddress, BEP20_json_1.default, appState.web3);
                    let balanceOfUnderlyingTokenInVault = yield priceUnderlyingTokenContract.balanceOf(vaultConfigList[i].lpAddress);
                    underlyingTokenPrice = (0, bignumber_js_1.default)(bnbPrice).multipliedBy(bnbBalanceInVaults[i]).div(balanceOfUnderlyingTokenInVault);
                }
            }
            else {
                let lpContract = new ethers_1.Contract(vaultConfigList[i].lpAddress, StakedToken_json_1.default, appState.web3);
                let totalSupply = yield lpContract.totalSupply();
                underlyingTokenPrice = (0, bignumber_js_1.default)(bnbPrice).multipliedBy(bnbBalanceInVaults[i]).multipliedBy(2).div(totalSupply);
            }
            if (underlyingTokenPrice.isNaN()) {
                underlyingTokenPrice = (0, bignumber_js_1.default)(0);
            }
            // init state stakeToken
            let stakedToken = {
                id: vaultConfigList[i].id,
                name: vaultConfigList[i].name,
                code: vaultConfigList[i].code,
                stakedTokenAddress: vaultConfigList[i].stakedTokenAddress,
                eps: eps,
                reserveDecimals: vaultConfigList[i].reserveDecimals
            };
            // init state underlyingToken
            let underlyingToken = {
                underlyingAddress: vaultConfigList[i].underlyingAddress,
                reserveDecimals: vaultConfigList[i].reserveDecimals,
                price: underlyingTokenPrice.toFixed(0) //underlyingTokenPriceDatas[i]
            };
            /**Caculate reward token price
             * if reward token price is trava, rewardTokenPrice = trava price which is caculated above
             */
            let rewardTokenPrice = (0, bignumber_js_1.default)("0");
            if (vaultConfigList[i].rewardToken.address.toLowerCase() == (0, address_1.getAddr)("TRAVA_TOKEN_IN_STAKING", appState.chainId).toLowerCase()) {
                rewardTokenPrice = travaPrice;
            }
            // init state rewardToken
            let rewardToken = {
                address: vaultConfigList[i].rewardToken.address,
                decimals: vaultConfigList[i].rewardToken.decimals,
                price: rewardTokenPrice.toFixed(0), // rewardTokenPriceDatas[i]
            };
            // Calculate TVL = TVL amount * price
            let TVL = (0, bignumber_js_1.default)(TVLDatas[i]).div(underlyingToken.reserveDecimals).multipliedBy(underlyingToken.price);
            // Calculate APR = eps * Reward token price * 1 year to seconds / TVL / 100 
            let APR = (0, bignumber_js_1.default)(eps).multipliedBy(rewardToken.price).multipliedBy(config_1.YEAR_TO_SECONDS).div(TVL);
            if (APR.isNaN()) {
                APR = (0, bignumber_js_1.default)(0);
            }
            // Init state smart wallet in vault[i]
            let accountVaults = {
                claimable: vaultConfigList[i].claimable,
                claimableReward: claimableReward.toString(),
                deposited: depositedDatas[i].toString(),
                TVL: TVL.toFixed(0),
                APR: APR.toFixed(),
                underlyingToken: underlyingToken,
                stakedToken: stakedToken,
                rewardToken: rewardToken
            };
            //store sate
            appState.smartWalletState.travaLPStakingStateList.set(vaultConfigList[i].stakedTokenAddress.toLowerCase(), accountVaults);
            if (!appState.smartWalletState.tokenBalances.has(vaultConfigList[i].stakedTokenAddress.toLowerCase())) {
                // store balance of stakedTokenAddress
                appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, vaultConfigList[i].stakedTokenAddress.toLowerCase());
            }
        }
        return appState;
    });
}
exports.updateAllAccountVault = updateAllAccountVault;
