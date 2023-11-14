import { ApplicationState, Vault, VaultState } from "../../../../../State";
import { vaultOptions } from "./expeditionConfig";



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

      
      
    } catch (err) {
        console.log(err)
      }
      return appState;
    }


    export async function updateVaultState(appState1: ApplicationState, force = false) {
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
        */
        // check force

        const listvault = vaultOptions[appState.chainId];
        for (let i = 0; i < listvault.length; i++) {
          let key = listvault[i].id
          let vault: Vault = {
            ...listvault[i],
            totalKnight: 0,
            ownedKnight: 0,
            raritys: new Map(),
            profession: "",
            successReward: 0,
            failureRefund: 0,
            token: {
              address: "",
              decimals: 0
            }
          }
          appState.VaultState.vaults.set(key, vault)
        }
        
      } catch (err) {
          console.log(err)
        }
        return appState;
      }