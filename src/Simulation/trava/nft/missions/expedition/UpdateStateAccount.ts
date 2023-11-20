import { Contract } from "ethers";
import { ApplicationState, Vault, VaultState } from "../../../../../State";
import { getAddr } from "../../../../../utils";
import { getMode, multiCall } from "../../../../../utils/helper";
import { vaultOptions } from "./expeditionConfig";
import ExpeditionABI from "../../../../../abis/NFTExpeditionABI.json";
import BigNumber from "bignumber.js";
import { EthAddress } from "../../../../../utils/types";
import { NormalKnight, NormalKnightInVault, fetchBasicCollections, fetchNormalItems } from "../../helpers";


export async function updateOwnerKnightInVaultState(appState1: ApplicationState, _from: EthAddress, force = false) {
    let appState = { ...appState1 };
    try {
      _from = _from.toLowerCase();
      let mode = getMode(appState, _from);
      /*
      Cập nhật: 
      - Các NFT đang sở hữu: 
        + ID NFT
        + Rarity: diamond
        + EXP: 702.731
        + Remainning time: 1 day 15 hours
        + success rate: 0.68%
        + porential expentience: 54,000
      - BOOST:
        + YOUR TICKET: 0
      */

      let vaultsName = new Map<number, string>([
        [0, "rookie"],
        [1, "professional"],
        [2, "veteran"],
        [3, "elite"],
        [4, "master"],
        [5, "ultimate"],
      ])
      
      const listvault = vaultOptions[appState.chainId];
      let vaultsAddress: string[] = [];
      for (let i = 0; i < listvault.length; i++) {
        vaultsAddress.push(listvault[i].contractAddress);
      }
      vaultsAddress = vaultsAddress.filter((address) => address !== "");
      const [tokenOfOwner]
      = await Promise.all([
      multiCall(
      ExpeditionABI,
      vaultsAddress.map((address: string) => ({
        address: address,
        name: "getTokenOfOwnerBalance",
        params: [_from],
      })),
      appState.web3,
      appState.chainId
      )]);
      let NFTInVaults = [];
      for (let i = 0; i < tokenOfOwner.length; i++) {
        let total = parseInt(tokenOfOwner[i]);
        let list: string[] = [];
        for (let j = 0; j < total; j++) {
          list.push(j.toString());
        }
        if (list.length == 0) {
          NFTInVaults.push([]);
          continue;
        }
        let [NFTInVault] = await Promise.all([
          multiCall(
            ExpeditionABI,
            list.map((id: any, _: number) => ({
                address: vaultsAddress[i],
                name: "getTokenOfOwnerAtIndex",
                params: [_from, id],
            })),
            appState.web3,
            appState.chainId
          )]);
        NFTInVaults.push(NFTInVault);
      }

      for (let i = 0; i < NFTInVaults.length; i++) {
        let name = vaultsName.get(i);
        let collectionIds: string[] = [];
        for ( let j = 0; j < NFTInVaults[i].length; j++) {
          collectionIds.push(NFTInVaults[i][j].toString());
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
              address: vaultsAddress[i],
              name: 'getDeployTimestamp',
              params: [id],
            })),
            appState.web3,
            appState.chainId
          ),
          multiCall(
            ExpeditionABI,
            collectionIds.map((id: any, _: number) => ({
              address: vaultsAddress[i],
              name: 'getSuccessRate',
              params: [id],
            })),
            appState.web3,
            appState.chainId
          ),
          multiCall(
            ExpeditionABI,
            collectionIds.map((id: any, _: number) => ({
              address: vaultsAddress[i],
              name: 'getAccruedExperience',
              params: [id],
            })),
            appState.web3,
            appState.chainId
          ),
        ]);
        let knights: Array<NormalKnightInVault> = [];
        let counter = 0;
        for (const rawCollection of normalCollections) {
          knights.push({ ...rawCollection, ...normalItemsCollections[counter], ...{deployTimestamp: deployTimestamp[counter].toString()}, ...{successRate: successRate[counter].toString()}, ...{accruedExperience: accruedExperience[counter].toString()}});
          counter++;
        }
        appState[mode].knightInVaultState.vault.set(name!, knights);
      }
      console.log(appState[mode].knightInVaultState.vault)

    } catch (err) {
        console.log(err)
      }
      return appState;
    }


export async function updateVaultState(appState1: ApplicationState, force = false) {
  let appState = { ...appState1 };
  try {
    const listvault = vaultOptions[appState.chainId];
    let vaultsAddress: string[] = [];
    for (let i = 0; i < listvault.length; i++) {
      vaultsAddress.push(listvault[i].contractAddress);
    }
    vaultsAddress = vaultsAddress.filter((address) => address !== "");
    let datas = Array();
    for (let i = 1; i <= 6; i++) {
      let A = vaultsAddress.map((address: string) => ({
        address: address,
        name: "getExpeditionCount",
        params: [i.toString()],
      }));
      datas = datas.concat(A);
    }
    const vaults = await multiCall(
      ExpeditionABI,
      datas,
      appState.web3,
      appState.chainId
    );
    let listRitys: Array<Map<string, number>> = [];
    let listTotal: Array<number> = [];
    for (let i = 0; i < Number(BigNumber(vaults.length).dividedBy(6)); i++) {
      let raritys: Map<string, number> = new Map();
      let ListJ = listvault[i].acceptableRarities;
      let Total = 0;
      for (let j = 0; j < ListJ.length; j++) {
        Total += Number(vaults[i+j*Number(BigNumber(vaults.length).dividedBy(6))]);
        raritys.set(ListJ[j].toString(), vaults[i+j*Number(BigNumber(vaults.length).dividedBy(6))]);
      }
      listRitys.push(raritys);
      listTotal.push(Total);
    }
    const [expeditionPrices, successPayouts, hugeSuccessPayouts, expeditionDurations]
      = await Promise.all([
      multiCall(
      ExpeditionABI,
      vaultsAddress.map((address: string) => ({
        address: address,
        name: "getExpeditionPrice",
        params: [],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      ExpeditionABI,
      vaultsAddress.map((address: string) => ({
        address: address,
        name: "getSuccessPayout",
        params: [],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      ExpeditionABI,
      vaultsAddress.map((address: string) => ({
        address: address,
        name: "getHugeSuccessPayout",
        params: [],
      })),
      appState.web3,
      appState.chainId
    ),
    multiCall(
      ExpeditionABI,
      vaultsAddress.map((address: string) => ({
        address: address,
        name: "getExpeditionDuration",
        params: [],
      })),
      appState.web3,
      appState.chainId
    )
    ]);
    console.log(expeditionDurations)
    for (let i = 0; i < listvault.length; i++) {
      let key = listvault[i].id
      let raritys: Map<string, number> = new Map();
      let total: number = 0;
      let expeditionPrice: string = "";
      let hugeSuccessPayout: string = "";
      let successPayout: string = "";
      let profession: string = "";
      if (i < listRitys.length) {
        raritys = listRitys[i];
        total = listTotal[i];
        expeditionPrice = expeditionPrices[i].toString();
        hugeSuccessPayout = hugeSuccessPayouts[i].toString();
        successPayout = successPayouts[i].toString();
        profession = expeditionDurations[i].toString();
      }
      let vault: Vault = {
        ...listvault[i],
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
      appState.VaultState.vaults.set(key, vault)
    }
  } catch (err) {
      console.log(err)
    }
    return appState;
  }