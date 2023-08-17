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
function simulateWrap(appState1, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.smartWalletState.tokenBalances.has((0, address_1.getAddr)("WBNB_ADDRESS"))) {
            yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, (0, address_1.getAddr)("WBNB_ADDRESS"));
        }
        if (BigInt(appState.walletState.ethBalances) < BigInt(amount)) {
            throw new Error("Not enough BNB");
        }
        let newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
        let newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get((0, address_1.getAddr)("WBNB_ADDRESS"))) + BigInt(amount);
        appState.walletState.ethBalances = String(newEthBalance);
        appState.smartWalletState.tokenBalances.set((0, address_1.getAddr)("WBNB_ADDRESS"), String(BigInt(newWBNBBalance)));
        return appState;
    });
}
exports.simulateWrap = simulateWrap;
function simulateUnwrap(appState1, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.walletState.tokenBalances.has((0, address_1.getAddr)("WBNB_ADDRESS"))) {
            yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, (0, address_1.getAddr)("WBNB_ADDRESS"));
        }
        if (BigInt(appState.walletState.tokenBalances.get((0, address_1.getAddr)("WBNB_ADDRESS"))) < BigInt(amount)) {
            throw new Error("Not enough WBNB");
        }
        let newWBNBBalance = BigInt(appState.walletState.tokenBalances.get((0, address_1.getAddr)("WBNB_ADDRESS"))) - BigInt(amount);
        let newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount);
        appState.walletState.tokenBalances.set((0, address_1.getAddr)("WBNB_ADDRESS"), String(newWBNBBalance));
        appState.walletState.ethBalances = String(newBNBBalance);
        return appState;
    });
}
exports.simulateUnwrap = simulateUnwrap;
function simulateSendToken(appState1, tokenAddress, to, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.walletState.tokenBalances.has((0, address_1.getAddr)("WBNB_ADDRESS"))) {
            yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, (0, address_1.getAddr)("WBNB_ADDRESS"));
        }
        if (!appState.smartWalletState.tokenBalances.has((0, address_1.getAddr)("WBNB_ADDRESS"))) {
            yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, (0, address_1.getAddr)("WBNB_ADDRESS"));
        }
        if (BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)) < BigInt(amount)) {
            throw new Error("Not enough Balance");
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
