import BigNumber from "bignumber.js";
import { ApplicationState } from "../../../../../State";
import { NFTNotFoundError } from "../../../../../utils";
import { getMode } from "../../../../../utils/helper";
import { EthAddress } from "../../../../../utils/types";
import { FarmingKinghtInfo, FarmingKnightDetailInfo, NormalKnight, RarityMapping } from "../../helpers";
import { updateCollectionBalanceFromContract } from "../../utilities";
import { calculateKnightApr, calculateVaultApr } from "./UpdateStateAccount";

export async function simulateTravaNFTHeuristicFarmingStake(appState1: ApplicationState, _ids: Array<number>, _vaultId: string, _from: EthAddress) {
    let appState = appState1;
    try {
        let mode = getMode(appState, _from);

        if (!appState[mode].collection.isFetch) {
            appState = await updateCollectionBalanceFromContract(appState, mode);
        }

        let heuristicFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(_vaultId.toLowerCase())!
        let totalNFTs = heuristicFarmingVault.totalNFTs
        let totalVaultValue = heuristicFarmingVault.totalVaultValue
        let dailyReward = heuristicFarmingVault.dailyReward
        
        let newTotalVaultValue = totalVaultValue + 100 * _ids.length;
        for(let i = 0; i < _ids.length; i++) {
            let currentNFT: NormalKnight | undefined = appState[mode].collection.v1.find((n) => n.id == _ids[i]);
            if(!currentNFT) {
                throw new NFTNotFoundError("Knight is not found!")
            }
            const rarityStr = RarityMapping[currentNFT.rarity - 1];
            let collectionFarmingVault = appState.smartWalletState.NFTFarmingsState.nftFarmings.get(`${rarityStr}-vault`)!
            
            let kinghtApr = calculateKnightApr(dailyReward, 100, newTotalVaultValue, collectionFarmingVault.vault.collectionPrice);
            
            let nftInfo: FarmingKinghtInfo = {
                attainedExp: 0,
                depositedTime: 0,
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
    } catch(err) {
        console.log(err);
    }
    return appState;
}

export async function simulateTravaNFTHeuristicFarmingWithdraw(appState1: ApplicationState, _ids: Array<number>, _level: number, _to: EthAddress) {
    let appState = appState1;

    try {

    } catch(err) {
        console.log(err);
    }
    return appState;
}

export async function simulateTravaNFTHeuristicFarmingClaim(appState1: ApplicationState, _ids: Array<number>, _level: number) {
    let appState = appState1;

    try {

    } catch(err) {
        console.log(err);
    }
    return appState;
}

export async function simulateTravaNFTHeuristicFarmingPolish(appState1: ApplicationState, _ids: Array<number>, _level: number) {
    let appState = appState1;

    try {

    } catch(err) {
        console.log(err);
    }
    return appState;
}