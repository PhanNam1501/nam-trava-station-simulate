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
exports.getTokenRatio = exports.roundDown = exports.updateUserLockBalance = exports.updateTravaGovernanceState = void 0;
const address_1 = require("../../../utils/address");
const Ve_json_1 = __importDefault(require("../../../abis/Ve.json"));
const Incentive_json_1 = __importDefault(require("../../../abis/Incentive.json"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const config_1 = require("../../../utils/config");
const helper_1 = require("../../../utils/helper");
const IValuator_json_1 = __importDefault(require("../../../abis/IValuator.json"));
const ethers_1 = require("ethers");
const travaGovernanceConfig_1 = require("./travaGovernanceConfig");
function updateTravaGovernanceState(appState1, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (appState.TravaGovernanceState.totalSupply == "" || force) {
                const veContract = new ethers_1.Contract((0, address_1.getAddr)("VE_TRAVA_ADDRESS", appState.chainId), Ve_json_1.default, appState.web3);
                const totalSupply = yield veContract.supplyNFT();
                const rewardTokenInfo = {
                    address: (0, address_1.getAddr)("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase(),
                    decimals: "18"
                };
                const listTokenInGovernance = travaGovernanceConfig_1.tokenLockOptions[appState.chainId];
                for (let i = 0; i < listTokenInGovernance.length; i++) {
                    let key = listTokenInGovernance[i].address.toLowerCase();
                    let tokenRatio = (yield getTokenRatio(appState, listTokenInGovernance[i].address));
                    let tokenLock = Object.assign(Object.assign({}, listTokenInGovernance[i]), { ratio: tokenRatio.toFixed(0) });
                    appState.TravaGovernanceState.tokensInGovernance.set(key, tokenLock);
                }
                appState.TravaGovernanceState.totalSupply = totalSupply;
                appState.TravaGovernanceState.rewardTokenInfo = rewardTokenInfo;
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.updateTravaGovernanceState = updateTravaGovernanceState;
function updateUserLockBalance(appState1, _userAddress, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield updateTravaGovernanceState(appState);
            }
            let mode = (0, helper_1.getMode)(appState, _userAddress);
            if (!appState[mode].veTravaListState.isFetch || force) {
                let VeAddress = (0, address_1.getAddr)("VE_TRAVA_ADDRESS", appState.chainId);
                let IncentiveAddress = (0, address_1.getAddr)("INCENTIVE_VAULT_ADDRESS", appState.chainId);
                const veContract = new ethers_1.Contract(VeAddress, Ve_json_1.default, appState.web3);
                let ids = yield veContract.getveNFTOfUser(appState[mode].address);
                let votingPowers = [];
                let lockedValues = [];
                let rewardTokens = [];
                let compoundAbleRewards = [];
                let [listVotingPower, listLockedValue, listRewardToken, listCompoundAbleReward] = yield Promise.all([
                    (0, helper_1.multiCall)(Ve_json_1.default, ids.map((id, _) => ({
                        address: VeAddress,
                        name: "balanceOfNFT",
                        params: [id],
                    })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(Ve_json_1.default, ids.map((id, _) => ({
                        address: VeAddress,
                        name: "locked",
                        params: [id],
                    })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(Ve_json_1.default, ids.map((id, _) => ({
                        address: VeAddress,
                        name: "rewardToken",
                        params: [],
                    })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(Incentive_json_1.default, ids.map((id, _) => ({
                        address: IncentiveAddress,
                        name: "claimable",
                        params: [id],
                    })), appState.web3, appState.chainId),
                ]);
                for (let i = 0; i < ids.length; i++) {
                    let votingPower = listVotingPower[i];
                    let lockedValue = listLockedValue[i];
                    let rewardToken = listRewardToken[i];
                    let compoundAbleReward = listCompoundAbleReward[i];
                    votingPowers.push(votingPower[0]);
                    lockedValues.push(lockedValue);
                    rewardTokens.push(rewardToken);
                    compoundAbleRewards.push(compoundAbleReward);
                }
                //Math
                const now = Math.floor(new Date().getTime() / 1000);
                let round_ts = roundDown(now);
                let [listVeNFT, listTotalVe, listWarmUpReward, listWarmUp_ts, listEps] = yield Promise.all([
                    (0, helper_1.multiCall)(Incentive_json_1.default, ids.map((id, _) => ({
                        address: IncentiveAddress,
                        name: "ve_for_at",
                        params: [id, round_ts],
                    })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(Ve_json_1.default, ids.map((id, _) => ({
                        address: VeAddress,
                        name: "totalSupplyAtT",
                        params: [round_ts],
                    })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(Incentive_json_1.default, ids.map((id, _) => ({
                        address: IncentiveAddress,
                        name: "claimWarmUpReward",
                        params: [id],
                    })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(Ve_json_1.default, ids.map((id, _) => ({
                        address: VeAddress,
                        name: "user_point_history__ts",
                        params: [id, 1],
                    })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(Incentive_json_1.default, ids.map((id, _) => ({
                        address: IncentiveAddress,
                        name: "emissionPerSecond",
                        params: [],
                    })), appState.web3, appState.chainId),
                ]);
                for (let i = 0; i < ids.length; i++) {
                    let now1 = (0, bignumber_js_1.default)(now);
                    let round_ts1 = (0, bignumber_js_1.default)(round_ts);
                    let veNFT1 = (0, bignumber_js_1.default)(listVeNFT[i][0]);
                    let totalVe1 = (0, bignumber_js_1.default)(listTotalVe[i][0]);
                    let warmUpReward1 = (0, bignumber_js_1.default)(listWarmUpReward[i][0]);
                    let warmUp_ts1 = (0, bignumber_js_1.default)(listWarmUp_ts[i][0]);
                    let eps1 = (0, bignumber_js_1.default)(listEps[i][0]);
                    let unclaimedReward = (0, bignumber_js_1.default)(0);
                    if (warmUp_ts1.isGreaterThan(now1)) {
                        unclaimedReward = warmUpReward1;
                    }
                    else {
                        unclaimedReward = (now1.minus(round_ts1)).multipliedBy(veNFT1).dividedBy(totalVe1).multipliedBy(eps1);
                    }
                    let balance = unclaimedReward.plus(compoundAbleRewards[i][0]);
                    // init token in governance
                    let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(lockedValues[i][3].toLowerCase());
                    let tokenLockOption1 = {
                        address: tokenLockOption.address,
                        symbol: tokenLockOption.symbol,
                        name: tokenLockOption.name,
                        decimals: tokenLockOption.decimals,
                    };
                    let tokenInVeTrava = {
                        balances: lockedValues[i][1].toString(),
                        tokenLockOption: tokenLockOption1
                    };
                    // init reward
                    let rewardTokenBalance = {
                        // address: rewardTokens[i][0].toLowerCase(),
                        compoundAbleRewards: compoundAbleRewards[i][0].toString(),
                        compoundedRewards: lockedValues[i][0].toString(),
                        balances: balance.toFixed(0),
                        // decimals: decimalTokens[i].toString(),
                    };
                    // init state lockBalance
                    let veTravaState = {
                        id: ids[i].toString(),
                        votingPower: votingPowers[i].toString(),
                        tokenInVeTrava: tokenInVeTrava,
                        unlockTime: lockedValues[i][2].toString(),
                        rewardTokenBalance: rewardTokenBalance,
                    };
                    appState[mode].veTravaListState.veTravaList.set(ids[i].toString(), veTravaState);
                }
                appState[mode].veTravaListState.isFetch = true;
            }
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
exports.updateUserLockBalance = updateUserLockBalance;
function roundDown(timestamp) {
    // thứ năm gần nhất
    const thursday = Math.floor(timestamp / config_1.WEEK_TO_SECONDS) * config_1.WEEK_TO_SECONDS;
    const dt = 5 * config_1.DAY_TO_SECONDS + 15 * config_1.HOUR_TO_SECONDS;
    if (thursday + dt < timestamp)
        return thursday + dt;
    else
        return thursday - config_1.WEEK_TO_SECONDS + dt;
}
exports.roundDown = roundDown;
function getTokenRatio(appState, _tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let tokenAddress = (0, address_1.convertHexStringToAddress)(_tokenAddress);
        let ratio = (0, bignumber_js_1.default)(0);
        if (tokenAddress.toLowerCase() == (0, address_1.getAddr)("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase()) {
            ratio = (0, bignumber_js_1.default)(1);
        }
        else {
            let isNormalToken = [(0, address_1.getAddr)("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase(), (0, address_1.getAddr)("RTRAVA_TOKEN_ADDRESS", appState.chainId).toLowerCase()].includes(tokenAddress.toLowerCase());
            const valuatorAddress = isNormalToken
                ? (0, address_1.getAddr)("TOKEN_VALUATOR_ADDRESS", appState.chainId)
                : (0, address_1.getAddr)("LP_VALUATOR_ADDRESS", appState.chainId);
            const valuatorContract = new ethers_1.Contract(valuatorAddress, IValuator_json_1.default, appState.web3);
            const ratioRaw = yield valuatorContract.ratio(tokenAddress);
            // console.log("ratioRaw", ratioRaw)
            ratio = (0, bignumber_js_1.default)(String(ratioRaw));
        }
        return ratio;
    });
}
exports.getTokenRatio = getTokenRatio;
