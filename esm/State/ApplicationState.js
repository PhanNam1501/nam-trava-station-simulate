import { WalletState } from "./WalletState";
import { SmartWalletState } from "./SmartWalletState";
import { NFTState } from "./NFTState";
export class ApplicationState {
    constructor(userAddress, smartWalletAddress, web3) {
        this.walletState = new WalletState(userAddress);
        this.smartWalletState = new SmartWalletState(smartWalletAddress);
        this.NFTState = new NFTState();
        this.web3 = web3;
        this.chainId = Number(web3 === null || web3 === void 0 ? void 0 : web3._network.chainId);
    }
}
// export async function initializeState(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider | null): Promise<ApplicationState> {
//   const appState = new ApplicationState(
//     userAddress, smartWalletAddress, web3
//   )
//   appState.walletState.ethBalances = String(await appState.web3?.getBalance(appState.walletState.address))
//   appState.smartWalletState.ethBalances = String(await appState.web3!.getBalance(appState.smartWalletState.address))
//   return appState;
// }
