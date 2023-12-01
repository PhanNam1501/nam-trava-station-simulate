import { EthAddress, uint256 } from "../../../../../utils/types";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { ArmouryType, NormalKnight, NormalKnightInExpedition, updateCollectionBalanceFromContract, updateExpeditionState, updateOwnerKnightInExpeditionState, updateOwnerTicketState } from "../..";
import _ from "lodash";
import BigNumber from "bignumber.js";
import { getMode, isWallet, multiCall } from "../../../../../utils/helper";
import ExpeditionABI from "../../../../../abis/NFTExpeditionABI.json";
import { Ticket } from "../../../../../State";
import { ExpeditionNotFoundError, NFTNotFoundError, getAddr } from "../../../../../utils";
import { updateTokenBalance } from "../../../../basic";
export async function simulateExpeditionDeploy(
    appState1: ApplicationState,
    _expeditionAddress: EthAddress, 
    _knightId: uint256, 
    _buffWinRateTickets: Array<uint256>, 
    _buffExpTickets: Array<uint256>, 
    _fromKnight: EthAddress, 
    _fromExpeditionFee: EthAddress, 
    _fromTicket: EthAddress
    ): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try { 
        const expeditionAddress = _expeditionAddress.toLowerCase();
        const fromKnight = _fromKnight.toLowerCase();
        const fromExpeditionFee = _fromExpeditionFee.toLowerCase();
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
        const expeditionData = appState.ExpeditionState.expeditions.get(expeditionAddress);
        if (!expeditionData) {
            throw new ExpeditionNotFoundError("Not found this expedition");
        }
        if (!appState[getMode(appState, _fromKnight)].collection.isFetch){
            appState = await updateCollectionBalanceFromContract(appState, getMode(appState, _fromKnight)); 
        }
        if (!appState[getMode(appState, _fromTicket)].collection.isFetch){
            appState = await updateOwnerTicketState(appState, getMode(appState, _fromTicket)); 
        }

        let currentNFT: NormalKnight | undefined = undefined;
        if (isWallet(appState, fromKnight) && isWallet(appState, fromExpeditionFee) && isWallet(appState, fromTicket)) {
            let knightMode = getMode(appState, fromKnight);
            currentNFT = appState[knightMode].collection.v1.find((nft) => nft.id.toString() == _knightId);
            if (!currentNFT) {
                throw new NFTNotFoundError("Knight is not found!");
            }
            appState[knightMode].collection["v1"] = appState[knightMode].collection["v1"].filter(x => x.id.toString() != _knightId);
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
            let persentBuffSuccessRate = expeditionData.buffSuccessRate[countTickets];
            if (!persentBuffSuccessRate) {
                persentBuffSuccessRate = 0;
            }
            let successRateAfterBuff = successRate * (10000 + persentBuffSuccessRate)/10000;
            let Exp = 0;
            if(successRateAndExpFromContract[1]) {
                Exp = parseInt(successRateAndExpFromContract[1].toString());
            }
            let persentBuffExp = expeditionData.buffExp[countTickets];
            if (!persentBuffExp) {
                persentBuffExp = 0;
            }
            let ExpAfterBuff = Exp * (10000 + persentBuffExp)/10000;

            const data: NormalKnightInExpedition = {
                ...currentNFT,
                deployTimestamp: appState.createdTime.toString(),
                successRate: successRateAfterBuff.toString(),
                accruedExperience: ExpAfterBuff.toString(),
            };

            let expeditionDataRaritys = expeditionData.raritys;
            let expeditionDataRarity = expeditionDataRaritys.find(x => x.rarity == currentNFT?.rarity.toString());
            if(expeditionDataRarity) {
                expeditionDataRarity.numberOfKnight = (parseInt(expeditionDataRarity.numberOfKnight) + 1).toString();
                expeditionDataRaritys = expeditionDataRaritys.filter(x => x.rarity != currentNFT?.rarity.toString());
                expeditionDataRaritys.push(expeditionDataRarity);
                expeditionData.raritys = expeditionDataRaritys;
                expeditionData.totalKnight += 1;
            }
            else {
                throw new Error("Not found Knight's rarity");
            }

            let tickets = appState[getMode(appState, fromTicket)].ticket.ticketState;
            let ticketAfterBuff: Map<string, Ticket> = new Map();
            for (let i = 0; i < _buffWinRateTickets.length; i++) {
                let ticket = tickets.get((100001+i).toString());
                if (ticket) {
                    ticketAfterBuff.set((100001+i).toString(), {ticket: ticket.ticket, amount: ticket.amount - parseInt(_buffWinRateTickets[i]) - parseInt(_buffExpTickets[i])});
                }
            }

            let priceTokenAddress = getAddr("TRAVA_TOKEN", appState.chainId).toLowerCase();
            let modeExpeditionFee = getMode(appState, fromExpeditionFee);
            if(!appState[modeExpeditionFee].tokenBalances.has(priceTokenAddress)) {
                appState = await updateTokenBalance(appState, fromExpeditionFee, priceTokenAddress);
            }
            let price = BigNumber(appState.ExpeditionState.expeditions.get(expeditionAddress)!.expeditionPrice);          
            let oldBalance = BigNumber(appState[modeExpeditionFee].tokenBalances.get(priceTokenAddress)!);
            let newBalance = oldBalance.minus(price).toFixed();

            appState[modeExpeditionFee].tokenBalances.set(priceTokenAddress, newBalance);
            appState.smartWalletState.knightInExpeditionState.expedition.set(expeditionAddress, [data]);
            appState.ExpeditionState.expeditions.set(expeditionAddress, expeditionData);
            appState[getMode(appState, fromTicket)].ticket.ticketState = ticketAfterBuff;
        }
        return appState;
    } catch(err) {
        throw err;
    }
}

export async function simulateExpeditionAbandon(appState1: ApplicationState, _vault: EthAddress, _knightId: uint256, _to: EthAddress) {
    let appState = { ...appState1 };
    try {
        const expeditionAddress = _vault.toLowerCase();
        const to = _to.toLowerCase();
        if (!appState.ExpeditionState.isFetch) {
            appState = await updateExpeditionState(appState);
        }
        if (!appState.smartWalletState.knightInExpeditionState.isFetch) {
            appState = await updateOwnerKnightInExpeditionState(appState, to);
        }
        if (!isOnDuty(appState, _vault, _knightId)) {
            throw new Error("Knight is not on duty");
        }
        let returnData = getExpeditionData(appState, expeditionAddress, _knightId);
        let expeditionData = returnData.expeditionData;
        let expeditionInSmartwalletData = returnData.expeditionInSmartwalletData;
        let currentNFT = returnData.currentNFT;
        
        let newExpeditionInSmartwalletData = expeditionInSmartwalletData.filter(x => x.id.toString() != _knightId);
        if (isWallet(appState, to)){
            let newDataNFT: NormalKnight = getNormalKnightInExpedition(currentNFT, false);
            let modeTo = getMode(appState, to);
            if (!appState[modeTo].collection.isFetch){
                appState = await updateCollectionBalanceFromContract(appState, modeTo); 
            }
            appState[modeTo].collection["v1"].push(newDataNFT);
        }
        appState.ExpeditionState.expeditions.set(expeditionAddress, expeditionData);
        appState.smartWalletState.knightInExpeditionState.expedition.set(expeditionAddress, newExpeditionInSmartwalletData);
    } catch(err) {
        console.log(err);
    }
    return appState;
}

export async function simulateExpeditionWithdraw(appState1: ApplicationState, _vault: EthAddress, _knightId: uint256, _to: EthAddress) {
    let appState = appState1;
    try {
        const expeditionAddress = _vault.toLowerCase();
        const toAddress = _to.toLowerCase();
        if (!appState.ExpeditionState.isFetch) {
            appState = await updateExpeditionState(appState);
        }
        if (!appState.smartWalletState.knightInExpeditionState.isFetch) {
            appState = await updateOwnerKnightInExpeditionState(appState, toAddress);
        }
        if (isOnDuty(appState, _vault, _knightId)) {
            throw new Error("Knight is on duty");
        }
        let returnData = getExpeditionData(appState, expeditionAddress, _knightId);
        let expeditionData = returnData.expeditionData;
        let expeditionInSmartwalletData = returnData.expeditionInSmartwalletData;
        let priceTokenAddress = getAddr("TRAVA_TOKEN", appState.chainId).toLowerCase();
        
        let newExpeditionInSmartwalletData = expeditionInSmartwalletData.filter(x => x.id.toString() != _knightId);
        if (isWallet(appState, toAddress)){
            let currentNFT = returnData.currentNFT;
            let newDataNFT: NormalKnight = getNormalKnightInExpedition(currentNFT, true);
            let modeTo = getMode(appState, toAddress);
            if (!appState[modeTo].collection.isFetch){
                appState = await updateCollectionBalanceFromContract(appState, modeTo); 
            }
            if(!appState[modeTo].tokenBalances.has(priceTokenAddress)) {
                appState = await updateTokenBalance(appState, toAddress, priceTokenAddress);
            }
            let reward = BigNumber(appState.ExpeditionState.expeditions.get(expeditionAddress)!.successReward);          
            let oldBalance = BigNumber(appState[modeTo].tokenBalances.get(priceTokenAddress)!);
            let newBalance = oldBalance.plus(reward).toFixed();
            appState[modeTo].collection["v1"].push(newDataNFT);
            appState[modeTo].tokenBalances.set(priceTokenAddress, newBalance);
        }
        appState.ExpeditionState.expeditions.set(expeditionAddress, expeditionData);
        appState.smartWalletState.knightInExpeditionState.expedition.set(expeditionAddress, newExpeditionInSmartwalletData);
    } catch(err) {
        console.log(err);
    }
    return appState;
}

export function isOnDuty(appState1: ApplicationState, expeditionAddress: EthAddress , _knightId: uint256) {
    let appState = appState1;
    let expeditionData = appState.ExpeditionState.expeditions.get(expeditionAddress);
    let ownerKnightInExpeditionData = appState.smartWalletState.knightInExpeditionState.expedition.get(expeditionAddress);
    if (!ownerKnightInExpeditionData) {
        throw new NFTNotFoundError("Knight is not found!");
    }
    if (!expeditionData) {
        throw new ExpeditionNotFoundError("Not found this expedition");
    }
    let currentNFT = ownerKnightInExpeditionData.find(x => x.id.toString() == _knightId);
    if(!currentNFT) {
        throw new NFTNotFoundError("Knight is not found!");
    }
    let deployTimestamp = currentNFT.deployTimestamp;
    let timeNow = appState.createdTime;
    let duration = parseInt(expeditionData.profession);
    let timeFinish = parseInt(deployTimestamp)+duration;
    let timeLeft = timeFinish - timeNow;
    if (timeLeft > 0) {
        return true;
    }
    else{
        return false;
    }
}

export function getExpeditionData(appState1: ApplicationState, expeditionAddress: EthAddress, _knightId: uint256) {
    let appState = appState1;
    let expeditionData = appState.ExpeditionState.expeditions.get(expeditionAddress);
    let expeditionInSmartwalletData = appState.smartWalletState.knightInExpeditionState.expedition.get(expeditionAddress);
        if (!expeditionData || !expeditionInSmartwalletData) {
            throw new ExpeditionNotFoundError("Not found this expedition");
        }
        let currentNFT = expeditionInSmartwalletData.find(x => x.id.toString() == _knightId);
        if (!currentNFT) {
            throw new NFTNotFoundError("Knight is not found!");
        }
        let expeditionDataRaritys = expeditionData.raritys;
        let expeditionDataRarity = expeditionDataRaritys.find(x => x.rarity == currentNFT?.rarity.toString());
        if(expeditionDataRarity) {
            expeditionDataRarity.numberOfKnight = (parseInt(expeditionDataRarity.numberOfKnight) - 1).toString();
            expeditionDataRaritys = expeditionDataRaritys.filter(x => x.rarity != currentNFT?.rarity.toString());
            expeditionDataRaritys.push(expeditionDataRarity);
            expeditionData.raritys = expeditionDataRaritys;
            expeditionData.totalKnight -= 1;
        }
        else {
            throw new Error("Not found Knight's rarity");
        }
    return {'expeditionData': expeditionData, 'expeditionInSmartwalletData': expeditionInSmartwalletData, 'currentNFT': currentNFT};
}

export function getNormalKnightInExpedition(currentNFT: NormalKnightInExpedition, isWithdraw: boolean) {
    let newDataNFT: NormalKnight = {
        armorTokenId: currentNFT.armorTokenId,
        helmetTokenId: currentNFT.helmetTokenId,
        shieldTokenId: currentNFT.shieldTokenId,
        weaponTokenId: currentNFT.weaponTokenId,
        rarity: currentNFT.rarity,
        id: currentNFT.id,
        setId: currentNFT.setId,
        exp: isWithdraw? currentNFT.exp + parseInt(currentNFT.accruedExperience) : currentNFT.exp,
        armor: currentNFT.armor,
        helmet: currentNFT.helmet,
        shield: currentNFT.shield,
        weapon: currentNFT.weapon,
    };
    return newDataNFT;
}