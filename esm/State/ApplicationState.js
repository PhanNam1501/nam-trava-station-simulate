"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationState = void 0;
const WalletState_1 = require("./WalletState");
const SmartWalletState_1 = require("./SmartWalletState");
const TravaNFTState_1 = require("./trava/nft/TravaNFTState");
const TravaGovenanceState_1 = require("./trava/lending/TravaGovenanceState");
class ApplicationState {
    constructor(userAddress, smartWalletAddress, web3, chainId, simulatorUrl) {
        this.createdTime = Math.floor(new Date().getTime() / 1000);
        this.walletState = new WalletState_1.WalletState(userAddress);
        this.smartWalletState = new SmartWalletState_1.SmartWalletState(smartWalletAddress);
        this.NFTSellingState = new TravaNFTState_1.NFTSellingState();
        this.NFTAuctioningState = new TravaNFTState_1.NFTAuctioningState();
        this.NFTVeTravaMarketSellingState = new TravaNFTState_1.NFTVeTravaSellingState();
        this.TravaGovernanceState = new TravaGovenanceState_1.TravaGovernanceState();
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
