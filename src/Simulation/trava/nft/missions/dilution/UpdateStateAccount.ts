import { ApplicationState, Expedition, LimitedKnight, NumberKinghtInExpedition } from "../../../../../State";
import { getAddr } from "../../../../../utils";
import { getMode, isNullAddress, multiCall } from "../../../../../utils/helper";
import DilutionABI from "../../../../../abis/dilution-staking.json";
import BigNumber from "bignumber.js";
import { EthAddress, uint256 } from "../../../../../utils/types";
import { KnightArmyOptions } from "./dilutionConfig";
import { Contract } from "ethers";


export async function updateDilutionState(appState1: ApplicationState, force = false) {
  let appState = { ...appState1 };
  try {
    if (!appState.DilutionState.isFetch || force) {
      const dilutionContract = new Contract(
        getAddr("DILUTION_STAKING", appState.chainId),
        DilutionABI,
        appState.web3
      );
      const len = await dilutionContract.privateBattleFieldId();
      const [armyInfos, detailInfos] = await Promise.all([
        multiCall(
          DilutionABI,
          new Array(parseInt(len)).fill(1).map((_, index) => ({
            address: getAddr("DILUTION_STAKING", appState.chainId),
            name: "privateBattleInfos",
            params: [index + 1],
          })),
          appState.web3,
        appState.chainId
        ),
        multiCall(
          DilutionABI,
          new Array(parseInt(len)).fill(1).map((_, index) => ({
            address: getAddr("DILUTION_STAKING", appState.chainId),
            name: "privateBattleStates",
            params: [index + 1],
          })),
          appState.web3,
          appState.chainId
        ),
      ]);
      let counter = 0;
      for (const army of armyInfos) {
        const _id = parseInt(army.tokenId);
        if (!isNullAddress(army.owner)) {
          const detailData = detailInfos[counter];
          const now = Math.floor(new Date().getTime() / 1000);
          const totalPower = parseInt(detailData.totalPower) / 100;
          const dilutionProtection = 100 - 0.04 * totalPower;
          // const power = toFixed(parseFloat(PowerRatingKnight[selectedKnight.rarity - 1]) + parseFloat(data.totalPower), 1);
          // const dilutionAfterJoining = 100 - 0.04 * power;
          appState.DilutionState.dilutionLimitedKnight.set(_id, {
            id: _id,
            owner: army.owner.toLowerCase(),
            duration: parseInt(detailData.unlockTime) - now,
            dilutionProtection: dilutionProtection / 100,
            dilutionAfterJoining: 0,
            currentPowerLevel: parseInt(detailData.totalPower) / 100,
            powerLevelAfterJoining: 0,
            upfrontFee: 0,
          });
        }
        counter++;
      }

      appState.DilutionState.dilutionKnightArmy = KnightArmyOptions;
      appState.DilutionState.isFetch = true;
    }

  } catch (err) {
    console.log(err)
  }
  return appState;
}

