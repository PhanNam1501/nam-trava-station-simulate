import { EthAddress, uint256 } from "trava-station-sdk";
import { ApplicationState } from "../../../../../State";

export async function simulateExpeditionDeploy(appState1: ApplicationState, _vault: EthAddress, _kinghtId: uint256, _buffWinRateTickets: Array<uint256>, _buffExpTickets: Array<uint256>, _fromKnight: EthAddress, _fromFee: EthAddress, _fromTicket: EthAddress) {
    let appState = appState1;

    try {

    } catch(err) {
        console.log(err);
    }
    return appState;
}

export async function simulateExpeditionAbandon(appState1: ApplicationState, _vault: EthAddress, _knightId: uint256, _to: EthAddress) {
    let appState = appState1;

    try {

    } catch(err) {
        console.log(err);
    }
    return appState;
}

export async function simulateExpeditionWithdraw(appState1: ApplicationState, _vault: EthAddress, _knightId: uint256, _to: EthAddress) {
    let appState = appState1;

    try {

    } catch(err) {
        console.log(err);
    }
    return appState;
}