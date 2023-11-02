var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { convertHexStringToAddress, getAddr } from "../../../utils/address";
import VeABI from "../../../abis/Ve.json";
import IncentiveABI from "../../../abis/Incentive.json";
import BigNumber from "bignumber.js";
import { DAY_TO_SECONDS, HOUR_TO_SECONDS, WEEK_TO_SECONDS } from "../../../utils/config";
import { multiCall } from "../../../utils/helper";
import ValuatorABI from "../../../abis/IValuator.json";
import { Contract } from "ethers";
import { tokenLockOptions } from "./travaGovernanceConfig";
import { FromAddressError } from "../../../utils/error";
export function updateTravaGovernanceState(appState1, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (appState.TravaGovernanceState.totalSupply == "" || force) {
                const veContract = new Contract(getAddr("VE_TRAVA_ADDRESS", appState.chainId), VeABI, appState.web3);
                const totalSupply = yield veContract.supplyNFT();
                const rewardTokenInfo = {
                    address: getAddr("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase(),
                    decimals: "18"
                };
                const listTokenInGovernance = tokenLockOptions[appState.chainId];
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
export function updateUserLockBalance(appState1, _userAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield updateTravaGovernanceState(appState);
            }
            let mode;
            if (_userAddress.toLowerCase() == appState.walletState.address.toLowerCase()) {
                mode = "walletState";
            }
            else if (_userAddress.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                mode = "smartWalletState";
            }
            else {
                throw new FromAddressError();
            }
            let VeAddress = getAddr("VE_TRAVA_ADDRESS", appState.chainId);
            let IncentiveAddress = getAddr("INCENTIVE_VAULT_ADDRESS", appState.chainId);
            const veContract = new Contract(VeAddress, VeABI, appState.web3);
            let ids = yield veContract.getveNFTOfUser(appState[mode].address);
            let votingPowers = [];
            let lockedValues = [];
            let rewardTokens = [];
            let compoundAbleRewards = [];
            for (let i = 0; i < ids.length; i++) {
                let id = ids[i];
                let [votingPower, lockedValue, rewardToken, compoundAbleReward,] = yield Promise.all([
                    multiCall(VeABI, [VeAddress].map((address, _) => ({
                        address: address,
                        name: "balanceOfNFT",
                        params: [id],
                    })), appState.web3, appState.chainId),
                    multiCall(VeABI, [VeAddress].map((address, _) => ({
                        address: address,
                        name: "locked",
                        params: [id],
                    })), appState.web3, appState.chainId),
                    multiCall(VeABI, [VeAddress].map((address, _) => ({
                        address: address,
                        name: "rewardToken",
                        params: [],
                    })), appState.web3, appState.chainId),
                    multiCall(IncentiveABI, [IncentiveAddress].map((address, _) => ({
                        address: address,
                        name: "claimable",
                        params: [id],
                    })), appState.web3, appState.chainId),
                ]);
                votingPowers.push(votingPower[0][0]);
                lockedValues.push(lockedValue[0]);
                rewardTokens.push(rewardToken[0]);
                compoundAbleRewards.push(compoundAbleReward[0]);
            }
            //Math
            const now = Math.floor(new Date().getTime() / 1000);
            let round_ts = roundDown(now);
            // let [veNFTs] = await Promise.all(
            //   [
            //     multiCall(
            //       IncentiveABI,
            //       ids.map((id: any, _: number) => ({
            //         address: IncentiveAddress,
            //         name: "ve_for_at",
            //         params: [id, round_ts],
            //       })),
            //       appState.web3,
            //       appState.chainId
            //     ),
            //   ]
            // )
            for (let i = 0; i < ids.length; i++) {
                let [veNFT, totalVe, warmUpReward, warmUp_ts, eps] = yield Promise.all([
                    multiCall(IncentiveABI, [IncentiveAddress].map((address, _) => ({
                        address: address,
                        name: "ve_for_at",
                        params: [ids[i], round_ts],
                    })), appState.web3, appState.chainId),
                    multiCall(VeABI, [VeAddress].map((address, _) => ({
                        address: address,
                        name: "totalSupplyAtT",
                        params: [round_ts],
                    })), appState.web3, appState.chainId),
                    multiCall(IncentiveABI, [IncentiveAddress].map((address, _) => ({
                        address: address,
                        name: "claimWarmUpReward",
                        params: [ids[i]],
                    })), appState.web3, appState.chainId),
                    multiCall(VeABI, [VeAddress].map((address, _) => ({
                        address: address,
                        name: "user_point_history__ts",
                        params: [ids[i], 1],
                    })), appState.web3, appState.chainId),
                    multiCall(IncentiveABI, [IncentiveAddress].map((address, _) => ({
                        address: address,
                        name: "emissionPerSecond",
                        params: [],
                    })), appState.web3, appState.chainId),
                ]);
                let now1 = BigNumber(now);
                let round_ts1 = BigNumber(round_ts);
                let veNFT1 = BigNumber(veNFT[0][0]);
                let totalVe1 = BigNumber(totalVe[0][0]);
                let warmUpReward1 = BigNumber(warmUpReward[0][0]);
                let warmUp_ts1 = BigNumber(warmUp_ts[0][0]);
                let eps1 = BigNumber(eps[0][0]);
                let unclaimedReward = BigNumber(0);
                if (warmUp_ts1.isGreaterThan(now1)) {
                    unclaimedReward = warmUpReward1;
                }
                else {
                    unclaimedReward = (now1.minus(round_ts1)).multipliedBy(veNFT1).dividedBy(totalVe1).multipliedBy(eps1);
                }
                let balance = unclaimedReward.plus(compoundAbleRewards[i][0]);
                // init token in governance
                let tokenLockOption = appState.TravaGovernanceState.tokensInGovernance.get(lockedValues[i][3].toLowerCase());
                let tokenInVeTrava = {
                    balances: lockedValues[i][1].toString(),
                    tokenLockOption: tokenLockOption
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
        catch (err) {
            throw err;
        }
        return appState;
    });
}
export function roundDown(timestamp) {
    // thứ năm gần nhất
    const thursday = Math.floor(timestamp / WEEK_TO_SECONDS) * WEEK_TO_SECONDS;
    const dt = 5 * DAY_TO_SECONDS + 15 * HOUR_TO_SECONDS;
    if (thursday + dt < timestamp)
        return thursday + dt;
    else
        return thursday - WEEK_TO_SECONDS + dt;
}
export function getTokenRatio(appState, _tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let tokenAddress = convertHexStringToAddress(_tokenAddress);
        let ratio = BigNumber(0);
        if (tokenAddress.toLowerCase() == getAddr("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase()) {
            ratio = BigNumber(1);
        }
        else {
            let isNormalToken = [getAddr("TRAVA_TOKEN_ADDRESS_GOVENANCE", appState.chainId).toLowerCase(), getAddr("RTRAVA_TOKEN_ADDRESS", appState.chainId).toLowerCase()].includes(tokenAddress.toLowerCase());
            const valuatorAddress = isNormalToken
                ? getAddr("TOKEN_VALUATOR_ADDRESS", appState.chainId)
                : getAddr("LP_VALUATOR_ADDRESS", appState.chainId);
            const valuatorContract = new Contract(valuatorAddress, ValuatorABI, appState.web3);
            const ratioRaw = yield valuatorContract.ratio(tokenAddress);
            console.log("ratioRaw", ratioRaw);
            ratio = BigNumber(String(ratioRaw));
        }
        return ratio;
    });
}
