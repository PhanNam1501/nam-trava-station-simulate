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
exports.simulateSendToken = exports.simulateUnwrap = exports.simulateWrap = void 0;
const UpdateStateAccount_1 = require("./UpdateStateAccount");
const address_1 = require("../../utils/address");
const config_1 = require("../../utils/config");
function simulateWrap(appState1, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = _amount;
        const appState = Object.assign({}, appState1);
        const bnb_address = (0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId).toLowerCase();
        if (!appState.smartWalletState.tokenBalances.has(bnb_address)) {
            yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, bnb_address);
        }
        // if (BigInt(appState.walletState.ethBalances) < BigInt(amount)) {
        //     throw new Error("Not enough BNB")
        // }
        if (amount.toString() == config_1.MAX_UINT256 || BigInt(amount) == BigInt(config_1.MAX_UINT256)) {
            amount = appState.walletState.ethBalances;
        }
        let newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
        let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get(bnb_address)) + BigInt(amount);
        appState.walletState.ethBalances = String(newEthBalance);
        appState.smartWalletState.tokenBalances.set(bnb_address.toLowerCase(), String(BigInt(newWBNBBalance)));
        return appState;
    });
}
exports.simulateWrap = simulateWrap;
function simulateUnwrap(appState1, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = _amount;
        const appState = Object.assign({}, appState1);
        const bnb_address = (0, address_1.getAddr)("WBNB_ADDRESS", appState.chainId).toLowerCase();
        if (!appState.walletState.tokenBalances.has(bnb_address)) {
            yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, bnb_address);
        }
        // if (BigInt(appState.walletState.tokenBalances.get(bnb_address)!) < BigInt(amount)) {
        //     throw new Error("Not enough WBNB");
        // }
        if (amount.toString() == config_1.MAX_UINT256 || BigInt(amount) == BigInt(config_1.MAX_UINT256)) {
            amount = appState.walletState.tokenBalances.get(bnb_address);
        }
        let newWBNBBalance = BigInt(appState.walletState.tokenBalances.get(bnb_address)) - BigInt(amount);
        let newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount);
        appState.smartWalletState.tokenBalances.set(bnb_address, String(newWBNBBalance));
        appState.walletState.ethBalances = String(newBNBBalance);
        return appState;
    });
}
exports.simulateUnwrap = simulateUnwrap;
function simulateSendToken(appState1, _tokenAddress, to, _amount) {
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
        // if (BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)!) < BigInt(amount)) {
        //     throw new Error("Not enough Balance");
        // }
        if (amount.toString() == config_1.MAX_UINT256 || BigInt(amount) == BigInt(config_1.MAX_UINT256)) {
            amount = appState.smartWalletState.tokenBalances.get(tokenAddress);
        }
        let newTokenBalance = BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)) - BigInt(amount);
        appState.smartWalletState.tokenBalances.set(tokenAddress, String(newTokenBalance));
        if (to == appState.walletState.address) {
            let newUserTokenBalance = BigInt(appState.walletState.tokenBalances.get(tokenAddress)) + BigInt(amount);
            appState.walletState.tokenBalances.set(tokenAddress, String(newUserTokenBalance));
        }
        return appState;
    });
}
exports.simulateSendToken = simulateSendToken;
