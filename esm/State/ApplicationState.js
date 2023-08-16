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
