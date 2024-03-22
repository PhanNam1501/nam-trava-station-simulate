var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAddr } from "../../../../../utils";
import { getMode, multiCall } from "../../../../../utils/helper";
import { expeditionOptions } from "./expeditionConfig";
import ExpeditionABI from "../../../../../abis/NFTExpeditionABI.json";
import BigNumber from "bignumber.js";
import { fetchBasicCollections, fetchNormalItems } from "../../helpers";
export function updateOwnerKnightInExpeditionState(appState1, _from, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let mode = getMode(appState, _from);
            if (!appState[mode].knightInExpeditionState.isFetch || force) {
                _from = _from.toLowerCase();
                const listexpedition = expeditionOptions[appState.chainId];
                let expeditionsAddress = [];
                for (let i = 0; i < listexpedition.length; i++) {
                    expeditionsAddress.push(listexpedition[i].contractAddress.toLowerCase());
                }
                expeditionsAddress = expeditionsAddress.filter((address) => address !== "");
                const [tokenOfOwner] = yield Promise.all([
                    multiCall(ExpeditionABI, expeditionsAddress.map((address) => ({
                        address: address,
                        name: "getTokenOfOwnerBalance",
                        params: [_from],
                    })), appState.web3, appState.chainId)
                ]);
                let NFTInExpeditions = [];
                for (let i = 0; i < tokenOfOwner.length; i++) {
                    let total = parseInt(tokenOfOwner[i]);
                    let list = [];
                    for (let j = 0; j < total; j++) {
                        list.push(j.toString());
                    }
                    if (list.length == 0) {
                        NFTInExpeditions.push([]);
                        continue;
                    }
                    let [NFTInExpedition] = yield Promise.all([
                        multiCall(ExpeditionABI, list.map((id, _) => ({
                            address: expeditionsAddress[i],
                            name: "getTokenOfOwnerAtIndex",
                            params: [_from, id],
                        })), appState.web3, appState.chainId)
                    ]);
                    NFTInExpeditions.push(NFTInExpedition);
                }
                for (let i = 0; i < NFTInExpeditions.length; i++) {
                    let collectionIds = [];
                    for (let j = 0; j < NFTInExpeditions[i].length; j++) {
                        collectionIds.push(NFTInExpeditions[i][j].toString());
                    }
                    if (collectionIds.length == 0) {
                        continue;
                    }
                    const { normalCollections, specialCollections } = yield fetchBasicCollections(collectionIds, appState);
                    const armorTokenIdArray = [];
                    const helmetTokenIdArray = [];
                    const shieldTokenIdArray = [];
                    const weaponTokenIdArray = [];
                    normalCollections.forEach((item, _) => {
                        armorTokenIdArray.push(item.armorTokenId.toString());
                        helmetTokenIdArray.push(item.helmetTokenId.toString());
                        shieldTokenIdArray.push(item.shieldTokenId.toString());
                        weaponTokenIdArray.push(item.weaponTokenId.toString());
                    });
                    const normalItemsCollections = yield fetchNormalItems(armorTokenIdArray, helmetTokenIdArray, shieldTokenIdArray, weaponTokenIdArray, appState);
                    const [deployTimestamp, successRate, accruedExperience] = yield Promise.all([
                        multiCall(ExpeditionABI, collectionIds.map((id, _) => ({
                            address: expeditionsAddress[i],
                            name: 'getDeployTimestamp',
                            params: [id],
                        })), appState.web3, appState.chainId),
                        multiCall(ExpeditionABI, collectionIds.map((id, _) => ({
                            address: expeditionsAddress[i],
                            name: 'getSuccessRate',
                            params: [id],
                        })), appState.web3, appState.chainId),
                        multiCall(ExpeditionABI, collectionIds.map((id, _) => ({
                            address: expeditionsAddress[i],
                            name: 'getAccruedExperience',
                            params: [id],
                        })), appState.web3, appState.chainId),
                    ]);
                    let knights = [];
                    let counter = 0;
                    for (const rawCollection of normalCollections) {
                        knights.push(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, rawCollection), normalItemsCollections[counter]), { deployTimestamp: deployTimestamp[counter].toString() }), { successRate: successRate[counter].toString() }), { accruedExperience: accruedExperience[counter].toString() }));
                        counter++;
                    }
                    appState[mode].knightInExpeditionState.expedition.set(expeditionsAddress[i], knights);
                    appState[mode].knightInExpeditionState.isFetch = true;
                }
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function updateExpeditionState(appState1, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (!appState.ExpeditionState.isFetch || force) {
                const listexpedition = expeditionOptions[appState.chainId];
                let expeditionsAddress = [];
                for (let i = 0; i < listexpedition.length; i++) {
                    expeditionsAddress.push(listexpedition[i].contractAddress.toLowerCase());
                }
                expeditionsAddress = expeditionsAddress.filter((address) => address !== "");
                let datas = Array();
                for (let i = 1; i <= 6; i++) {
                    let ExpeditionCount = expeditionsAddress.map((address) => ({
                        address: address,
                        name: "getExpeditionCount",
                        params: [i.toString()],
                    }));
                    datas = datas.concat(ExpeditionCount);
                }
                const [expeditions] = yield Promise.all([multiCall(ExpeditionABI, datas, appState.web3, appState.chainId)]);
                let listRaritys = new Array();
                let listTotal = [];
                for (let i = 0; i < Number(BigNumber(expeditions.length).dividedBy(6)); i++) {
                    let raritys = new Array();
                    let ListAcceptableRarities = listexpedition[i].acceptableRarities;
                    let Total = 0;
                    for (let j = 0; j < ListAcceptableRarities.length; j++) {
                        Total += Number(expeditions[i + j * expeditions.length / 6]);
                        raritys.push({
                            rarity: ListAcceptableRarities[j].toString(),
                            numberOfKnight: String(expeditions[i + j * expeditions.length / 6])
                        });
                    }
                    listRaritys.push(raritys);
                    listTotal.push(Total);
                }
                const [expeditionPrices, successPayouts, hugeSuccessPayouts, expeditionDurations] = yield Promise.all([
                    multiCall(ExpeditionABI, expeditionsAddress.map((address) => ({
                        address: address,
                        name: "getExpeditionPrice",
                        params: [],
                    })), appState.web3, appState.chainId),
                    multiCall(ExpeditionABI, expeditionsAddress.map((address) => ({
                        address: address,
                        name: "getSuccessPayout",
                        params: [],
                    })), appState.web3, appState.chainId),
                    multiCall(ExpeditionABI, expeditionsAddress.map((address) => ({
                        address: address,
                        name: "getHugeSuccessPayout",
                        params: [],
                    })), appState.web3, appState.chainId),
                    multiCall(ExpeditionABI, expeditionsAddress.map((address) => ({
                        address: address,
                        name: "getExpeditionDuration",
                        params: [],
                    })), appState.web3, appState.chainId)
                ]);
                for (let i = 0; i < listexpedition.length; i++) {
                    if (expeditionsAddress[i] == undefined)
                        continue;
                    let raritys = new Array();
                    let total = 0;
                    let expeditionPrice = "";
                    let hugeSuccessPayout = "";
                    let successPayout = "";
                    let profession = "";
                    if (i < listRaritys.length) {
                        raritys = listRaritys[i];
                        total = listTotal[i];
                        expeditionPrice = expeditionPrices[i].toString();
                        hugeSuccessPayout = hugeSuccessPayouts[i].toString();
                        successPayout = successPayouts[i].toString();
                        profession = expeditionDurations[i].toString();
                    }
                    const [buffSuccessRate, buffExp] = yield Promise.all([
                        multiCall(ExpeditionABI, [1, 2, 3, 4, 5].map((id) => ({
                            address: expeditionsAddress[i],
                            name: "buffWinRate",
                            params: [id],
                        })), appState.web3, appState.chainId),
                        multiCall(ExpeditionABI, [1, 2, 3, 4, 5].map((id) => ({
                            address: expeditionsAddress[i],
                            name: "buffExp",
                            params: [id],
                        })), appState.web3, appState.chainId)
                    ]);
                    for (let j = 0; j < buffSuccessRate.length; j++) {
                        buffSuccessRate[j] = parseInt(buffSuccessRate[j]);
                    }
                    for (let j = 0; j < buffExp.length; j++) {
                        buffExp[j] = parseInt(buffExp[j]);
                    }
                    let expedition = Object.assign(Object.assign({}, listexpedition[i]), { totalKnight: total, raritys: raritys, profession: profession, expeditionPrice: expeditionPrice, successPayout: successPayout, successReward: hugeSuccessPayout, buffSuccessRate: buffSuccessRate, buffExp: buffExp, token: {
                            address: getAddr("TRAVA_TOKEN", appState.chainId).toLowerCase(),
                            decimals: 18,
                        } });
                    appState.ExpeditionState.expeditions.set(expeditionsAddress[i], expedition);
                }
                appState.ExpeditionState.isFetch = true;
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
