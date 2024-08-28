var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import BigNumber from "bignumber.js";
import { updateLiquidityCampainState } from "./UpdateStateAccount";
import { updateTokenBalance } from "../basic";
import { getMode } from "../../utils/helper";
import { MAX_UINT256 } from "../../utils";
export function SimulationJoinLiquidity(_appState, _liquidity, _from, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState);
        try {
            let liquidity = _liquidity.toLowerCase();
            let from = _from;
            let amount = BigNumber(_amount);
            if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
                appState = yield updateLiquidityCampainState(appState);
            }
            let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
            if (liquidityCampain == undefined) {
                throw new Error("Liquidity not found");
            }
            const modeFrom = getMode(appState, from);
            if (appState[modeFrom].tokenBalances.has(liquidityCampain.underlyingToken.underlyingAddress) == false) {
                appState = yield updateTokenBalance(appState, from, liquidityCampain.underlyingToken.underlyingAddress);
            }
            let oldBalance = BigNumber(appState[modeFrom].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase()));
            let maxAmountDeposit = BigNumber(liquidityCampain.maxTotalDeposit).minus(liquidityCampain.deposited);
            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                if (oldBalance.isGreaterThan(maxAmountDeposit)) {
                    amount = BigNumber(maxAmountDeposit);
                }
                else {
                    amount = BigNumber(oldBalance);
                }
            }
            let newTotalSupply = BigNumber(liquidityCampain.deposited).plus(amount);
            let newLiquidityCampain = liquidityCampain;
            newLiquidityCampain.deposited = newTotalSupply.toFixed();
            let newTVL = (BigNumber(liquidityCampain.TVL).div(liquidityCampain.underlyingToken.price).multipliedBy(BigNumber(10).pow(liquidityCampain.underlyingToken.reserveDecimals).plus(amount)).multipliedBy(liquidityCampain.underlyingToken.price).div(BigNumber(10).pow(liquidityCampain.underlyingToken.reserveDecimals)));
            newLiquidityCampain.TVL = newTVL.toFixed();
            appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(liquidity, newLiquidityCampain);
            appState[modeFrom].tokenBalances.set(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase(), oldBalance.minus(amount).toFixed());
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationWithdrawLiquidity(_appState, _liquidity, _to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState);
        try {
            let liquidity = _liquidity.toLowerCase();
            let to = _to;
            let amount = BigNumber(_amount);
            if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
                appState = yield updateLiquidityCampainState(appState);
            }
            let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
            if (liquidityCampain == undefined) {
                throw new Error("Liquidity not found");
            }
            let lockTime = Number(liquidityCampain.lockTime);
            let now = new Date().getTime();
            if (now < lockTime) {
                throw new Error("Liquidity Campain can not withdraw now");
            }
            const modeTo = getMode(appState, to);
            if (appState[modeTo].tokenBalances.has(liquidityCampain.underlyingToken.underlyingAddress) == false) {
                appState = yield updateTokenBalance(appState, to, liquidityCampain.underlyingToken.underlyingAddress);
            }
            let oldBalance = BigNumber(appState[modeTo].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase()));
            // console.log(oldBalance.toFixed());
            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = BigNumber(liquidityCampain.deposited);
            }
            let newTotalSupply = BigNumber(liquidityCampain.deposited).minus(amount);
            let newLiquidityCampain = liquidityCampain;
            newLiquidityCampain.deposited = newTotalSupply.toFixed();
            let newTVL = (BigNumber(liquidityCampain.TVL).div(liquidityCampain.underlyingToken.price).multipliedBy(BigNumber(10).pow(liquidityCampain.underlyingToken.reserveDecimals)).minus(amount)).multipliedBy(liquidityCampain.underlyingToken.price).div(BigNumber(10).pow(liquidityCampain.underlyingToken.reserveDecimals));
            newLiquidityCampain.TVL = newTVL.toFixed();
            appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(liquidity, newLiquidityCampain);
            appState[modeTo].tokenBalances.set(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase(), oldBalance.plus(amount).toFixed());
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationClaimRewardLiquidity(_appState, _liquidity, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState);
        try {
            let liquidity = _liquidity.toLowerCase();
            let to = _to;
            if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
                appState = yield updateLiquidityCampainState(appState);
            }
            let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
            if (liquidityCampain == undefined) {
                throw new Error("Liquidity not found");
            }
            const modeTo = getMode(appState, to);
            if (appState[modeTo].tokenBalances.has(liquidityCampain.rewardToken.address) == false) {
                appState = yield updateTokenBalance(appState, to, liquidityCampain.rewardToken.address);
            }
            let oldBalance = BigNumber(appState[modeTo].tokenBalances.get(liquidityCampain.rewardToken.address.toLowerCase()));
            let amount = BigNumber(liquidityCampain.claimableReward);
            let newClaimableReward = BigNumber(liquidityCampain.claimableReward).minus(amount);
            let newLiquidityCampain = liquidityCampain;
            newLiquidityCampain.claimableReward = newClaimableReward.toFixed();
            appState.smartWalletState.liquidityCampainState.liquidityCampainList.set(liquidity, newLiquidityCampain);
            appState[modeTo].tokenBalances.set(liquidityCampain.rewardToken.address.toLowerCase(), oldBalance.plus(amount).toFixed());
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
