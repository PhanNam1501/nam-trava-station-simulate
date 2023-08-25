var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WalletState } from "./WalletState";
import { SmartWalletState } from "./SmartWalletState";
import { NFTState } from "./NFTState";
export class ApplicationState {
    constructor(userAddress, smartWalletAddress, web3) {
        this.walletState = new WalletState(userAddress);
        this.smartWalletState = new SmartWalletState(smartWalletAddress);
        this.NFTState = new NFTState();
        this.web3 = web3;
    }
}
export function initializeState(userAddress, smartWalletAddress, web3) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const appState = new ApplicationState(userAddress, smartWalletAddress, web3);
        appState.walletState.ethBalances = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(appState.walletState.address)));
        appState.smartWalletState.ethBalances = String(yield appState.web3.getBalance(appState.smartWalletState.address));
        return appState;
    });
}
