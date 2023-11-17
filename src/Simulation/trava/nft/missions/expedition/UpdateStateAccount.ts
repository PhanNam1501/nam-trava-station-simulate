import { Contract } from "ethers";
import { ApplicationState, Vault, VaultState } from "../../../../../State";
import { getAddr } from "../../../../../utils";
import { multiCall } from "../../../../../utils/helper";
import { vaultOptions } from "./expeditionConfig";
import ExpeditionABI from "../../../../../abis/NFTExpeditionABI.json";
import BigNumber from "bignumber.js";
import { EthAddress } from "../../../../../utils/types";


export async function updateExpeditionState(appState1: ApplicationState, force = false) {
    let appState = { ...appState1 };
    try {
      /*
      Cập nhật: 
      - From: smart wallet
      - EXPENDITIONS: 
      + id
      + Raritys: diamond 430, gold 70, silver 0, bronze 0
      + professional: 3 hour
      + success reward: 300 TRAVA
      + Total knights deployed: 502 Knights
      + Owned Knights: 420 Knights
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
      
      const listvault = vaultOptions[appState.chainId];
    //ownedKnight: 0, // getTokenOfOwnerBalance
    //   * @notice  .
    //   * @dev     getTokenOfOwnerBalance Get currently deployed knight count of an address
    //   * @param   _owner  Owner address
    //   * @return  uint256  .
    //   function getTokenOfOwnerBalance(address _owner)
    //   external
    //   view
    //   returns (uint256)
    // {
    //   return EnumerableSet.length(_tokenOfOwner[_owner]);
    // }

      
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