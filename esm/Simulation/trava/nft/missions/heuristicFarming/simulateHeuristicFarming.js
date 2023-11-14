var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import BigNumber from "bignumber.js";
import { NFTNotFoundError } from "../../../../../utils";
import { getMode, isWallet } from "../../../../../utils/helper";
import { RarityMapping } from "../../helpers";
import { updateCollectionBalanceFromContract } from "../../utilities";
import { calculateKnightApr, calculateVaultApr, updateFarmingState } from "./UpdateStateAccount";
export function getNormalKinghtFromFarmingKnight(farmingKnightDetailInfo) {
    const armor = farmingKnightDetailInfo.armor;
    const helmet = farmingKnightDetailInfo.helmet;
    const shield = farmingKnightDetailInfo.shield;
    const weapon = farmingKnightDetailInfo.weapon;
    let exp = BigNumber(armor.exp).plus(helmet.exp).plus(shield.exp).plus(weapon.exp);
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
export function simulateTravaNFTHeuristicFarmingStake(appState1, _ids, _vaultId, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (!appState.smartWalletState.NFTFarmingsState.isFetch) {
                appState = yield updateFarmingState(appState);
            }
            let mode = getMode(appState, _from);
            if (!appState[mode].collection.isFetch) {
                appState = yield updateCollectionBalanceFromContract(appState, mode);
            }
            let heuristicFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(_vaultId.toLowerCase());
            let totalNFTs = heuristicFarmingVault.totalNFTs;
            let totalVaultValue = heuristicFarmingVault.totalVaultValue;
            let dailyReward = heuristicFarmingVault.dailyReward;
            let newTotalVaultValue = totalVaultValue + 100 * _ids.length;
            for (let i = 0; i < _ids.length; i++) {
                let currentNFT = appState[mode].collection.v1.find((n) => n.id == _ids[i]);
                if (!currentNFT) {
                    throw new NFTNotFoundError("Knight is not found!");
                }
                const rarityStr = RarityMapping[currentNFT.rarity - 1];
                let collectionFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(`${rarityStr}-vault`);
                let kinghtApr = calculateKnightApr(dailyReward, 100, newTotalVaultValue, collectionFarmingVault.vault.collectionPrice);
                let nftInfo = {
                    attainedExp: 0,
                    depositedTime: 0,
                    // lastPolishTime: appState.createdTime,
                    id: _ids[i],
                    exp: currentNFT.exp,
                    earn: 0,
                    value: 100
                };
                let farmingKnightDetailInfo = Object.assign(Object.assign({}, nftInfo), { apr: kinghtApr, rarity: currentNFT.rarity, armor: currentNFT.armor, helmet: currentNFT.helmet, shield: currentNFT.shield, weapon: currentNFT.weapon });
                heuristicFarmingVault.farmingState.push(farmingKnightDetailInfo);
                appState[mode].collection.v1 = appState[mode].collection.v1.filter(x => x.id != _ids[i]);
            }
            heuristicFarmingVault.numberKnightOfUser = heuristicFarmingVault.numberKnightOfUser + _ids.length;
            heuristicFarmingVault.totalNFTs = totalNFTs + _ids.length;
            heuristicFarmingVault.aprAvg = calculateVaultApr(dailyReward, totalNFTs + _ids.length, heuristicFarmingVault.vault.collectionPrice);
            heuristicFarmingVault.totalVaultValue = newTotalVaultValue;
            appState.smartWalletState.NFTFarmingsState.nftFarmings.set(_vaultId, heuristicFarmingVault);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function simulateTravaNFTHeuristicFarmingWithdraw(appState1, _ids, _vaultId, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            let heuristicFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(_vaultId.toLowerCase());
            let totalNFTs = heuristicFarmingVault.totalNFTs;
            let totalVaultValue = heuristicFarmingVault.totalVaultValue;
            let dailyReward = heuristicFarmingVault.dailyReward;
            let withdrawValue = 0;
            for (let _id = 0; _id < _ids.length; _id++) {
                for (let sellingId = 0; sellingId < heuristicFarmingVault.farmingState.length; sellingId++) {
                    if (_id == sellingId) {
                        withdrawValue += heuristicFarmingVault.farmingState[sellingId].value;
                    }
                }
            }
            for (let _id = 0; _id < _ids.length; _id++) {
                for (let sellingId = 0; sellingId < heuristicFarmingVault.farmingState.length; sellingId++) {
                    if (_id == sellingId) {
                        heuristicFarmingVault.farmingState = heuristicFarmingVault.farmingState.filter(n => n.id != sellingId);
                        if (isWallet(appState, _to)) {
                            let toMode = getMode(appState, _to);
                            let normalKnight = getNormalKinghtFromFarmingKnight(heuristicFarmingVault.farmingState[sellingId]);
                            if (!appState[toMode].collection.isFetch) {
                                appState = yield updateCollectionBalanceFromContract(appState, toMode);
                            }
                            appState[toMode].collection.v1.push(normalKnight);
                        }
                        sellingId--;
                    }
                    else {
                        const rarityStr = RarityMapping[heuristicFarmingVault.farmingState[sellingId].rarity - 1];
                        let collectionFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(`${rarityStr}-vault`);
                        let knightApr = calculateKnightApr(dailyReward, heuristicFarmingVault.farmingState[sellingId].value, totalVaultValue - withdrawValue, collectionFarmingVault.vault.collectionPrice);
                        heuristicFarmingVault.farmingState[sellingId].apr = knightApr;
                    }
                }
            }
            heuristicFarmingVault.numberKnightOfUser = heuristicFarmingVault.numberKnightOfUser - _ids.length;
            heuristicFarmingVault.totalNFTs = totalNFTs - _ids.length;
            heuristicFarmingVault.aprAvg = calculateVaultApr(dailyReward, totalNFTs - _ids.length, heuristicFarmingVault.vault.collectionPrice);
            heuristicFarmingVault.totalVaultValue = BigNumber(totalVaultValue).minus(withdrawValue).toNumber();
            appState.smartWalletState.NFTFarmingsState.nftFarmings.set(_vaultId, heuristicFarmingVault);
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function simulateTravaNFTHeuristicFarmingClaim(appState1, _ids, _vaultId) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function simulateTravaNFTHeuristicFarmingPolish(appState1, _ids, _vaultId) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            for (let i = 0; i < _ids.length; i++) {
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
