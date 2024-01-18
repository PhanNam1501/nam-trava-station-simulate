"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDilutionState = void 0;
const utils_1 = require("../../../../../utils");
const helper_1 = require("../../../../../utils/helper");
const dilution_staking_json_1 = __importDefault(require("../../../../../abis/dilution-staking.json"));
const dilutionConfig_1 = require("./dilutionConfig");
const ethers_1 = require("ethers");
function updateDilutionState(appState1, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (!appState.DilutionState.isFetch || force) {
                const dilutionContract = new ethers_1.Contract((0, utils_1.getAddr)("DILUTION_STAKING", appState.chainId), dilution_staking_json_1.default, appState.web3);
                const len = yield dilutionContract.privateBattleFieldId();
                const [armyInfos, detailInfos] = yield Promise.all([
                    (0, helper_1.multiCall)(dilution_staking_json_1.default, new Array(parseInt(len)).fill(1).map((_, index) => ({
                        address: (0, utils_1.getAddr)("DILUTION_STAKING", appState.chainId),
                        name: "privateBattleInfos",
                        params: [index + 1],
                    })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(dilution_staking_json_1.default, new Array(parseInt(len)).fill(1).map((_, index) => ({
                        address: (0, utils_1.getAddr)("DILUTION_STAKING", appState.chainId),
                        name: "privateBattleStates",
                        params: [index + 1],
                    })), appState.web3, appState.chainId),
                ]);
                let counter = 0;
                for (const army of armyInfos) {
                    const _id = parseInt(army.tokenId);
                    if (!(0, helper_1.isNullAddress)(army.owner)) {
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
                            upfrontFee: '0',
                        });
                    }
                    counter++;
                }
                appState.DilutionState.dilutionKnightArmy = dilutionConfig_1.KnightArmyOptions;
                appState.DilutionState.isFetch = true;
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.updateDilutionState = updateDilutionState;
