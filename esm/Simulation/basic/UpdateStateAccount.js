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
export function updateUserEthBalance(appState) {
    return __awaiter(this, void 0, void 0, function* () {
        appState.walletState.ethBalances = String(yield appState.web3.getBalance(appState.walletState.address));
    });
}
export function updateSmartWalletEthBalance(appState) {
    return __awaiter(this, void 0, void 0, function* () {
        appState.smartWalletState.ethBalances = String(yield appState.web3.getBalance(appState.smartWalletState.address));
    });
}
export function updateUserTokenBalance(appState, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const TokenContract = new Contract(address, ERC20Mock, appState.web3);
        const balance = String(yield TokenContract.balanceOf(appState.walletState.address));
        appState.walletState.tokenBalances.set(address, balance);
    });
}
export function updateSmartWalletTokenBalance(appState, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const TokenContract = new Contract(address, ERC20Mock, appState.web3);
        const balance = String(yield TokenContract.balanceOf(appState.walletState.address));
        appState.smartWalletState.tokenBalances.set(address, balance);
    });
}
