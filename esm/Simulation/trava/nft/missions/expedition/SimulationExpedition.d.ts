import { EthAddress, uint256 } from "trava-station-sdk";
import { ApplicationState } from "../../../../../State";
export declare function simulateExpeditionDeploy(appState1: ApplicationState, _vault: EthAddress, _kinghtId: uint256, _buffWinRateTickets: Array<uint256>, _buffExpTickets: Array<uint256>, _fromKnight: EthAddress, _fromFee: EthAddress, _fromTicket: EthAddress): Promise<ApplicationState>;
export declare function simulateExpeditionAbandon(appState1: ApplicationState, _vault: EthAddress, _knightId: uint256, _to: EthAddress): Promise<ApplicationState>;
export declare function simulateExpeditionWithdraw(appState1: ApplicationState, _vault: EthAddress, _knightId: uint256, _to: EthAddress): Promise<ApplicationState>;
