import { WalletState } from "./WalletState";
import { SmartWalletState } from "./SmartWalletState";
import { NFTAuctioningState, NFTSellingState, NFTVeTravaSellingState } from "./trava/nft/TravaNFTState";
import { TravaGovernanceState } from "./trava/lending/TravaGovenanceState";
import { DilutionState, ExpeditionState } from "./trava";
export class ApplicationState {
    constructor(userAddress, smartWalletAddress, web3, chainId, simulatorUrl) {
        this.createdTime = Math.floor(new Date().getTime() / 1000);
        this.walletState = new WalletState(userAddress);
        this.smartWalletState = new SmartWalletState(smartWalletAddress);
        this.NFTSellingState = new NFTSellingState();
        this.NFTAuctioningState = new NFTAuctioningState();
        this.NFTVeTravaMarketSellingState = new NFTVeTravaSellingState();
        this.TravaGovernanceState = new TravaGovernanceState();
        this.ExpeditionState = new ExpeditionState();
        this.DilutionState = new DilutionState();
        this.web3 = web3;
        this.chainId = chainId;
        this.simulatorUrl = simulatorUrl || "";
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
