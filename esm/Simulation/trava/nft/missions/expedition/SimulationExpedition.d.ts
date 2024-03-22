import { EthAddress, uint256 } from "../../../../../utils/types";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { NormalKnight, NormalKnightInExpedition } from "../..";
export declare function simulateExpeditionDeploy(appState1: ApplicationState, _expeditionAddress: EthAddress, _knightId: uint256, _buffWinRateTickets: Array<uint256>, _buffExpTickets: Array<uint256>, _fromKnight: EthAddress, _fromExpeditionFee: EthAddress, _fromTicket: EthAddress): Promise<ApplicationState>;
export declare function simulateExpeditionAbandon(appState1: ApplicationState, _vault: EthAddress, _knightId: uint256, _to: EthAddress): Promise<{
    createdTime: number;
    walletState: import("../../../../../State").WalletState;
    smartWalletState: import("../../../../../State").SmartWalletState;
    NFTSellingState: import("../../../../../State").NFTSellingState;
    NFTAuctioningState: import("../../../../../State").NFTAuctioningState;
    NFTVeTravaMarketSellingState: import("../../../../../State").NFTVeTravaSellingState;
    TravaGovernanceState: import("../../../../../State").TravaGovernanceState;
    ExpeditionState: import("../../../../../State").ExpeditionState;
    DilutionState: import("../../../../../State").DilutionState;
    forkCompoundLPState: import("../../../../../State").ForkedCompoundLPState;
    forkAaveLPState: import("../../../../../State").ForkedAaveLPState;
    web3: import("ethers").JsonRpcProvider;
    chainId: number;
    simulatorUrl: string;
}>;
export declare function simulateExpeditionWithdraw(appState1: ApplicationState, _vault: EthAddress, _knightId: uint256, _to: EthAddress): Promise<ApplicationState>;
export declare function isOnDuty(appState1: ApplicationState, expeditionAddress: EthAddress, _knightId: uint256): boolean;
export declare function getExpeditionData(appState1: ApplicationState, expeditionAddress: EthAddress, _knightId: uint256): {
    expeditionData: import("../../../../../State").Expedition;
    expeditionInSmartwalletData: NormalKnightInExpedition[];
    currentNFT: NormalKnightInExpedition;
};
export declare function getNormalKnightInExpedition(currentNFT: NormalKnightInExpedition, isWithdraw: boolean): NormalKnight;
