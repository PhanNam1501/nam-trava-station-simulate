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
import { convertHexStringToAddress } from "../../utils/address";
import { getMode } from "../../utils/helper";
export function updateUserEthBalance(appState1, force) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (appState.walletState.ethBalances == "" || force) {
            appState.walletState.ethBalances = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState.walletState.address)));
        }
        return appState;
    });
}
export function updateSmartWalletEthBalance(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (appState.smartWalletState.ethBalances == "" || force) {
            appState.smartWalletState.ethBalances = String(yield appState.web3.getBalance(appState.smartWalletState.address));
        }
        return appState;
    });
}
export function updateUserTokenBalance(appState1, _tokenAddress, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.walletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
            const address = convertHexStringToAddress(_tokenAddress);
            const TokenContract = new Contract(address, ERC20Mock, appState.web3);
            const balance = String(yield TokenContract.balanceOf(appState.walletState.address));
            appState.walletState.tokenBalances.set(address.toLowerCase(), balance);
        }
        return appState;
    });
}
export function updateSmartWalletTokenBalance(appState1, _tokenAddress, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        if (!appState.smartWalletState.tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
            const address = convertHexStringToAddress(_tokenAddress);
            const TokenContract = new Contract(address, ERC20Mock, appState.web3);
            const balance = String(yield TokenContract.balanceOf(appState.smartWalletState.address));
            appState.smartWalletState.tokenBalances.set(address.toLowerCase(), balance);
        }
        return appState;
    });
}
export function updateTokenBalance(appState1, _from, _tokenAddress, force) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        let mode = getMode(appState, _from);
        if (_tokenAddress) {
            if (!appState[mode].tokenBalances.has(_tokenAddress.toLowerCase()) || force) {
                const address = convertHexStringToAddress(_tokenAddress);
                const TokenContract = new Contract(address, ERC20Mock, appState.web3);
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
