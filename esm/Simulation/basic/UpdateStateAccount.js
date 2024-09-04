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
exports.updateUserEthBalance = updateUserEthBalance;
exports.updateSmartWalletEthBalance = updateSmartWalletEthBalance;
exports.updateUserTokenBalance = updateUserTokenBalance;
exports.updateSmartWalletTokenBalance = updateSmartWalletTokenBalance;
exports.updateTokenBalance = updateTokenBalance;
exports.updateAllTokensBalance = updateAllTokensBalance;
const ERC20Mock_json_1 = __importDefault(require("../../abis/ERC20Mock.json"));
const ethers_1 = require("ethers");
const address_1 = require("../../utils/address");
const helper_1 = require("../../utils/helper");
const utils_1 = require("../../utils");
const BEP20_json_1 = __importDefault(require("../../abis/BEP20.json"));
function updateUserEthBalance(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const appState = Object.assign({}, appState1);
        if (appState.walletState.ethBalances == "" || force) {
            const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState.walletState.address)));
            appState.walletState.ethBalances = balance;
            appState.walletState.tokenBalances.set((0, address_1.getAddr)("BNB_ADDRESS", appState.chainId).toLowerCase(), balance);
        }
        return appState;
    });
}
function updateSmartWalletEthBalance(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (appState.smartWalletState.ethBalances == "" || force) {
            const balance = String(yield appState.web3.getBalance(appState.smartWalletState.address));
            appState.smartWalletState.ethBalances = balance;
            appState.smartWalletState.tokenBalances.set((0, address_1.getAddr)("BNB_ADDRESS", appState.chainId).toLowerCase(), balance);
        }
        return appState;
    });
}
function updateUserTokenBalance(appState1, _tokenAddress, force) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const appState = Object.assign({}, appState1);
        if (!appState.walletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
            if (_tokenAddress.toLowerCase() == (0, address_1.getAddr)("BNB_ADDRESS", appState.chainId).toLowerCase()) {
                const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState.walletState.address)));
                appState.walletState.tokenBalances.set(_tokenAddress.toLowerCase(), balance);
                appState.walletState.ethBalances = balance;
            }
            else {
                const address = (0, address_1.convertHexStringToAddress)(_tokenAddress);
                const TokenContract = new ethers_1.Contract(address, ERC20Mock_json_1.default, appState.web3);
                const balance = String(yield TokenContract.balanceOf(appState.walletState.address));
                appState.walletState.tokenBalances.set(address.toLowerCase(), balance);
            }
        }
        return appState;
    });
}
function updateSmartWalletTokenBalance(appState1, _tokenAddress, force) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const appState = Object.assign({}, appState1);
        if (!appState.smartWalletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
            if (_tokenAddress.toLowerCase() == (0, address_1.getAddr)("BNB_ADDRESS", appState.chainId).toLowerCase()) {
                const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState.smartWalletState.address)));
                appState.walletState.tokenBalances.set(_tokenAddress.toLowerCase(), balance);
                appState.walletState.ethBalances = balance;
            }
            else {
                const address = (0, address_1.convertHexStringToAddress)(_tokenAddress);
                const TokenContract = new ethers_1.Contract(address, ERC20Mock_json_1.default, appState.web3);
                const balance = String(yield TokenContract.balanceOf(appState.smartWalletState.address));
                appState.smartWalletState.tokenBalances.set(address.toLowerCase(), balance);
            }
        }
        return appState;
    });
}
function updateTokenBalance(appState1, _from, _tokenAddress, force) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const appState = Object.assign({}, appState1);
        let mode = (0, helper_1.getMode)(appState, _from);
        if (_tokenAddress) {
            if (!appState[mode].tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
                if (_tokenAddress.toLowerCase() == (0, address_1.getAddr)("BNB_ADDRESS", appState.chainId).toLowerCase()) {
                    const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState[mode].address)));
                    appState[mode].tokenBalances.set(_tokenAddress.toLowerCase(), balance);
                    appState[mode].ethBalances = balance;
                }
                else {
                    const address = (0, address_1.convertHexStringToAddress)(_tokenAddress);
                    const TokenContract = new ethers_1.Contract(address, ERC20Mock_json_1.default, appState.web3);
                    const balance = String(yield TokenContract.balanceOf(appState[mode].address));
                    appState[mode].tokenBalances.set(address.toLowerCase(), balance);
                }
            }
        }
        else {
            if (appState[mode].ethBalances == "" || force) {
                appState[mode].ethBalances = String(yield ((_b = appState.web3) === null || _b === void 0 ? void 0 : _b.getBalance(appState[mode].address)));
            }
        }
        return appState;
    });
}
function updateAllTokensBalance(appState1_1, userAddress_1, _tokenAddresses_1) {
    return __awaiter(this, arguments, void 0, function* (appState1, userAddress, _tokenAddresses, force = false) {
        let appState = Object.assign({}, appState1);
        try {
            if ((0, helper_1.isUserAddress)(appState, userAddress)) {
                const mode = (0, helper_1.getMode)(appState, userAddress);
                const tokenAddresses = _tokenAddresses.map(e => e.toLowerCase());
                const bnbIndex = tokenAddresses.indexOf(utils_1.bnb.toLowerCase());
                let nonUpdateToken = tokenAddresses.filter(e => e.toLowerCase() != utils_1.bnb.toLowerCase());
                // console.log(bnbIndex, nonUpdateToken)
                // if (!force) {
                //     nonUpdateToken = tokenAddresses.filter(e => !appState[mode].tokenBalances.has(e) || appState[mode].tokenBalances.get(e)! == "nan");
                // }
                if (nonUpdateToken.length > 0) {
                    let [balances] = yield Promise.all([
                        (0, helper_1.multiCall)(BEP20_json_1.default, nonUpdateToken.map((_tokenAddress, _) => ({
                            address: _tokenAddress,
                            name: "balanceOf",
                            params: [appState[mode].address]
                        })), appState.web3, appState.chainId)
                    ]);
                    for (let i = 0; i < nonUpdateToken.length; i++) {
                        if ((0, helper_1.isNonUpdateTokenBalance)(appState, userAddress, nonUpdateToken[i]) || force) {
                            appState[mode].tokenBalances.set(nonUpdateToken[i], String(balances[i]));
                        }
                    }
                }
                if (bnbIndex != -1) {
                    if ((0, helper_1.isNonUpdateTokenBalance)(appState, userAddress, utils_1.bnb) || force) {
                        appState = yield updateTokenBalance(appState, userAddress, utils_1.bnb);
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
