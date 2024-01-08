var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ERC20Mock from "../../abis/ERC20Mock.json";
import { Contract } from "ethers";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { getMode } from "../../utils/helper";
export function updateUserEthBalance(appState1, force) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (appState.walletState.ethBalances == "" || force) {
            const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState.walletState.address)));
            appState.walletState.ethBalances = balance;
            appState.walletState.tokenBalances.set(getAddr("BNB_ADDRESS", appState.chainId).toLowerCase(), balance);
        }
        return appState;
    });
}
export function updateSmartWalletEthBalance(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (appState.smartWalletState.ethBalances == "" || force) {
            const balance = String(yield appState.web3.getBalance(appState.smartWalletState.address));
            appState.smartWalletState.ethBalances = balance;
            appState.smartWalletState.tokenBalances.set(getAddr("BNB_ADDRESS", appState.chainId).toLowerCase(), balance);
        }
        return appState;
    });
}
export function updateUserTokenBalance(appState1, _tokenAddress, force) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.walletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
            if (_tokenAddress.toLowerCase() == getAddr("BNB_ADDRESS", appState.chainId).toLowerCase()) {
                const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState.walletState.address)));
                appState.walletState.tokenBalances.set(_tokenAddress.toLowerCase(), balance);
                appState.walletState.ethBalances = balance;
            }
            else {
                const address = convertHexStringToAddress(_tokenAddress);
                const TokenContract = new Contract(address, ERC20Mock, appState.web3);
                const balance = String(yield TokenContract.balanceOf(appState.walletState.address));
                appState.walletState.tokenBalances.set(address.toLowerCase(), balance);
            }
        }
        return appState;
    });
}
export function updateSmartWalletTokenBalance(appState1, _tokenAddress, force) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.smartWalletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
            if (_tokenAddress.toLowerCase() == getAddr("BNB_ADDRESS", appState.chainId).toLowerCase()) {
                const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState.smartWalletState.address)));
                appState.walletState.tokenBalances.set(_tokenAddress.toLowerCase(), balance);
                appState.walletState.ethBalances = balance;
            }
            else {
                const address = convertHexStringToAddress(_tokenAddress);
                const TokenContract = new Contract(address, ERC20Mock, appState.web3);
                const balance = String(yield TokenContract.balanceOf(appState.smartWalletState.address));
                appState.smartWalletState.tokenBalances.set(address.toLowerCase(), balance);
            }
        }
        return appState;
    });
}
export function updateTokenBalance(appState1, _from, _tokenAddress, force) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        let mode = getMode(appState, _from);
        if (_tokenAddress) {
            if (!appState[mode].tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
                if (_tokenAddress.toLowerCase() == getAddr("BNB_ADDRESS", appState.chainId).toLowerCase()) {
                    const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState[mode].address)));
                    appState[mode].tokenBalances.set(_tokenAddress.toLowerCase(), balance);
                    appState[mode].ethBalances = balance;
                }
                else {
                    const address = convertHexStringToAddress(_tokenAddress);
                    const TokenContract = new Contract(address, ERC20Mock, appState.web3);
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
