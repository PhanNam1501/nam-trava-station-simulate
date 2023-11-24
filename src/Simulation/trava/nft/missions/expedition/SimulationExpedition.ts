import { EthAddress, uint256 } from "../../../../../utils/types";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { ArmouryType, NormalKnight, NormalKnightInExpedition } from "../..";
import _ from "lodash";

export async function simulateExpeditionDeploy(
    appState1: ApplicationState,
    _expeditionAddress: EthAddress, 
    _buffWinRateTickets: Array<uint256>, 
    _buffExpTickets: Array<uint256>, 
    _fromKnight: EthAddress, 
    _knightId: number, 
    _fromFee: EthAddress, 
    _fromTicket: EthAddress
    ): Promise<ApplicationState> {
    try { 
        _expeditionAddress = _expeditionAddress.toLowerCase();
        _fromKnight = _fromKnight.toLowerCase();
        _fromFee = _fromFee.toLowerCase();
        _fromTicket = _fromTicket.toLowerCase();
        const appState = { ...appState1 };
        let currentNFT: NormalKnight | undefined = undefined;
        let mode: "walletState"|"smartWalletState";
        if (_fromKnight == appState.walletState.address.toLowerCase()) {
          currentNFT = appState.walletState.collection.v1.find((nft) => nft.id == _knightId);
          mode = "walletState";
          if (!currentNFT) {
            throw new Error("Not have this knight");
          }
          appState.walletState.collection["v1"] = appState.walletState.collection["v1"].filter(x => x.id != _knightId);
        } else if (_fromKnight == appState.smartWalletState.address.toLowerCase()) {
            mode = "smartWalletState";
            currentNFT = appState.walletState.collection.v1.find((nft) => nft.id == _knightId);
          if (!currentNFT) {
            throw new Error("Not have this knight");
          }
            appState.smartWalletState.collection["v1"] = appState.smartWalletState.collection["v1"].filter(x => x.id != _knightId);
        } else{
            throw new Error("Not the owner from knight");
        }
        if (appState.walletState.address.toLowerCase() != _fromFee && appState.smartWalletState.address.toLowerCase() != _fromFee) {
            throw new Error("Not the owner from fee");
        }
        if (appState.walletState.address.toLowerCase() != _fromTicket && appState.smartWalletState.address.toLowerCase() != _fromTicket) {
            throw new Error("Not the owner from ticket");
        }
        
        const data: NormalKnightInExpedition = {
            ...currentNFT,
            deployTimestamp: "0",
            successRate: "0",
            accruedExperience: "0",
        };
        appState[mode].knightInExpeditionState.expedition.set(_expeditionAddress, [data]);
        // Set rarity += 1
        const expeditionData = appState.ExpeditionState.expeditions.get(_expeditionAddress);
        if (expeditionData) {
            let expeditionDataRaritys = expeditionData.raritys;
            let expeditionDataRarity = expeditionDataRaritys.find(x => x.rarity == currentNFT?.rarity.toString());
            if(expeditionDataRarity) {
                expeditionDataRarity.numberOfKnight = (parseInt(expeditionDataRarity.numberOfKnight) + 1).toString();
                expeditionDataRaritys = expeditionDataRaritys.filter(x => x.rarity != currentNFT?.rarity.toString());
                expeditionDataRaritys.push(expeditionDataRarity);
                expeditionData.raritys = expeditionDataRaritys;
                appState.ExpeditionState.expeditions.set(_expeditionAddress, expeditionData);
            }
        }
        else{
            throw new Error("Not have this expedition");
        }
        return appState;
    } catch(err) {
        throw err;
    }
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