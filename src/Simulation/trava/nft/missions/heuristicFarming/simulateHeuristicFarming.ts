import BigNumber from "bignumber.js";
import { ApplicationState } from "../../../../../State";
import { NFTNotFoundError } from "../../../../../utils";
import { getMode, isWallet } from "../../../../../utils/helper";
import { EthAddress } from "../../../../../utils/types";
import { FarmingKinghtInfo, FarmingKnightDetailInfo, NormalKnight, RarityMapping } from "../../helpers";
import { updateCollectionBalanceFromContract } from "../../utilities";
import { calculateKnightApr, calculateVaultApr, updateFarmingState } from "./UpdateStateAccount";

export function getNormalKinghtFromFarmingKnight(farmingKnightDetailInfo: FarmingKnightDetailInfo): NormalKnight {
    const armor = farmingKnightDetailInfo.armor;
    const helmet = farmingKnightDetailInfo.helmet;
    const shield = farmingKnightDetailInfo.shield;
    const weapon = farmingKnightDetailInfo.weapon;

    let exp = BigNumber(armor.exp).plus(helmet.exp).plus(shield.exp).plus(weapon.exp);

    const normalKnight: NormalKnight = {
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
    }

    return normalKnight;
}

export async function simulateTravaNFTHeuristicFarmingStake(appState1: ApplicationState, _ids: Array<number>, _vaultId: string, _from: EthAddress) {
    let appState = appState1;
    try {

        if(!appState.smartWalletState.NFTFarmingsState.isFetch) {
            appState = await updateFarmingState(appState);
        }

        let mode = getMode(appState, _from);

        if (!appState[mode].collection.isFetch) {
            appState = await updateCollectionBalanceFromContract(appState, mode);
        }

        let heuristicFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(_vaultId.toLowerCase())!
        let totalNFTs = heuristicFarmingVault.totalNFTs
        let totalVaultValue = heuristicFarmingVault.totalVaultValue
        let dailyReward = heuristicFarmingVault.dailyReward

        let newTotalVaultValue = totalVaultValue + 100 * _ids.length;
        for (let i = 0; i < _ids.length; i++) {
            let currentNFT: NormalKnight | undefined = appState[mode].collection.v1.find((n) => n.id == _ids[i]);
            if (!currentNFT) {
                throw new NFTNotFoundError("Knight is not found!")
            }
            const rarityStr = RarityMapping[currentNFT.rarity - 1];
            let collectionFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(`${rarityStr}-vault`)!

            let kinghtApr = calculateKnightApr(dailyReward, 100, newTotalVaultValue, collectionFarmingVault.vault.collectionPrice);

            let nftInfo: FarmingKinghtInfo = {
                attainedExp: 0,
                depositedTime: 0,
                // lastPolishTime: appState.createdTime,
                id: _ids[i],
                exp: currentNFT.exp,
                earn: 0,
                value: 100
            }

            let farmingKnightDetailInfo: FarmingKnightDetailInfo = {
                ...nftInfo,
                apr: kinghtApr,
                rarity: currentNFT.rarity,
                armor: currentNFT.armor,
                helmet: currentNFT.helmet,
                shield: currentNFT.shield,
                weapon: currentNFT.weapon
            }

            heuristicFarmingVault.farmingState.push(farmingKnightDetailInfo);

            appState[mode].collection.v1 = appState[mode].collection.v1.filter(x => x.id != _ids[i])

        }

        heuristicFarmingVault.numberKnightOfUser = heuristicFarmingVault.numberKnightOfUser + _ids.length;
        heuristicFarmingVault.totalNFTs = totalNFTs + _ids.length
        heuristicFarmingVault.aprAvg = calculateVaultApr(dailyReward, totalNFTs + _ids.length, heuristicFarmingVault.vault.collectionPrice);
        heuristicFarmingVault.totalVaultValue = newTotalVaultValue

        appState.smartWalletState.NFTFarmingsState.nftFarmings.set(
            _vaultId,
            heuristicFarmingVault
        )
    } catch (err) {
        console.log(err);
    }
    return appState;
}

export async function simulateTravaNFTHeuristicFarmingWithdraw(appState1: ApplicationState, _ids: Array<number>, _vaultId: string, _to: EthAddress) {
    let appState = appState1;

    try {
        let heuristicFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(_vaultId.toLowerCase())!
        let totalNFTs = heuristicFarmingVault.totalNFTs
        let totalVaultValue = heuristicFarmingVault.totalVaultValue
        let dailyReward = heuristicFarmingVault.dailyReward

        let withdrawValue = 0;

        for (let _id = 0; _id < _ids.length; _id++) {
            for (let sellingId = 0; sellingId < heuristicFarmingVault.farmingState.length; sellingId++) {
                if (_id == sellingId) {
                    withdrawValue += heuristicFarmingVault.farmingState[sellingId].value
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
                            appState = await updateCollectionBalanceFromContract(appState, toMode);
                        }

                        appState[toMode].collection.v1.push(normalKnight)
                    }

                    sellingId--;
                } else {
                    const rarityStr = RarityMapping[heuristicFarmingVault.farmingState[sellingId].rarity - 1];
                    let collectionFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(`${rarityStr}-vault`)!

                    let knightApr = calculateKnightApr(dailyReward, heuristicFarmingVault.farmingState[sellingId].value, totalVaultValue - withdrawValue, collectionFarmingVault.vault.collectionPrice)
                    heuristicFarmingVault.farmingState[sellingId].apr = knightApr;
                }
            }
        }
        heuristicFarmingVault.numberKnightOfUser = heuristicFarmingVault.numberKnightOfUser - _ids.length;
        heuristicFarmingVault.totalNFTs = totalNFTs - _ids.length
        heuristicFarmingVault.aprAvg = calculateVaultApr(dailyReward, totalNFTs - _ids.length, heuristicFarmingVault.vault.collectionPrice);
        heuristicFarmingVault.totalVaultValue = BigNumber(totalVaultValue).minus(withdrawValue).toNumber();

        appState.smartWalletState.NFTFarmingsState.nftFarmings.set(
            _vaultId,
            heuristicFarmingVault
        )
    } catch (err) {
        console.log(err);
    }
    return appState;
}

export async function simulateTravaNFTHeuristicFarmingClaim(appState1: ApplicationState, _ids: Array<number>, _vaultId: string) {
    let appState = appState1;
    try {

    } catch (err) {
        console.log(err);
    }
    return appState;
}

export async function simulateTravaNFTHeuristicFarmingPolish(appState1: ApplicationState, _ids: Array<number>, _vaultId: string) {
    let appState = appState1;

    try {
        for (let i = 0; i < _ids.length; i++) {

        }
    } catch (err) {
        console.log(err);
    }
    return appState;
}