import { ApplicationState } from "../../../../../State";



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
    

    } catch (err) {
        console.log(err)
      }
      return appState;
    }