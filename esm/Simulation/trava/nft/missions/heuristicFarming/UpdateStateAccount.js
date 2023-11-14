var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BASE18, DAY_TO_SECONDS, getAddr } from "../../../../../utils";
import { heuristicFamingConfig } from "./heuristicFarmingConfig";
import NFTFarmingBaseExpABI from "../../../../../abis/NFTFarmingBaseExp.json";
import NFTCollectionABI from "../../../../../abis/NFTCollection.json";
import NFTCoreABI from "../../../../../abis/TravaNFTCore.json";
import { Contract } from "ethers";
import BigNumber from "bignumber.js";
import { multiCall } from "../../../../../utils/helper";
import { RarityMapping } from "../../helpers";
export function updateFarmingState(appState1, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (!appState.smartWalletState.NFTFarmingsState.isFetch || force) {
                let vaults = heuristicFamingConfig[appState.chainId];
                let nftHeuristicFamringAddress = getAddr("NFT_FARMING_BASE_EXP", appState.chainId);
                let nftCollectionAddress = getAddr("NFT_COLLECTION_ADDRESS", appState.chainId);
                let nftCoreAddress = getAddr("NFT_CORE_ADDRESS", appState.chainId);
                let NFTHeuristicContract = new Contract(nftHeuristicFamringAddress, NFTFarmingBaseExpABI, appState.web3);
                let NFTCollectionContract = new Contract(nftCollectionAddress, NFTCollectionABI, appState.web3);
                for (const vaultId in vaults) {
                    if (vaults.hasOwnProperty(vaultId)) {
                        const vault = vaults[vaultId];
                        const [idList, poolInfos, eps] = yield Promise.all([
                            NFTHeuristicContract.getStakingNFTinALevel(appState.smartWalletState.address, vault.level),
                            NFTHeuristicContract.poolInfos(vault.level),
                            NFTHeuristicContract.getEmissionPerSecond(vault.level),
                        ]);
                        const dailyReward = BigNumber(eps)
                            .multipliedBy(DAY_TO_SECONDS)
                            .dividedBy(BASE18)
                            .toNumber();
                        const numberKnightOfUser = idList.length;
                        const totalNFTs = poolInfos.nftCount;
                        const totalVaultValue = Number(poolInfos.totalValue);
                        const idList1 = [];
                        for (let i = 0; i < idList.length; i++) {
                            idList1.push(idList[i].toString());
                        }
                        const totalRewardOfUser = yield NFTHeuristicContract.getTotalRewardsBalance(idList1);
                        const [nftInformation, expEarned, exp, balance] = yield Promise.all([
                            multiCall(NFTFarmingBaseExpABI, idList.map((id, _) => ({
                                address: nftHeuristicFamringAddress,
                                name: "nftInfos",
                                params: [id],
                            })), appState.web3, appState.chainId),
                            multiCall(NFTFarmingBaseExpABI, idList.map((id, _) => ({
                                address: nftHeuristicFamringAddress,
                                name: "getExpEarnedAndValueEarned",
                                params: [id],
                            })), appState.web3, appState.chainId),
                            multiCall(NFTCollectionABI, idList.map((id, _) => ({
                                address: nftCollectionAddress,
                                name: "getCollectionExperience",
                                params: [id],
                            })), appState.web3, appState.chainId),
                            multiCall(NFTFarmingBaseExpABI, idList.map((id, _) => ({
                                address: nftHeuristicFamringAddress,
                                name: "getTotalRewardsBalance",
                                params: [[id]],
                            })), appState.web3, appState.chainId),
                        ]);
                        const nftInfos = new Array();
                        nftInformation.forEach((data, index) => {
                            nftInfos.push({
                                attainedExp: parseInt(exp[index][0]),
                                depositedTime: parseInt(data["depositTime"]) * 1000,
                                id: Number(idList[index]),
                                exp: Number(expEarned[index][0]),
                                earn: BigNumber(balance[index]).dividedBy(BASE18).toNumber(),
                                value: Number(expEarned[index][1]),
                            });
                        });
                        const collectionMetadataArray = yield Promise.all(idList1.map((id, index) => __awaiter(this, void 0, void 0, function* () {
                            const collectionMetadata = yield NFTCollectionContract.getCollectionMetadata(id);
                            const itemIdList = [
                                collectionMetadata[0][0],
                                collectionMetadata[0][1],
                                collectionMetadata[0][2],
                                collectionMetadata[0][3],
                            ];
                            const [itemsMetadata] = yield Promise.all([
                                multiCall(NFTCoreABI, itemIdList.map((tokenId, _) => ({
                                    address: nftCoreAddress,
                                    name: "getTokenMetadata",
                                    params: [tokenId],
                                })), appState.web3, appState.chainId),
                            ]);
                            let armorMetadata = itemsMetadata[0];
                            let helmetMetadata = itemsMetadata[1];
                            let shieldMetadata = itemsMetadata[2];
                            let weaponMetadata = itemsMetadata[3];
                            const rarityStr = RarityMapping[parseInt(collectionMetadata[1]) - 1];
                            const price = vaults[`${rarityStr}-vault`].collectionPrice;
                            return {
                                armorMetadata,
                                helmetMetadata,
                                shieldMetadata,
                                weaponMetadata,
                                collectionMetadata,
                                apr: calculateKnightApr(dailyReward, nftInformation[index]["value"], totalVaultValue, price),
                            };
                        })));
                        const farmingKnightDetailInfos = new Array();
                        for (let i = 0; i < nftInfos.length; i++) {
                            let farmingKnightDetailInfo = Object.assign(Object.assign({}, nftInfos[i]), { apr: collectionMetadataArray[i].apr, rarity: collectionMetadataArray[i].collectionMetadata.rarity, armor: {
                                    tokenId: collectionMetadataArray[i].collectionMetadata.armorTokenId,
                                    rarity: parseInt(collectionMetadataArray[i].armorMetadata[0].tokenRarity),
                                    exp: parseInt(collectionMetadataArray[i].armorMetadata[0].experiencePoint),
                                }, helmet: {
                                    tokenId: collectionMetadataArray[i].collectionMetadata.helmetTokenId,
                                    rarity: parseInt(collectionMetadataArray[i].helmetMetadata[0].tokenRarity),
                                    exp: parseInt(collectionMetadataArray[i].helmetMetadata[0].experiencePoint),
                                }, shield: {
                                    tokenId: collectionMetadataArray[i].collectionMetadata.shieldTokenId,
                                    rarity: parseInt(collectionMetadataArray[i].shieldMetadata[0].tokenRarity),
                                    exp: parseInt(collectionMetadataArray[i].shieldMetadata[0].experiencePoint),
                                }, weapon: {
                                    tokenId: collectionMetadataArray[i].collectionMetadata.weaponTokenId,
                                    rarity: parseInt(collectionMetadataArray[i].weaponMetadata[0].tokenRarity),
                                    exp: parseInt(collectionMetadataArray[i].weaponMetadata[0].experiencePoint),
                                } });
                            farmingKnightDetailInfos.push(farmingKnightDetailInfo);
                        }
                        const nftFarming = {
                            vault: vault,
                            aprAvg: calculateVaultApr(dailyReward, Number(totalNFTs), vault.collectionPrice),
                            numberKnightOfUser: Number(numberKnightOfUser),
                            totalNFTs: Number(totalNFTs),
                            totalRewardOfUser: String(totalRewardOfUser),
                            totalVaultValue: totalVaultValue,
                            dailyReward: dailyReward,
                            farmingState: farmingKnightDetailInfos
                        };
                        appState.smartWalletState.NFTFarmingsState.nftFarmings.set(vaultId, nftFarming);
                    }
                }
                appState.smartWalletState.NFTFarmingsState.isFetch = true;
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function calculateKnightApr(dailyReward, collectionVaultValue, totalVaultValue, collectionPrice) {
    return ((((BigNumber(dailyReward).multipliedBy(collectionVaultValue)).div(totalVaultValue)).multipliedBy(365)).div(collectionPrice)).multipliedBy(100).toNumber();
}
export function calculateVaultApr(dailyReward, totalNFTs, collectionPrice) {
    return (((BigNumber(dailyReward).multipliedBy(365)).div(totalNFTs).div(collectionPrice)).multipliedBy(100)).toNumber();
}
