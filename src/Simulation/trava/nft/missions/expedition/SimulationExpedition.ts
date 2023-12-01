import { EthAddress, uint256 } from "../../../../../utils/types";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { ArmouryType, NormalKnight, NormalKnightInExpedition, updateExpeditionState, updateOwnerKnightInExpeditionState } from "../..";
import _ from "lodash";
import { getMode, isWallet, multiCall } from "../../../../../utils/helper";
import ExpeditionABI from "../../../../../abis/NFTExpeditionABI.json";
import { Ticket } from "../../../../../State";
import { ExpeditionNotFoundError, NFTNotFoundError } from "../../../../../utils";
export async function simulateExpeditionDeploy(
    appState1: ApplicationState,
    _expeditionAddress: EthAddress, 
    _knightId: uint256, 
    _buffWinRateTickets: Array<uint256>, 
    _buffExpTickets: Array<uint256>, 
    _fromKnight: EthAddress, 
    _fromFee: EthAddress, 
    _fromTicket: EthAddress
    ): Promise<ApplicationState> {
    try { 
        let appState = { ...appState1 };
        const expeditionAddress = _expeditionAddress.toLowerCase();
        const fromKnight = _fromKnight.toLowerCase();
        const fromFee = _fromFee.toLowerCase();
        const fromTicket = _fromTicket.toLowerCase();
        if (!appState.ExpeditionState.isFetch) {
            appState = await updateExpeditionState(appState);
        }
        if (!appState[getMode(appState, fromKnight)].knightInExpeditionState.isFetch) {
            appState = await updateOwnerKnightInExpeditionState(appState, fromKnight);
        }

        let countTickets = 0;
        for (let i = 0; i < _buffWinRateTickets.length; i++) {
            countTickets += parseInt(_buffWinRateTickets[i]);
        }
        
        let currentNFT: NormalKnight | undefined = undefined;
        let mode: "walletState"|"smartWalletState";
        if (isWallet(appState, fromKnight) && isWallet(appState, fromFee) && isWallet(appState, fromTicket)) {
            mode = getMode(appState, fromKnight);
            currentNFT = appState[mode].collection.v1.find((nft) => nft.id.toString() == _knightId);
            if (!currentNFT) {
                throw new NFTNotFoundError("Knight is not found!");
            }
            appState[mode].collection["v1"] = appState[mode].collection["v1"].filter(x => x.id.toString() != _knightId);
            const [successRateAndExpFromContract]
            = await Promise.all([
              multiCall(
                ExpeditionABI,
                ["getSuccessRate","getAccruedExperience"].map((name: string) => ({
                  address: expeditionAddress,
                  name: name,
                  params: [currentNFT?.id.toString()],
                })),
                appState.web3,
                appState.chainId
              )]);
            let successRate = 0;
            if(successRateAndExpFromContract[0]) {
                successRate = parseInt(successRateAndExpFromContract[0].toString());
            }
            let persentBuffSuccessRate = appState.ExpeditionState.expeditions.get(expeditionAddress)?.buffSuccessRate[countTickets];
            if (!persentBuffSuccessRate) {
                persentBuffSuccessRate = 0;
            }
            let successRateAfterBuff = successRate * (10000 + persentBuffSuccessRate)/10000;
            let Exp = 0;
            if(successRateAndExpFromContract[1]) {
                Exp = parseInt(successRateAndExpFromContract[1].toString());
            }
            let persentBuffExp = appState.ExpeditionState.expeditions.get(expeditionAddress)?.buffExp[countTickets];
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
            appState[mode].knightInExpeditionState.expedition.set(expeditionAddress, [data]);
            // Set rarity += 1
            const expeditionData = appState.ExpeditionState.expeditions.get(expeditionAddress);
            if (expeditionData) {
                let expeditionDataRaritys = expeditionData.raritys;
                let expeditionDataRarity = expeditionDataRaritys.find(x => x.rarity == currentNFT?.rarity.toString());
                if(expeditionDataRarity) {
                    expeditionDataRarity.numberOfKnight = (parseInt(expeditionDataRarity.numberOfKnight) + 1).toString();
                    expeditionDataRaritys = expeditionDataRaritys.filter(x => x.rarity != currentNFT?.rarity.toString());
                    expeditionDataRaritys.push(expeditionDataRarity);
                    expeditionData.raritys = expeditionDataRaritys;
                    appState.ExpeditionState.expeditions.set(expeditionAddress, expeditionData);
                }
            }
            else{
                throw new ExpeditionNotFoundError("Not found this expedition");
            }
            // set Ticket
            let tickets = appState[getMode(appState, fromTicket)].ticket.ticketState;
            let ticketAfterBuff: Map<string, Ticket> = new Map();
                for (let i = 0; i < _buffWinRateTickets.length; i++) {
                    let ticket = tickets.get((100001+i).toString());
                    if (ticket) {
                        ticketAfterBuff.set((100001+i).toString(), {ticket: ticket.ticket, amount: ticket.amount - parseInt(_buffWinRateTickets[i]) - parseInt(_buffExpTickets[i])});
                    }
                }
            appState[getMode(appState, fromTicket)].ticket.ticketState = ticketAfterBuff;
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

export function isOnDuty(appState1: ApplicationState, fromKnight: EthAddress, expeditionAddress: EthAddress , _knightId: number) {
    let appState = appState1;
    if(appState[getMode(appState, fromKnight)].knightInExpeditionState.expedition.get(expeditionAddress)?.find(x => x.id == _knightId)) {
        let deployTimestamp = appState[getMode(appState, fromKnight)].knightInExpeditionState.expedition.get(expeditionAddress)?.find(x => x.id == _knightId)?.deployTimestamp;
        let time = new Date().getTime();
        let timeDeploy = new Date(parseInt(deployTimestamp!+appState.ExpeditionState.expeditions.get(expeditionAddress)?.profession)).getTime();
        let timeLeft = time - timeDeploy;
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
    // Chưa hoàn thiện
}