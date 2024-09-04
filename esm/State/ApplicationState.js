"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationState = void 0;
const WalletState_1 = require("./WalletState");
const SmartWalletState_1 = require("./SmartWalletState");
const TravaNFTState_1 = require("./trava/nft/TravaNFTState");
const TravaGovenanceState_1 = require("./trava/lending/TravaGovenanceState");
const trava_1 = require("./trava");
const pancakeSwap_1 = require("./pancakeSwap");
const cs251_1 = require("./cs251");
const pancake_farm_1 = require("./pancake-farm");
class ApplicationState {
    constructor(userAddress, smartWalletAddress, web3, chainId, simulatorUrl) {
        this.createdTime = Math.floor(new Date().getTime() / 1000);
        this.walletState = new WalletState_1.WalletState(userAddress);
        this.smartWalletState = new SmartWalletState_1.SmartWalletState(smartWalletAddress);
        this.tokenPrice = new Map();
        this.NFTSellingState = new TravaNFTState_1.NFTSellingState();
        this.NFTAuctioningState = new TravaNFTState_1.NFTAuctioningState();
        this.NFTVeTravaMarketSellingState = new TravaNFTState_1.NFTVeTravaSellingState();
        this.TravaGovernanceState = new TravaGovenanceState_1.TravaGovernanceState();
        this.ExpeditionState = new trava_1.ExpeditionState();
        this.DilutionState = new trava_1.DilutionState();
        this.web3 = web3;
        this.chainId = chainId;
        this.simulatorUrl = simulatorUrl || "";
        this.forkCompoundLPState = new trava_1.ForkedCompoundLPState();
        this.forkAaveLPState = new trava_1.ForkedAaveLPState();
        this.pancakeSwapV2Pair = new pancakeSwap_1.PancakeSwapV2Pair();
        this.cs251state = new cs251_1.cs251state();
        this.PancakeFarmState = new pancake_farm_1.PancakeFarmState();
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
