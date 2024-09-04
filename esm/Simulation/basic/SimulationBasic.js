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
exports.simulateWrap = simulateWrap;
exports.simulateUnwrap = simulateUnwrap;
exports.simulateSendToken = simulateSendToken;
const UpdateStateAccount_1 = require("./UpdateStateAccount");
const address_1 = require("../../utils/address");
const config_1 = require("../../utils/config");
function simulateWrap(appState1, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = _amount;
        const appState = Object.assign({}, appState1);
        const wbnb_address = (0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId).toLowerCase();
        if (!appState.smartWalletState.tokenBalances.has(wbnb_address)) {
            yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, wbnb_address);
        }
        // console.log("amount.toString() == MAX_UINT256", amount.toString(), MAX_UINT256)
        if (amount.toString() == config_1.MAX_UINT256 || BigInt(amount) == BigInt(config_1.MAX_UINT256)) {
            // console.log("????")
            amount = appState.walletState.ethBalances;
        }
        // console.log("amount", amount)
        let newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
        let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(wbnb_address)) + BigInt(amount);
        appState.walletState.ethBalances = String(newEthBalance);
        appState.smartWalletState.tokenBalances.set(wbnb_address, String(BigInt(newWBNBBalance)));
        appState.smartWalletState.tokenBalances.set((0, address_1.getAddr)("BNB_ADDRESS").toLowerCase(), String(BigInt(newWBNBBalance)));
        return appState;
    });
}
function simulateUnwrap(appState1, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = _amount;
        const appState = Object.assign({}, appState1);
        const wbnb_address = (0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId).toLowerCase();
        if (!appState.walletState.tokenBalances.has(wbnb_address)) {
            yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, wbnb_address);
        }
        if (amount.toString() == config_1.MAX_UINT256 || BigInt(amount) == BigInt(config_1.MAX_UINT256)) {
            amount = appState.smartWalletState.tokenBalances.get(wbnb_address);
        }
        let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(wbnb_address)) - BigInt(amount);
        let newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount);
        appState.smartWalletState.tokenBalances.set(wbnb_address, String(newWBNBBalance));
        appState.smartWalletState.tokenBalances.set((0, address_1.getAddr)("BNB_ADDRESS").toLowerCase(), String(newWBNBBalance));
        appState.walletState.ethBalances = String(newBNBBalance);
        return appState;
    });
}
function simulateSendToken(appState1, _tokenAddress, from, to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = _amount;
        const appState = Object.assign({}, appState1);
        const bnb_address = (0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId).toLowerCase();
        const tokenAddress = _tokenAddress.toLowerCase();
        if (!appState.walletState.tokenBalances.has(bnb_address)) {
            yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, bnb_address);
        }
        if (!appState.smartWalletState.tokenBalances.has(bnb_address)) {
            yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, bnb_address);
        }
        const oldWalletBalance = appState.walletState.tokenBalances.get(tokenAddress);
        const oldSmartWalletBalance = appState.smartWalletState.tokenBalances.get(tokenAddress);
        if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
            if (amount.toString() == config_1.MAX_UINT256 || BigInt(amount) == BigInt(config_1.MAX_UINT256)) {
                amount = oldWalletBalance;
            }
            appState.walletState.tokenBalances.set(tokenAddress, String(BigInt(oldWalletBalance) - BigInt(amount)));
            if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                appState.smartWalletState.tokenBalances.set(tokenAddress, String(BigInt(oldSmartWalletBalance) + BigInt(amount)));
            }
        }
        else if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            if (amount.toString() == config_1.MAX_UINT256 || BigInt(amount) == BigInt(config_1.MAX_UINT256)) {
                amount = oldSmartWalletBalance;
            }
            appState.smartWalletState.tokenBalances.set(tokenAddress, String(BigInt(oldSmartWalletBalance) - BigInt(amount)));
            if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                appState.walletState.tokenBalances.set(tokenAddress, String(BigInt(oldWalletBalance) + BigInt(amount)));
            }
        }
        else {
            new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
        }
        return appState;
    });
}
