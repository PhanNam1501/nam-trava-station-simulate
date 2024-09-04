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
exports.updatePancakeFarmState = updatePancakeFarmState;
const utils_1 = require("../../utils");
const helper_1 = require("../../utils/helper");
const v2wrapperabi_json_1 = __importDefault(require("../../abis/v2wrapperabi.json"));
const BEP20_json_1 = __importDefault(require("../../abis/BEP20.json"));
const Portfolio_1 = require("../../Portfolio");
function updatePancakeFarmState(appState1, address, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        const farmConfig = utils_1.listFarmingV2List[appState.chainId];
        const modeFrom = (0, helper_1.getMode)(appState1, address);
        if (!appState.PancakeFarmState.isFetch || !appState[modeFrom].pancakeFarmState.isFetch || force) {
            const listStakedToken = new Array(farmConfig.length);
            const listRewardTokens = new Array(farmConfig.length);
            for (let i = 0; i < farmConfig.length; i++) {
                listStakedToken[i] = farmConfig[i].stakedToken.address.toLowerCase();
                listRewardTokens[i] = farmConfig[i].rewardToken.address.toLowerCase();
            }
            const stakedTokenPrices = yield (0, Portfolio_1.getLPTokenPrice)(listStakedToken, appState.chainId, appState.web3);
            const rewardTokenPrices = yield (0, Portfolio_1.getTokenPrice)(listRewardTokens, appState.chainId, appState.web3);
            let [userInfos, rewardPerSeconds, pendingRewards, totalStakeAmount] = yield Promise.all([
                (0, helper_1.multiCall)(v2wrapperabi_json_1.default, farmConfig.map((_, i) => ({
                    address: farmConfig[i].v2WrapperAddress,
                    name: "userInfo",
                    params: [appState[modeFrom].address],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(v2wrapperabi_json_1.default, farmConfig.map((_, i) => ({
                    address: farmConfig[i].v2WrapperAddress,
                    name: "rewardPerSecond",
                    params: [],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(v2wrapperabi_json_1.default, farmConfig.map((_, i) => ({
                    address: farmConfig[i].v2WrapperAddress,
                    name: "pendingReward",
                    params: [appState[modeFrom].address],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, farmConfig.map((_, i) => ({
                    address: farmConfig[i].stakedToken.address,
                    name: "balanceOf",
                    params: [farmConfig[i].v2WrapperAddress],
                })), appState.web3, appState.chainId)
            ]);
            let userPancakeFarmState;
            let pancakeFarmState;
            for (let i = 0; i < farmConfig.length; i++) {
                userPancakeFarmState = {
                    stakedAmount: String(userInfos[i][0]),
                    pendingReward: String(pendingRewards[i])
                };
                pancakeFarmState = {
                    rewardPerSecond: String(rewardPerSeconds[i]),
                    totalStakeAmount: String(totalStakeAmount[i]),
                    rewardToken: Object.assign(Object.assign({}, farmConfig[i].rewardToken), { address: listRewardTokens[i] }),
                    stakedToken: Object.assign(Object.assign({}, farmConfig[i].rewardToken), { address: listStakedToken[i] })
                };
                if (appState[modeFrom].pancakeFarmState.isFetch == false) {
                    appState[modeFrom].pancakeFarmState.userPancakeFarmState.set(farmConfig[i].v2WrapperAddress.toLowerCase(), userPancakeFarmState);
                }
                if (appState.PancakeFarmState.isFetch == false) {
                    appState.PancakeFarmState.PancakeFarmState.set(farmConfig[i].v2WrapperAddress.toLowerCase(), pancakeFarmState);
                }
                if (!appState.tokenPrice.has(listStakedToken[i])) {
                    appState.tokenPrice.set(listStakedToken[i], stakedTokenPrices[i]);
                }
                if (!appState.tokenPrice.has(listRewardTokens[i])) {
                    appState.tokenPrice.set(listRewardTokens[i], rewardTokenPrices[i]);
                }
            }
            appState[modeFrom].pancakeFarmState.isFetch = true;
            appState.PancakeFarmState.isFetch = true;
        }
        return appState;
    });
}
