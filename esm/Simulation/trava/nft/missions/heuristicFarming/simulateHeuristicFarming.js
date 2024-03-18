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
exports.simulateTravaNFTHeuristicFarmingPolish = exports.simulateTravaNFTHeuristicFarmingClaim = exports.simulateTravaNFTHeuristicFarmingWithdraw = exports.simulateTravaNFTHeuristicFarmingStake = exports.caculateValue = exports.getNormalKinghtFromFarmingKnight = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const utils_1 = require("../../../../../utils");
const helper_1 = require("../../../../../utils/helper");
const helpers_1 = require("../../helpers");
const utilities_1 = require("../../utilities");
const UpdateStateAccount_1 = require("./UpdateStateAccount");
const staking_1 = require("../../../staking");
function getNormalKinghtFromFarmingKnight(farmingKnightDetailInfo) {
    const armor = farmingKnightDetailInfo.armor;
    const helmet = farmingKnightDetailInfo.helmet;
    const shield = farmingKnightDetailInfo.shield;
    const weapon = farmingKnightDetailInfo.weapon;
    let exp = (0, bignumber_js_1.default)(armor.exp).plus(helmet.exp).plus(shield.exp).plus(weapon.exp);
    const normalKnight = {
        armorTokenId: armor.tokenId,
        helmetTokenId: helmet.tokenId,
        shieldTokenId: shield.tokenId,
        weaponTokenId: weapon.tokenId,
        rarity: farmingKnightDetailInfo.rarity,
        id: farmingKnightDetailInfo.id,
        setId: 1,
        exp: exp.toNumber(),
        armor: armor,
        helmet: helmet,
        shield: shield,
        weapon: weapon
    };
    return normalKnight;
}
exports.getNormalKinghtFromFarmingKnight = getNormalKinghtFromFarmingKnight;
function caculateValue(newExp) {
    return newExp / utils_1.DAY_TO_SECONDS + 100;
}
exports.caculateValue = caculateValue;
function simulateTravaNFTHeuristicFarmingStake(appState1, _ids, _vaultId, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (!appState.smartWalletState.NFTFarmingsState.isFetch) {
                appState = yield (0, UpdateStateAccount_1.updateFarmingState)(appState);
            }
            let mode = (0, helper_1.getMode)(appState, _from);
            if (!appState[mode].collection.isFetch) {
                appState = yield (0, utilities_1.updateCollectionBalanceFromContract)(appState, mode);
            }
            let heuristicFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(_vaultId.toLowerCase());
            let totalNFTs = heuristicFarmingVault.totalNFTs;
            let totalVaultValue = heuristicFarmingVault.totalVaultValue;
            let dailyReward = heuristicFarmingVault.dailyReward;
            let newTotalVaultValue = totalVaultValue;
            for (let i = 0; i < _ids.length; i++) {
                let currentNFT = appState[mode].collection.v1.find((n) => n.id == _ids[i]);
                if (!currentNFT) {
                    throw new utils_1.NFTNotFoundError("Knight is not found!");
                }
                newTotalVaultValue += caculateValue(currentNFT.exp);
            }
            for (let i = 0; i < _ids.length; i++) {
                let currentNFT = appState[mode].collection.v1.find((n) => n.id == _ids[i]);
                if (!currentNFT) {
                    throw new utils_1.NFTNotFoundError("Knight is not found!");
                }
                const rarityStr = helpers_1.RarityMapping[currentNFT.rarity - 1];
                let collectionFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(`${rarityStr}-vault`);
                let knightApr = (0, UpdateStateAccount_1.calculateKnightApr)(dailyReward, 100, newTotalVaultValue, collectionFarmingVault.vault.collectionPrice);
                let nftInfo = {
                    attainedExp: 0,
                    depositedTime: 0,
                    lastPolishTime: appState.createdTime,
                    id: _ids[i],
                    exp: currentNFT.exp,
                    earn: 0,
                    value: caculateValue(currentNFT.exp)
                };
                let farmingKnightDetailInfo = Object.assign(Object.assign({}, nftInfo), { apr: knightApr, rarity: currentNFT.rarity, armor: currentNFT.armor, helmet: currentNFT.helmet, shield: currentNFT.shield, weapon: currentNFT.weapon });
                heuristicFarmingVault.farmingState.push(farmingKnightDetailInfo);
                appState[mode].collection.v1 = appState[mode].collection.v1.filter(x => x.id != _ids[i]);
            }
            heuristicFarmingVault.numberKnightOfUser = heuristicFarmingVault.numberKnightOfUser + _ids.length;
            heuristicFarmingVault.totalNFTs = totalNFTs + _ids.length;
            heuristicFarmingVault.aprAvg = (0, UpdateStateAccount_1.calculateVaultApr)(dailyReward, totalNFTs + _ids.length, heuristicFarmingVault.vault.collectionPrice);
            heuristicFarmingVault.totalVaultValue = newTotalVaultValue;
            appState.smartWalletState.NFTFarmingsState.nftFarmings.set(_vaultId, heuristicFarmingVault);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateTravaNFTHeuristicFarmingStake = simulateTravaNFTHeuristicFarmingStake;
function simulateTravaNFTHeuristicFarmingWithdraw(appState1, _ids, _vaultId, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (!appState.smartWalletState.NFTFarmingsState.isFetch) {
                appState = yield (0, UpdateStateAccount_1.updateFarmingState)(appState);
            }
            let heuristicFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(_vaultId.toLowerCase());
            let totalNFTs = heuristicFarmingVault.totalNFTs;
            let totalVaultValue = heuristicFarmingVault.totalVaultValue;
            let dailyReward = heuristicFarmingVault.dailyReward;
            let withdrawValue = 0;
            for (let sellingId = 0; sellingId < heuristicFarmingVault.farmingState.length; sellingId++) {
                if (_ids.includes(sellingId)) {
                    withdrawValue += heuristicFarmingVault.farmingState[sellingId].value;
                }
            }
            for (let sellingId = 0; sellingId < heuristicFarmingVault.farmingState.length; sellingId++) {
                let farmingKnightDetailInfo = heuristicFarmingVault.farmingState[sellingId];
                if (_ids.includes(farmingKnightDetailInfo.id)) {
                    if ((0, helper_1.isWallet)(appState, _to)) {
                        let toMode = (0, helper_1.getMode)(appState, _to);
                        let normalKnight = getNormalKinghtFromFarmingKnight(heuristicFarmingVault.farmingState[sellingId]);
                        normalKnight.exp = (0, bignumber_js_1.default)(normalKnight.exp).plus((0, bignumber_js_1.default)(appState.createdTime).minus(farmingKnightDetailInfo.depositedTime).div(3).toFixed(0)).toNumber();
                        if (!appState[toMode].collection.isFetch) {
                            appState = yield (0, utilities_1.updateCollectionBalanceFromContract)(appState, toMode);
                        }
                        appState[toMode].collection.v1.push(normalKnight);
                    }
                    heuristicFarmingVault.farmingState = heuristicFarmingVault.farmingState.filter(n => n.id != sellingId);
                    sellingId--;
                }
                else {
                    const rarityStr = helpers_1.RarityMapping[heuristicFarmingVault.farmingState[sellingId].rarity - 1];
                    let collectionFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(`${rarityStr}-vault`);
                    let knightApr = (0, UpdateStateAccount_1.calculateKnightApr)(dailyReward, heuristicFarmingVault.farmingState[sellingId].value, totalVaultValue - withdrawValue, collectionFarmingVault.vault.collectionPrice);
                    heuristicFarmingVault.farmingState[sellingId].apr = knightApr;
                }
            }
            if (appState.smartWalletState.travaLPStakingStateList.size == 0) {
                appState = yield (0, staking_1.updateAllAccountVault)(appState, appState.smartWalletState.address);
            }
            appState = yield (0, staking_1.simulateStakingClaimRewards)(appState, (0, utils_1.getAddr)("FARMING_REWARD_VAULT", appState.chainId), appState.smartWalletState.address, heuristicFarmingVault.totalRewardOfUser);
            heuristicFarmingVault.numberKnightOfUser = heuristicFarmingVault.numberKnightOfUser - _ids.length;
            heuristicFarmingVault.totalNFTs = totalNFTs - _ids.length;
            heuristicFarmingVault.aprAvg = (0, UpdateStateAccount_1.calculateVaultApr)(dailyReward, totalNFTs - _ids.length, heuristicFarmingVault.vault.collectionPrice);
            heuristicFarmingVault.totalVaultValue = (0, bignumber_js_1.default)(totalVaultValue).minus(withdrawValue).toNumber();
            heuristicFarmingVault.totalRewardOfUser = "0";
            appState.smartWalletState.NFTFarmingsState.nftFarmings.set(_vaultId, heuristicFarmingVault);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateTravaNFTHeuristicFarmingWithdraw = simulateTravaNFTHeuristicFarmingWithdraw;
function simulateTravaNFTHeuristicFarmingClaim(appState1, _ids, _vaultId) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            let heuristicFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(_vaultId.toLowerCase());
            if (appState.smartWalletState.travaLPStakingStateList.size == 0) {
                appState = yield (0, staking_1.updateAllAccountVault)(appState, appState.smartWalletState.address);
            }
            appState = yield (0, staking_1.simulateStakingClaimRewards)(appState, (0, utils_1.getAddr)("FARMING_REWARD_VAULT", appState.chainId), appState.smartWalletState.address, heuristicFarmingVault.totalRewardOfUser);
            heuristicFarmingVault.totalRewardOfUser = "0";
            appState.smartWalletState.NFTFarmingsState.nftFarmings.set(_vaultId, heuristicFarmingVault);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateTravaNFTHeuristicFarmingClaim = simulateTravaNFTHeuristicFarmingClaim;
function simulateTravaNFTHeuristicFarmingPolish(appState1, _ids, _vaultId) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (!appState.smartWalletState.NFTFarmingsState.isFetch) {
                appState = yield (0, UpdateStateAccount_1.updateFarmingState)(appState);
            }
            let heuristicFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(_vaultId.toLowerCase());
            let dailyReward = heuristicFarmingVault.dailyReward;
            let value = 0;
            for (let sellingId = 0; sellingId < heuristicFarmingVault.farmingState.length; sellingId++) {
                let farmingKnightDetailInfo = heuristicFarmingVault.farmingState[sellingId];
                let newValue = 0;
                if (_ids.includes(farmingKnightDetailInfo.id)) {
                    let oldExp = heuristicFarmingVault.farmingState[sellingId].exp;
                    let newExp = (0, bignumber_js_1.default)(oldExp).plus((0, bignumber_js_1.default)(appState.createdTime).minus(farmingKnightDetailInfo.depositedTime).div(3).toFixed(0));
                    newValue = caculateValue(newExp.toNumber());
                    heuristicFarmingVault.farmingState[sellingId].exp = newExp.toNumber();
                    heuristicFarmingVault.farmingState[sellingId].value = newValue;
                }
                value += newValue;
            }
            for (let sellingId = 0; sellingId < heuristicFarmingVault.farmingState.length; sellingId++) {
                let farmingKnightDetailInfo = heuristicFarmingVault.farmingState[sellingId];
                if (_ids.includes(farmingKnightDetailInfo.id)) {
                    const rarityStr = helpers_1.RarityMapping[heuristicFarmingVault.farmingState[sellingId].rarity - 1];
                    let collectionFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(`${rarityStr}-vault`);
                    let knightApr = (0, UpdateStateAccount_1.calculateKnightApr)(dailyReward, heuristicFarmingVault.farmingState[sellingId].value, value, collectionFarmingVault.vault.collectionPrice);
                    heuristicFarmingVault.farmingState[sellingId].apr = knightApr;
                }
            }
            heuristicFarmingVault.totalVaultValue = value;
            appState.smartWalletState.NFTFarmingsState.nftFarmings.set(_vaultId, heuristicFarmingVault);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateTravaNFTHeuristicFarmingPolish = simulateTravaNFTHeuristicFarmingPolish;
