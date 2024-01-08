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
export function SimulationJoinLiquidity(_appState, _liquidity, _from, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState);
        try {
            let liquidity = _liquidity.toLowerCase();
            let from = _from.toLowerCase();
            let amount = _amount;
            if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
                appState = yield updateLiquidityCampainState(appState);
            }
            let liquidityCampain = appState.smartWalletState.liquidityCampainState.liquidityCampainList.get(liquidity);
            if (liquidityCampain == undefined) {
                throw new Error("Liquidity not found");
            }
            const modeFrom = getMode(appState, from);
            if (modeFrom != "walletState" && modeFrom != "smartWalletState") {
                throw new Error("Address not found");
            }
            if (appState[modeFrom].tokenBalances.has(liquidityCampain.stakedToken.stakedTokenAddress) == false) {
                appState = yield updateTokenBalance(appState, from, liquidityCampain.underlyingToken.underlyingAddress);
            }
            let oldBalance = BigNumber(0);
            if (appState[modeFrom].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase())) {
                oldBalance = BigNumber(appState[modeFrom].tokenBalances.get(liquidityCampain.underlyingToken.underlyingAddress.toLowerCase()));
            }
            let newTotalSupply = BigNumber(liquidityCampain.deposited).plus(amount);
            let newLiquidityCampain = liquidityCampain;
            newLiquidityCampain.deposited = newTotalSupply.toFixed();
            let newTVL = (BigNumber(liquidityCampain.TVL).div(liquidityCampain.underlyingToken.price).multipliedBy(liquidityCampain.underlyingToken.reserveDecimals).plus(amount)).multipliedBy(liquidityCampain.underlyingToken.price).div(liquidityCampain.underlyingToken.reserveDecimals);
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
            let to = _to.toLowerCase();
            let amount = _amount;
            if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
                appState = yield updateLiquidityCampainState(appState);
            }
            if (!appState.smartWalletState.liquidityCampainState.liquidityCampainList.has(liquidity)) {
                throw new Error("Liquidity not found");
            }
            /////
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationClaimRewardLiquidity(_appState, _liquidity, _to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState);
        try {
            let liquidity = _liquidity.toLowerCase();
            let to = _to.toLowerCase();
            let amount = _amount;
            if (appState.smartWalletState.liquidityCampainState.isFetch == false) {
                appState = yield updateLiquidityCampainState(appState);
            }
            if (!appState.smartWalletState.liquidityCampainState.liquidityCampainList.has(liquidity)) {
                throw new Error("Liquidity not found");
            }
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
