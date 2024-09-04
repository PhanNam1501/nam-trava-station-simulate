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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeRate = getExchangeRate;
exports.addLiquidity = addLiquidity;
exports.removeLiquidity = removeLiquidity;
exports.swapAssets = swapAssets;
const bignumber_js_1 = require("bignumber.js");
const config_1 = require("../../utils/config");
const UpdateStateAccount_1 = require("../basic/UpdateStateAccount");
const update_1 = require("./update");
function getExchangeRate(appState, exchange) {
    return __awaiter(this, void 0, void 0, function* () {
        appState = yield (0, update_1.updateCS251State)(appState, exchange, false);
        let newState = Object.assign({}, appState);
        let exchangeState = newState.cs251state.cs251state.get(exchange);
        const oldETHReserve = exchangeState.eth_reserve;
        const oldTokenReserves = exchangeState.token_reserve;
        const exchangeRate = (0, bignumber_js_1.BigNumber)(oldTokenReserves).multipliedBy(Math.pow(10, 18)).multipliedBy(Math.pow(10, 15)).dividedBy(oldETHReserve);
        return exchangeRate;
    });
}
// Add Liquidity
function addLiquidity(appState, exchange, tokenAddr, // Declare and provide a value for tokenAddr
from, amountETH) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            appState = yield (0, update_1.updateCS251State)(appState, exchange, false);
            // Create a copy of the appState to avoid mutating the original state
            let newState = Object.assign({}, appState);
            let exchangeState = newState.cs251state.cs251state.get(exchange);
            const oldETHReserve = exchangeState.eth_reserve;
            const newETHReserve = (0, bignumber_js_1.BigNumber)(oldETHReserve).plus(amountETH);
            const oldtotalshare = exchangeState.total_shares;
            const newtotalshare = (0, bignumber_js_1.BigNumber)(oldtotalshare).plus((0, bignumber_js_1.BigNumber)(amountETH).multipliedBy(oldtotalshare).dividedBy(newETHReserve));
            const oldLps = exchangeState.lps;
            const newLps = (0, bignumber_js_1.BigNumber)(oldLps).plus((0, bignumber_js_1.BigNumber)(amountETH).multipliedBy(oldtotalshare).dividedBy(newETHReserve));
            // Calculate the amount of tokens to add to the liquidity pool based on the reserves
            const tokenAmount = (0, bignumber_js_1.BigNumber)(amountETH).multipliedBy(exchangeState === null || exchangeState === void 0 ? void 0 : exchangeState.token_reserve).dividedBy(exchangeState.eth_reserve);
            const oldTokenReserves = exchangeState.token_reserve;
            const newTokenReserve = (0, bignumber_js_1.BigNumber)(oldTokenReserves).plus(tokenAmount);
            const newExchangeState = {
                eth_reserve: newETHReserve.toFixed(),
                token_reserve: newTokenReserve.toFixed(),
                total_shares: newtotalshare.toFixed(),
                lps: newLps.toFixed(),
            };
            newState.cs251state.cs251state.set(exchange, newExchangeState);
            if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                newState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(newState, tokenAddr);
                newState = yield (0, UpdateStateAccount_1.updateUserEthBalance)(newState);
                let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase());
                let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).minus(tokenAmount);
                appState.walletState.tokenBalances.set(tokenAddr.toLowerCase(), newTokenBalance.toFixed());
                let oldETHBalances = appState.walletState.ethBalances;
                let newETHBalance = (0, bignumber_js_1.BigNumber)(oldETHBalances).minus(amountETH);
                appState.walletState.ethBalances = newETHBalance.toFixed();
            }
            else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                newState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(newState, tokenAddr);
                newState = yield (0, UpdateStateAccount_1.updateSmartWalletEthBalance)(newState);
                let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase());
                let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).minus(tokenAmount);
                appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase(), newTokenBalance.toFixed());
                let oldETHBalances = appState.smartWalletState.ethBalances;
                let newETHBalance = (0, bignumber_js_1.BigNumber)(oldETHBalances).minus(amountETH);
                appState.smartWalletState.ethBalances = newETHBalance.toFixed();
            }
            else {
                new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
            }
            return newState;
        }
        catch (err) {
            throw err;
        }
    });
}
// Remove Liquidity     
function removeLiquidity(appState, exchange, tokenAddr, // Declare and provide a value for tokenAddr
// maxSlippage: uint256,
// minSlippage: uint256,
amountETH, to) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            appState = yield (0, update_1.updateCS251State)(appState, exchange, false);
            // Create a copy of the appState to avoid mutating the original state
            let newState = Object.assign({}, appState);
            let exchangeState = newState.cs251state.cs251state.get(exchange);
            //check max amount to remove
            const share_withdraw = (0, bignumber_js_1.BigNumber)(amountETH).multipliedBy(exchangeState.total_shares).dividedBy(exchangeState.eth_reserve);
            const tokenwithdraw = (0, bignumber_js_1.BigNumber)(exchangeState.token_reserve).multipliedBy(share_withdraw).dividedBy(exchangeState.total_shares);
            let ethwithdraw = (0, bignumber_js_1.BigNumber)(exchangeState.eth_reserve).multipliedBy(share_withdraw).dividedBy(exchangeState.total_shares);
            const oldTokenReserves = exchangeState.token_reserve;
            const newTokenReserve = (0, bignumber_js_1.BigNumber)(oldTokenReserves).minus(tokenwithdraw);
            const oldETHReserve = exchangeState.eth_reserve;
            const newETHReserve = (0, bignumber_js_1.BigNumber)(oldETHReserve).minus(ethwithdraw);
            const oldtotalshare = exchangeState.total_shares;
            const newtotalshare = (0, bignumber_js_1.BigNumber)(oldtotalshare).minus(share_withdraw);
            const oldLps = exchangeState.lps;
            const newLps = (0, bignumber_js_1.BigNumber)(oldLps).minus(share_withdraw);
            const newExchangeState = {
                eth_reserve: newETHReserve.toFixed(),
                token_reserve: newTokenReserve.toFixed(),
                total_shares: newtotalshare.toFixed(),
                lps: newLps.toFixed(),
            };
            newState.cs251state.cs251state.set(exchange, newExchangeState);
            if (ethwithdraw.toFixed(0) == config_1.MAX_UINT256 || ethwithdraw.isEqualTo(config_1.MAX_UINT256)) {
                ethwithdraw = (0, bignumber_js_1.BigNumber)(exchangeState.lps).multipliedBy(exchangeState.eth_reserve).dividedBy(exchangeState.total_shares);
            }
            if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                newState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(newState, tokenAddr);
                newState = yield (0, UpdateStateAccount_1.updateUserEthBalance)(newState);
                let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase());
                let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).plus(tokenwithdraw);
                appState.walletState.tokenBalances.set(tokenAddr.toLowerCase(), newTokenBalance.toFixed());
                let oldETHBalances = appState.walletState.ethBalances;
                let newETHBalance = (0, bignumber_js_1.BigNumber)(oldETHBalances).plus(ethwithdraw);
                appState.walletState.ethBalances = newETHBalance.toFixed();
            }
            else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                newState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(newState, tokenAddr);
                newState = yield (0, UpdateStateAccount_1.updateSmartWalletEthBalance)(newState);
                let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase());
                let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).plus(tokenwithdraw);
                appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase(), newTokenBalance.toFixed());
                let oldETHBalances = appState.smartWalletState.ethBalances;
                let newETHBalance = (0, bignumber_js_1.BigNumber)(oldETHBalances).plus(ethwithdraw);
                appState.smartWalletState.ethBalances = newETHBalance.toFixed();
            }
            else {
                new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
            }
            return newState;
        }
        catch (err) {
            throw err;
        }
    });
}
function swapAssets(appState, exchange, amountIn, from, tokenAddr, isSwapForETH // true for Token for ETH, false for ETH for Token
) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Update the state with the current exchange details
            appState = yield (0, update_1.updateCS251State)(appState, exchange, false);
            let newState = Object.assign({}, appState);
            let exchangeState = newState.cs251state.cs251state.get(exchange);
            let newTokenBalance, newETHBalance, amountToken, amountETH;
            if (isSwapForETH) {
                // Handling Token for ETH swap
                const tokenBalanceBefore = exchangeState.token_reserve;
                amountETH = (0, bignumber_js_1.BigNumber)(amountIn).multipliedBy(exchangeState.eth_reserve).multipliedBy(0.97).dividedBy((0, bignumber_js_1.BigNumber)(tokenBalanceBefore).plus(amountIn));
                newTokenBalance = (0, bignumber_js_1.BigNumber)(tokenBalanceBefore).minus(amountIn);
                newETHBalance = (0, bignumber_js_1.BigNumber)(exchangeState.eth_reserve).plus(amountETH);
                if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                    newState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(newState, tokenAddr);
                    newState = yield (0, UpdateStateAccount_1.updateUserEthBalance)(newState);
                    let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase());
                    let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).minus(amountIn);
                    appState.walletState.tokenBalances.set(tokenAddr.toLowerCase(), newTokenBalance.toFixed());
                    let oldETHBalances = appState.walletState.ethBalances;
                    let newETHBalance = (0, bignumber_js_1.BigNumber)(oldETHBalances).plus(amountETH);
                    appState.walletState.ethBalances = newETHBalance.toFixed();
                }
                else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                    newState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(newState, tokenAddr);
                    newState = yield (0, UpdateStateAccount_1.updateSmartWalletEthBalance)(newState);
                    let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase());
                    let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).minus(amountIn);
                    appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase(), newTokenBalance.toFixed());
                    let oldETHBalances = appState.smartWalletState.ethBalances;
                    let newETHBalance = (0, bignumber_js_1.BigNumber)(oldETHBalances).plus(amountETH);
                    appState.smartWalletState.ethBalances = newETHBalance.toFixed();
                }
                else {
                    new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
                }
            }
            else {
                // Handling ETH for Token swap
                const ethBalanceBefore = exchangeState.eth_reserve;
                amountToken = (0, bignumber_js_1.BigNumber)(amountIn).multipliedBy(exchangeState.token_reserve).multipliedBy(0.97).dividedBy((0, bignumber_js_1.BigNumber)(ethBalanceBefore).plus(amountIn));
                newETHBalance = (0, bignumber_js_1.BigNumber)(ethBalanceBefore).minus(amountIn);
                newTokenBalance = (0, bignumber_js_1.BigNumber)(exchangeState.token_reserve).plus(amountToken);
                if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                    newState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(newState, tokenAddr);
                    newState = yield (0, UpdateStateAccount_1.updateUserEthBalance)(newState);
                    let oldTokenBalances = appState.walletState.tokenBalances.get(tokenAddr.toLowerCase());
                    let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).plus(amountToken);
                    appState.walletState.tokenBalances.set(tokenAddr.toLowerCase(), newTokenBalance.toFixed());
                    let oldETHBalances = appState.walletState.ethBalances;
                    let newETHBalance = (0, bignumber_js_1.BigNumber)(oldETHBalances).minus(amountIn);
                    appState.walletState.ethBalances = newETHBalance.toFixed();
                }
                else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                    newState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(newState, tokenAddr);
                    newState = yield (0, UpdateStateAccount_1.updateSmartWalletEthBalance)(newState);
                    let oldTokenBalances = appState.smartWalletState.tokenBalances.get(tokenAddr.toLowerCase());
                    let newTokenBalance = (0, bignumber_js_1.BigNumber)(oldTokenBalances).plus(amountToken);
                    appState.smartWalletState.tokenBalances.set(tokenAddr.toLowerCase(), newTokenBalance.toFixed());
                    let oldETHBalances = appState.smartWalletState.ethBalances;
                    let newETHBalance = (0, bignumber_js_1.BigNumber)(oldETHBalances).minus(amountIn);
                    appState.smartWalletState.ethBalances = newETHBalance.toFixed();
                }
                else {
                    new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
                }
            }
            const newExchangeState = {
                eth_reserve: newETHBalance.toFixed(),
                token_reserve: newTokenBalance.toFixed(),
                total_shares: (0, bignumber_js_1.BigNumber)(exchangeState.total_shares).toFixed(),
                lps: (0, bignumber_js_1.BigNumber)(exchangeState.lps).toFixed(),
            };
            newState.cs251state.cs251state.set(exchange, newExchangeState);
            return newState;
        }
        catch (err) {
            throw err;
        }
    });
}
