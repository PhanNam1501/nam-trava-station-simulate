"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationState = void 0;
const WalletState_1 = require("./WalletState");
const SmartWalletState_1 = require("./SmartWalletState");
const NFTSellingState_1 = require("./NFTSellingState");
class ApplicationState {
    constructor(userAddress, smartWalletAddress, web3, chainId, simulatorUrl) {
        this.walletState = new WalletState_1.WalletState(userAddress);
        this.smartWalletState = new SmartWalletState_1.SmartWalletState(smartWalletAddress);
        this.NFTSellingState = new NFTSellingState_1.NFTSellingState();
        this.web3 = web3;
        this.chainId = chainId;
        this.simulatorUrl = simulatorUrl || "";
    }
}
exports.ApplicationState = ApplicationState;
// export async function initializeState(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider | null): Promise<ApplicationState> {
//   const appState = new ApplicationState(
//     userAddress, smartWalletAddress, web3
//   )
//   appState.walletState.ethBalances = String(await appState.web3?.getBalance(appState.walletState.address))
//   appState.smartWalletState.ethBalances = String(await appState.web3!.getBalance(appState.smartWalletState.address))
//   return appState;
// }
