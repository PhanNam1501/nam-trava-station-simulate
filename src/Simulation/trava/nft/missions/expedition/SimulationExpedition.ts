import { EthAddress, uint256 } from "../../../../../utils/types";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { ArmouryType, NormalKnight, NormalKnightInExpedition } from "../..";
import _ from "lodash";
import { getMode, multiCall } from "../../../../../utils/helper";
import ExpeditionABI from "../../../../../abis/NFTExpeditionABI.json";
import { Ticket } from "../../../../../State";
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
        let countTickets = 0;
        for (let i = 0; i < _buffWinRateTickets.length; i++) {
            countTickets += parseInt(_buffWinRateTickets[i]);
        }
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

        const [successRateFromContract, ExpFromContract]
        = await Promise.all([
          multiCall(
            ExpeditionABI,
            [_expeditionAddress].map((address: string) => ({
              address: address,
              name: "getSuccessRate",
              params: [currentNFT?.id.toString()],
            })),
            appState.web3,
            appState.chainId
          ),
          multiCall(
            ExpeditionABI,
            [_expeditionAddress].map((address: string) => ({
              address: address,
              name: "getAccruedExperience",
              params: [currentNFT?.id.toString()],
            })),
            appState.web3,
            appState.chainId
          ),
        ]);


        let successRate = 0;
        if(successRateFromContract[0]) {
            successRate = parseInt(successRateFromContract[0].toString());
        }
        let persentBuffSuccessRate = appState.ExpeditionState.expeditions.get(_expeditionAddress)?.buffSuccessRate[countTickets];
        if (!persentBuffSuccessRate) {
            persentBuffSuccessRate = 0;
        }
        let successRateAfterBuff = successRate * (10000 + persentBuffSuccessRate)/10000;
        let Exp = 0;
        if(ExpFromContract[0]) {
            Exp = parseInt(ExpFromContract[0].toString());
        }
        let persentBuffExp = appState.ExpeditionState.expeditions.get(_expeditionAddress)?.buffExp[countTickets];
        if (!persentBuffExp) {
            persentBuffExp = 0;
        }
        let ExpAfterBuff = Exp * (10000 + persentBuffExp)/10000;
        // Set knight in expedition
        const data: NormalKnightInExpedition = {
            ...currentNFT,
            deployTimestamp: appState.createdTime.toString(),
            successRate: successRateAfterBuff.toString(),
            accruedExperience: ExpAfterBuff.toString(),
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

        // set Ticket
        let tickets = appState[getMode(appState, _fromTicket)].ticket.ticketState;
        let ticketAfterBuff: Map<string, Ticket> = new Map();
            for (let i = 0; i < _buffWinRateTickets.length; i++) {
                let ticket = tickets.get((100001+i).toString());
                if (ticket) {
                    ticketAfterBuff.set((100001+i).toString(), {ticket: ticket.ticket, amount: ticket.amount - parseInt(_buffWinRateTickets[i]) - parseInt(_buffExpTickets[i])});
                }
            }
        appState[getMode(appState, _fromTicket)].ticket.ticketState = ticketAfterBuff;
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

export function isOnDuty(appState1: ApplicationState, _fromKnight: EthAddress, _expeditionAddress: EthAddress , _knightId: number) {
    let appState = appState1;
    if(appState[getMode(appState, _fromKnight)].knightInExpeditionState.expedition.get(_expeditionAddress)?.find(x => x.id == _knightId)) {
        let deployTimestamp = appState[getMode(appState, _fromKnight)].knightInExpeditionState.expedition.get(_expeditionAddress)?.find(x => x.id == _knightId)?.deployTimestamp;
        let time = new Date().getTime();
        let timeDeploy = new Date(parseInt(deployTimestamp!)).getTime();
        let timeLeft = time - timeDeploy
        if (timeLeft >= 0) {
            return false;
        }
        else{
            return true;
        }
    }
    else{
        throw new Error("Not have this knight in expedition");
    }
}