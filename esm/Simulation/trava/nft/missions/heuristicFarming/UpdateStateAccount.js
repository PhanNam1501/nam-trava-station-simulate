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
exports.calculateVaultApr = exports.calculateKnightApr = exports.updateFarmingState = void 0;
const utils_1 = require("../../../../../utils");
const heuristicFarmingConfig_1 = require("./heuristicFarmingConfig");
const NFTFarmingBaseExp_json_1 = __importDefault(require("../../../../../abis/NFTFarmingBaseExp.json"));
const NFTCollection_json_1 = __importDefault(require("../../../../../abis/NFTCollection.json"));
const TravaNFTCore_json_1 = __importDefault(require("../../../../../abis/TravaNFTCore.json"));
const ethers_1 = require("ethers");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const helper_1 = require("../../../../../utils/helper");
const helpers_1 = require("../../helpers");
function updateFarmingState(appState1, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
            if (!appState.smartWalletState.NFTFarmingsState.isFetch || force) {
                let vaults = heuristicFarmingConfig_1.heuristicFamingConfig[appState.chainId];
                let nftHeuristicFamringAddress = (0, utils_1.getAddr)("NFT_FARMING_BASE_EXP", appState.chainId);
                let nftCollectionAddress = (0, utils_1.getAddr)("NFT_COLLECTION_ADDRESS", appState.chainId);
                let nftCoreAddress = (0, utils_1.getAddr)("NFT_CORE_ADDRESS", appState.chainId);
                let NFTHeuristicContract = new ethers_1.Contract(nftHeuristicFamringAddress, NFTFarmingBaseExp_json_1.default, appState.web3);
                let NFTCollectionContract = new ethers_1.Contract(nftCollectionAddress, NFTCollection_json_1.default, appState.web3);
                for (const vaultId in vaults) {
                    if (vaults.hasOwnProperty(vaultId)) {
                        const vault = vaults[vaultId];
                        const [idList, poolInfos, eps] = yield Promise.all([
                            NFTHeuristicContract.getStakingNFTinALevel(appState.smartWalletState.address, vault.level),
                            NFTHeuristicContract.poolInfos(vault.level),
                            NFTHeuristicContract.getEmissionPerSecond(vault.level),
                        ]);
                        const dailyReward = (0, bignumber_js_1.default)(eps)
                            .multipliedBy(utils_1.DAY_TO_SECONDS)
                            .dividedBy(utils_1.BASE18)
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
                            (0, helper_1.multiCall)(NFTFarmingBaseExp_json_1.default, idList.map((id, _) => ({
                                address: nftHeuristicFamringAddress,
                                name: "nftInfos",
                                params: [id],
                            })), appState.web3, appState.chainId),
                            (0, helper_1.multiCall)(NFTFarmingBaseExp_json_1.default, idList.map((id, _) => ({
                                address: nftHeuristicFamringAddress,
                                name: "getExpEarnedAndValueEarned",
                                params: [id],
                            })), appState.web3, appState.chainId),
                            (0, helper_1.multiCall)(NFTCollection_json_1.default, idList.map((id, _) => ({
                                address: nftCollectionAddress,
                                name: "getCollectionExperience",
                                params: [id],
                            })), appState.web3, appState.chainId),
                            (0, helper_1.multiCall)(NFTFarmingBaseExp_json_1.default, idList.map((id, _) => ({
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
                                lastPolishTime: parseInt(data["lastPolishTime"]) * 1000,
                                id: Number(idList[index]),
                                exp: Number(expEarned[index][0]),
                                earn: (0, bignumber_js_1.default)(balance[index]).dividedBy(utils_1.BASE18).toNumber(),
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
                                (0, helper_1.multiCall)(TravaNFTCore_json_1.default, itemIdList.map((tokenId, _) => ({
                                    address: nftCoreAddress,
                                    name: "getTokenMetadata",
                                    params: [tokenId],
                                })), appState.web3, appState.chainId),
                            ]);
                            let armorMetadata = itemsMetadata[0];
                            let helmetMetadata = itemsMetadata[1];
                            let shieldMetadata = itemsMetadata[2];
                            let weaponMetadata = itemsMetadata[3];
                            const rarityStr = helpers_1.RarityMapping[parseInt(collectionMetadata[1]) - 1];
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
exports.updateFarmingState = updateFarmingState;
function calculateKnightApr(dailyReward, collectionVaultValue, totalVaultValue, collectionPrice) {
    return (((((0, bignumber_js_1.default)(dailyReward).multipliedBy(collectionVaultValue)).div(totalVaultValue)).multipliedBy(365)).div(collectionPrice)).multipliedBy(100).toNumber();
}
exports.calculateKnightApr = calculateKnightApr;
function calculateVaultApr(dailyReward, totalNFTs, collectionPrice) {
    return ((((0, bignumber_js_1.default)(dailyReward).multipliedBy(365)).div(totalNFTs).div(collectionPrice)).multipliedBy(100)).toNumber();
}
exports.calculateVaultApr = calculateVaultApr;
