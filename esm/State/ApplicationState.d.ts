import { WalletState } from "./WalletState";
import { EthAddress } from "../utils/types";
import { SmartWalletState } from "./SmartWalletState";
import { NFTAuctioningState, NFTSellingState, NFTVeTravaSellingState } from "./trava/nft/TravaNFTState";
import { JsonRpcProvider } from "ethers";
import { TravaGovernanceState } from "./trava/lending/TravaGovenanceState";
import { DilutionState, ExpeditionState, ForkedAaveLPState, ForkedCompoundLPState } from "./trava";
export declare class ApplicationState {
    createdTime: number;
    walletState: WalletState;
    smartWalletState: SmartWalletState;
    NFTSellingState: NFTSellingState;
    NFTAuctioningState: NFTAuctioningState;
    NFTVeTravaMarketSellingState: NFTVeTravaSellingState;
    TravaGovernanceState: TravaGovernanceState;
    ExpeditionState: ExpeditionState;
    DilutionState: DilutionState;
    forkCompoundLPState: ForkedCompoundLPState;
    forkAaveLPState: ForkedAaveLPState;
    web3: JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
    constructor(userAddress: EthAddress, smartWalletAddress: EthAddress, web3: JsonRpcProvider, chainId: number, simulatorUrl?: string);
}
