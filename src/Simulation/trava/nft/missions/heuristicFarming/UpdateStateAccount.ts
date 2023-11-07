import { ApplicationState } from "../../../../../State";
import { BASE18, DAY_TO_SECONDS, TravaNFTApiQuery, getAddr } from "../../../../../utils";
import { heuristicFamingConfig } from "./heuristicFarmingConfig";
import NFTFarmingBaseExpABI from "../../../../../abis/NFTFarmingBaseExp.json";
import NFTCollectionABI from "../../../../../abis/NFTCollection.json";
import NFTCoreABI from "../../../../../abis/TravaNFTCore.json";

import { Contract } from "ethers";
import BigNumber from "bignumber.js";
import { multiCall } from "../../../../../utils/helper";
import { FarmingKinghtInfo, FarmingKnightDetailInfo, NFTFarming, RarityMapping } from "../../helpers";

export async function updateFarmingState(appState1: ApplicationState, force = false) {
    let appState = appState1;
    try {
        if (!appState.smartWalletState.NFTFarmingsState.isFetch || force) {
            let vaults = heuristicFamingConfig[appState.chainId];
            let nftHeuristicFamringAddress = getAddr("NFT_FARMING_BASE_EXP", appState.chainId);
            let nftCollectionAddress = getAddr("NFT_COLLECTION_ADDRESS", appState.chainId);
            let nftCoreAddress = getAddr("NFT_CORE_ADDRESS", appState.chainId);

            let NFTHeuristicContract = new Contract(
                nftHeuristicFamringAddress,
                NFTFarmingBaseExpABI,
                appState.web3
            )

            let NFTCollectionContract = new Contract(
                nftCollectionAddress,
                NFTCollectionABI,
                appState.web3
            )

            for (const vaultId in vaults) {
                if (vaults.hasOwnProperty(vaultId)) {
                    const vault = vaults[vaultId];
                    const [idList, poolInfos, eps] = await Promise.all([
                        NFTHeuristicContract.getStakingNFTinALevel(appState.smartWalletState.address, vault.level),
                        NFTHeuristicContract.poolInfos(vault.level),
                        NFTHeuristicContract.getEmissionPerSecond(vault.level),
                    ]);

                    const dailyReward = BigNumber(eps)
                        .multipliedBy(DAY_TO_SECONDS)
                        .dividedBy(BASE18)
                        .toNumber()

                    const numberKnightOfUser = idList.length;
                    const totalNFTs = poolInfos.nftCount;
                    const totalVaultValue = Number(poolInfos.totalValue);
                    const totalRewardOfUser = await NFTHeuristicContract.getTotalRewardsBalance(idList);

                    const [nftInformation, expEarned, exp, balance] = await Promise.all([
                        multiCall(
                            NFTFarmingBaseExpABI,
                            idList.map((id: any, _: number) => ({
                                address: nftHeuristicFamringAddress,
                                name: "nftInfos",
                                params: [id],
                            })),
                            appState.web3,
                            appState.chainId
                        ),
                        multiCall(
                            NFTFarmingBaseExpABI,
                            idList.map((id: any, _: number) => ({
                                address: nftHeuristicFamringAddress,
                                name: "getExpEarnedAndValueEarned",
                                params: [id],
                            })),
                            appState.web3,
                            appState.chainId
                        ),
                        multiCall(
                            NFTCollectionABI,
                            idList.map((id: any, _: number) => ({
                                address: nftCollectionAddress,
                                name: "getCollectionExperience",
                                params: [id],
                            })),
                            appState.web3,
                            appState.chainId
                        ),
                        multiCall(
                            NFTFarmingBaseExpABI,
                            idList.map((id: any, _: number) => ({
                                address: nftHeuristicFamringAddress,
                                name: "getTotalRewardsBalance",
                                params: [[id]],
                            })),
                            appState.web3,
                            appState.chainId
                        ),
                    ]);
                    const nftInfos: Array<FarmingKinghtInfo> = new Array();
                    nftInformation.forEach((data: any, index: number) => {
                        nftInfos.push({
                            attainedExp: parseInt(exp[index][0]),
                            depositedTime: parseInt(data["depositTime"]) * 1000,
                            id: Number(idList[index]),
                            exp: Number(expEarned[index][0]),
                            earn: BigNumber(balance[index]).dividedBy(BASE18).toNumber(),
                            value: Number(expEarned[index][1]),
                        });
                    });
                    const collectionMetadataArray = await Promise.all(
                        idList.map(async (id: any, index: number) => {
                            const collectionMetadata = await NFTCollectionContract.getCollectionMetadata(id);
                            const itemIdList = [
                                collectionMetadata.armorTokenId,
                                collectionMetadata.helmetTokenId,
                                collectionMetadata.shieldTokenId,
                                collectionMetadata.weaponTokenId,
                            ];
                            const [itemsMetadata] = await Promise.all([
                                multiCall(
                                    NFTCoreABI,
                                    itemIdList.map((tokenId: any, _: number) => ({
                                        address: nftCoreAddress,
                                        name: "getTokenMetadata",
                                        params: [tokenId],
                                    })),
                                    appState.web3,
                                    appState.chainId
                                ),
                            ]);
                            let armorMetadata = itemsMetadata[0];
                            let helmetMetadata = itemsMetadata[1];
                            let shieldMetadata = itemsMetadata[2];
                            let weaponMetadata = itemsMetadata[3];
                            const rarityStr = RarityMapping[collectionMetadata.rarity - 1];
                            const price = vaults[`${rarityStr}-vault`].collectionPrice;
                            return {
                                armorMetadata,
                                helmetMetadata,
                                shieldMetadata,
                                weaponMetadata,
                                collectionMetadata,
                                apr: calculateKnightApr(dailyReward, nftInformation[index]["value"], totalVaultValue, price),
                            };
                        })
                    );

                    const farmingKnightDetailInfos: Array<FarmingKnightDetailInfo> = new Array();

                    for (let i = 0; i < nftInfos.length; i++) {
                        let farmingKnightDetailInfo: FarmingKnightDetailInfo = {
                            ...nftInfos[i],
                            apr: collectionMetadataArray[i].apr,
                            rarity: collectionMetadataArray[i].collectionMetadata.rarity,
                            armor: {
                                tokenId: collectionMetadataArray[i].collectionMetadata.armorTokenId,
                                rarity: parseInt(collectionMetadataArray[i].armorMetadata[0].tokenRarity),
                                exp: parseInt(collectionMetadataArray[i].armorMetadata[0].experiencePoint),
                            },
                            helmet: {
                                tokenId: collectionMetadataArray[i].collectionMetadata.helmetTokenId,
                                rarity: parseInt(collectionMetadataArray[i].helmetMetadata[0].tokenRarity),
                                exp: parseInt(collectionMetadataArray[i].helmetMetadata[0].experiencePoint),
                            },
                            shield: {
                                tokenId: collectionMetadataArray[i].collectionMetadata.shieldTokenId,
                                rarity: parseInt(collectionMetadataArray[i].shieldMetadata[0].tokenRarity),
                                exp: parseInt(collectionMetadataArray[i].shieldMetadata[0].experiencePoint),
                            },
                            weapon: {
                                tokenId: collectionMetadataArray[i].collectionMetadata.weaponTokenId,
                                rarity: parseInt(collectionMetadataArray[i].weaponMetadata[0].tokenRarity),
                                exp: parseInt(collectionMetadataArray[i].weaponMetadata[0].experiencePoint),
                            }
                        }

                        farmingKnightDetailInfos.push(farmingKnightDetailInfo);
                    }
                    const nftFarming: NFTFarming = {
                        vault: vault,
                        aprAvg: calculateVaultApr(dailyReward, Number(totalNFTs), vault.collectionPrice),
                        numberKnightOfUser: Number(numberKnightOfUser),
                        totalNFTs: Number(totalNFTs),
                        totalRewardOfUser: String(totalRewardOfUser),
                        totalVaultValue: totalVaultValue,
                        dailyReward: dailyReward,
                        farmingState: farmingKnightDetailInfos
                    }

                    appState.smartWalletState.NFTFarmingsState.nftFarmings.set(vaultId, nftFarming);
                }

            }

            appState.smartWalletState.NFTFarmingsState.isFetch = true
        }
    } catch (err) {
        console.log(err);
    }
    return appState;
}

export function calculateKnightApr(dailyReward: number,  collectionVaultValue: number, totalVaultValue: number, collectionPrice: number): number {
    return ((((BigNumber(dailyReward).multipliedBy(collectionVaultValue)).div(totalVaultValue)).multipliedBy(365)).div(collectionPrice)).multipliedBy(100).toNumber()
}

export function calculateVaultApr(dailyReward: number, totalNFTs: number, collectionPrice: number): number {
    return (((BigNumber(dailyReward).multipliedBy(365)).div(totalNFTs).div(collectionPrice)).multipliedBy(100)).toNumber();
}