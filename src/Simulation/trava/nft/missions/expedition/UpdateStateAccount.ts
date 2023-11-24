import { ApplicationState, Expedition, NumberKinghtInExpedition } from "../../../../../State";
import { getAddr } from "../../../../../utils";
import { getMode, multiCall } from "../../../../../utils/helper";
import { expeditionOptions } from "./expeditionConfig";
import ExpeditionABI from "../../../../../abis/NFTExpeditionABI.json";
import BigNumber from "bignumber.js";
import { EthAddress, uint256 } from "../../../../../utils/types";
import { NormalKnightInExpedition, fetchBasicCollections, fetchNormalItems } from "../../helpers";


export async function updateOwnerKnightInExpeditionState(appState1: ApplicationState, _from: EthAddress, force = false) {
  let appState = { ...appState1 };
  try {
    let mode = getMode(appState, _from);
    if (!appState[mode].knightInExpeditionState.isFetch || force) {
      _from = _from.toLowerCase();
      const listexpedition = expeditionOptions[appState.chainId];
      let expeditionsAddress: string[] = [];
      for (let i = 0; i < listexpedition.length; i++) {
        expeditionsAddress.push(listexpedition[i].contractAddress.toLowerCase());
      }
      expeditionsAddress = expeditionsAddress.filter((address) => address !== "");
      const [tokenOfOwner]
        = await Promise.all([
          multiCall(
            ExpeditionABI,
            expeditionsAddress.map((address: string) => ({
              address: address,
              name: "getTokenOfOwnerBalance",
              params: [_from],
            })),
            appState.web3,
            appState.chainId
          )]);
      let NFTInExpeditions = [];
      for (let i = 0; i < tokenOfOwner.length; i++) {
        let total = parseInt(tokenOfOwner[i]);
        let list: string[] = [];
        for (let j = 0; j < total; j++) {
          list.push(j.toString());
        }
        if (list.length == 0) {
          NFTInExpeditions.push([]);
          continue;
        }
        let [NFTInExpedition] = await Promise.all([
          multiCall(
            ExpeditionABI,
            list.map((id: any, _: number) => ({
              address: expeditionsAddress[i],
              name: "getTokenOfOwnerAtIndex",
              params: [_from, id],
            })),
            appState.web3,
            appState.chainId
          )]);
        NFTInExpeditions.push(NFTInExpedition);
      }

      for (let i = 0; i < NFTInExpeditions.length; i++) {
        let collectionIds: string[] = [];
        for (let j = 0; j < NFTInExpeditions[i].length; j++) {
          collectionIds.push(NFTInExpeditions[i][j].toString());
        }
        if (collectionIds.length == 0) {
          continue;
        }
        const { normalCollections, specialCollections } = await fetchBasicCollections(
          collectionIds, appState
        );
        const armorTokenIdArray: Array<string> = [];
        const helmetTokenIdArray: Array<string> = [];
        const shieldTokenIdArray: Array<string> = [];
        const weaponTokenIdArray: Array<string> = [];
        normalCollections.forEach((item, _) => {
          armorTokenIdArray.push(item.armorTokenId.toString());
          helmetTokenIdArray.push(item.helmetTokenId.toString());
          shieldTokenIdArray.push(item.shieldTokenId.toString());
          weaponTokenIdArray.push(item.weaponTokenId.toString());
        });
        const normalItemsCollections = await fetchNormalItems(
          armorTokenIdArray,
          helmetTokenIdArray,
          shieldTokenIdArray,
          weaponTokenIdArray,
          appState
        );

        const [deployTimestamp, successRate, accruedExperience] = await Promise.all([
          multiCall(
            ExpeditionABI,
            collectionIds.map((id: any, _: number) => ({
              address: expeditionsAddress[i],
              name: 'getDeployTimestamp',
              params: [id],
            })),
            appState.web3,
            appState.chainId
          ),
          multiCall(
            ExpeditionABI,
            collectionIds.map((id: any, _: number) => ({
              address: expeditionsAddress[i],
              name: 'getSuccessRate',
              params: [id],
            })),
            appState.web3,
            appState.chainId
          ),
          multiCall(
            ExpeditionABI,
            collectionIds.map((id: any, _: number) => ({
              address: expeditionsAddress[i],
              name: 'getAccruedExperience',
              params: [id],
            })),
            appState.web3,
            appState.chainId
          ),
        ]);
        let knights: Array<NormalKnightInExpedition> = [];
        let counter = 0;
        for (const rawCollection of normalCollections) {
          knights.push({ ...rawCollection, ...normalItemsCollections[counter], ...{ deployTimestamp: deployTimestamp[counter].toString() }, ...{ successRate: successRate[counter].toString() }, ...{ accruedExperience: accruedExperience[counter].toString() } });
          counter++;
        }
        appState[mode].knightInExpeditionState.expedition.set(expeditionsAddress[i], knights);
        appState[mode].knightInExpeditionState.isFetch = true;
      }
    }
  } catch (err) {
    console.log(err)
  }
  return appState;
}

export async function updateExpeditionState(appState1: ApplicationState, force = false) {
  let appState = { ...appState1 };
  try {
    if (!appState.ExpeditionState.isFetch || force) {
      const listexpedition = expeditionOptions[appState.chainId];
      let expeditionsAddress: string[] = [];
      for (let i = 0; i < listexpedition.length; i++) {
        expeditionsAddress.push(listexpedition[i].contractAddress.toLowerCase());
      }
      expeditionsAddress = expeditionsAddress.filter((address) => address !== "");
      let datas = Array();
      for (let i = 1; i <= 6; i++) {
        let ExpeditionCount = expeditionsAddress.map((address: string) => ({
          address: address,
          name: "getExpeditionCount",
          params: [i.toString()],
        }));
        datas = datas.concat(ExpeditionCount);
      }
      const [expeditions] = await Promise.all([multiCall(
        ExpeditionABI,
        datas,
        appState.web3,
        appState.chainId
      )]);
      let listRaritys: Array<Array<NumberKinghtInExpedition>> = new Array();
      let listTotal: Array<number> = [];
      for (let i = 0; i < Number(BigNumber(expeditions.length).dividedBy(6)); i++) {
        let raritys: Array<NumberKinghtInExpedition> = new Array();
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
      const [expeditionPrices, successPayouts, hugeSuccessPayouts, expeditionDurations]
        = await Promise.all([
          multiCall(
            ExpeditionABI,
            expeditionsAddress.map((address: string) => ({
              address: address,
              name: "getExpeditionPrice",
              params: [],
            })),
            appState.web3,
            appState.chainId
          ),
          multiCall(
            ExpeditionABI,
            expeditionsAddress.map((address: string) => ({
              address: address,
              name: "getSuccessPayout",
              params: [],
            })),
            appState.web3,
            appState.chainId
          ),
          multiCall(
            ExpeditionABI,
            expeditionsAddress.map((address: string) => ({
              address: address,
              name: "getHugeSuccessPayout",
              params: [],
            })),
            appState.web3,
            appState.chainId
          ),
          multiCall(
            ExpeditionABI,
            expeditionsAddress.map((address: string) => ({
              address: address,
              name: "getExpeditionDuration",
              params: [],
            })),
            appState.web3,
            appState.chainId
          )
        ]);
      for (let i = 0; i < listexpedition.length; i++) {
        // let key = listexpedition[i].id
        let raritys: Array<NumberKinghtInExpedition> = new Array();
        let total: number = 0;
        let expeditionPrice: string = "";
        let hugeSuccessPayout: string = "";
        let successPayout: string = "";
        let profession: string = "";
        if (i < listRaritys.length) {
          raritys = listRaritys[i];
          total = listTotal[i];
          expeditionPrice = expeditionPrices[i].toString();
          hugeSuccessPayout = hugeSuccessPayouts[i].toString();
          successPayout = successPayouts[i].toString();
          profession = expeditionDurations[i].toString();
        }
        let expedition: Expedition = {
          ...listexpedition[i],
          totalKnight: total,
          raritys: raritys,
          profession: profession,
          expeditionPrice: expeditionPrice,
          successPayout: successPayout,
          successReward: hugeSuccessPayout,
          token: {
            address: getAddr("TRAVA_TOKEN", appState.chainId).toLowerCase(),
            decimals: 18,
          }
        }
        appState.ExpeditionState.expeditions.set(expeditionsAddress[i], expedition)
      }
      appState.ExpeditionState.isFetch = true;
    }

  } catch (err) {
    console.log(err)
  }
  return appState;
}