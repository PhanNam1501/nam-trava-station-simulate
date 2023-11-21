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
exports.updateTokenBalance = exports.updateSmartWalletTokenBalance = exports.updateUserTokenBalance = exports.updateSmartWalletEthBalance = exports.updateUserEthBalance = void 0;
const ERC20Mock_json_1 = __importDefault(require("../../abis/ERC20Mock.json"));
const ethers_1 = require("ethers");
const address_1 = require("../../utils/address");
const helper_1 = require("../../utils/helper");
function updateUserEthBalance(appState1, force) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (appState.walletState.ethBalances == "" || force) {
            appState.walletState.ethBalances = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState.walletState.address)));
        }
        return appState;
    });
}
exports.updateUserEthBalance = updateUserEthBalance;
function updateSmartWalletEthBalance(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (appState.smartWalletState.ethBalances == "" || force) {
            appState.smartWalletState.ethBalances = String(yield appState.web3.getBalance(appState.smartWalletState.address));
        }
        return appState;
    });
}
exports.updateSmartWalletEthBalance = updateSmartWalletEthBalance;
function updateUserTokenBalance(appState1, _tokenAddress, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.walletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
            const address = (0, address_1.convertHexStringToAddress)(_tokenAddress);
            const TokenContract = new ethers_1.Contract(address, ERC20Mock_json_1.default, appState.web3);
            const balance = String(yield TokenContract.balanceOf(appState.walletState.address));
            appState.walletState.tokenBalances.set(address.toLowerCase(), balance);
        }
        return appState;
    });
}
exports.updateUserTokenBalance = updateUserTokenBalance;
function updateSmartWalletTokenBalance(appState1, _tokenAddress, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.smartWalletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
            const address = (0, address_1.convertHexStringToAddress)(_tokenAddress);
            const TokenContract = new ethers_1.Contract(address, ERC20Mock_json_1.default, appState.web3);
            const balance = String(yield TokenContract.balanceOf(appState.smartWalletState.address));
            appState.smartWalletState.tokenBalances.set(address.toLowerCase(), balance);
        }
        return appState;
    });
}
exports.updateSmartWalletTokenBalance = updateSmartWalletTokenBalance;
function updateTokenBalance(appState1, _from, _tokenAddress, force) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        let mode = (0, helper_1.getMode)(appState, _from);
        if (_tokenAddress) {
            if (!appState[mode].tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
                const address = (0, address_1.convertHexStringToAddress)(_tokenAddress);
                const TokenContract = new ethers_1.Contract(address, ERC20Mock_json_1.default, appState.web3);
                const balance = String(yield TokenContract.balanceOf(appState[mode].address));
                appState[mode].tokenBalances.set(address.toLowerCase(), balance);
            }
        }
        else {
            if (appState[mode].ethBalances == "" || force) {
                appState[mode].ethBalances = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState[mode].address)));
            }
        }
        return appState;
    });
}
exports.updateTokenBalance = updateTokenBalance;
