import { ApplicationState } from "../../../../State/ApplicationState";
import TravaNFTCoreABI from "../../../../abis/TravaNFTCore.json";
import NFTCollectionABI from "../../../../abis/NFTCollection.json";
import TravaNFTSellABI from "../../../../abis/TravaNFTSell.json";
import { getAddr } from "../../../../utils/address";
import _ from "lodash";
import { CollectionArmoury, NormalKnight, SellingArmouryType, SpecialKnight } from "./global";
import { CollectionName, RarityMapping, TypeMapping } from "./KnightConfig";
import BigNumber from "bignumber.js";
import { NFTSellingState } from "../../../../State/TravaNFTState";
import { multiCall } from "../../../../utils/helper";

export async function fetchNormalItems(
    armorTokenIds: Array<string>,
    helmetTokenIds: Array<string>,
    shieldTokenIds: Array<string>,
    weaponTokenIds: Array<string>,
    appState: ApplicationState
): Promise<{
    armor: CollectionArmoury;
    helmet: CollectionArmoury;
    shield: CollectionArmoury;
    weapon: CollectionArmoury;
}[]> {
    let [armorTokensMetadata, helmetTokensMetadata, shieldTokensMetadata, weaponTokensMetadata] =
        await Promise.all([
            multiCall(
                TravaNFTCoreABI,
                armorTokenIds.map((tokenId) => ({
                    address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                    name: 'getTokenMetadata',
                    params: [tokenId],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                TravaNFTCoreABI,
                helmetTokenIds.map((tokenId) => ({
                    address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                    name: 'getTokenMetadata',
                    params: [tokenId],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                TravaNFTCoreABI,
                shieldTokenIds.map((tokenId) => ({
                    address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                    name: 'getTokenMetadata',
                    params: [tokenId],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                TravaNFTCoreABI,
                weaponTokenIds.map((tokenId) => ({
                    address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                    name: 'getTokenMetadata',
                    params: [tokenId],
                })),
                appState.web3,
                appState.chainId
            ),
        ]);
    armorTokensMetadata = armorTokensMetadata.flat();
    helmetTokensMetadata = helmetTokensMetadata.flat();
    shieldTokensMetadata = shieldTokensMetadata.flat();
    weaponTokensMetadata = weaponTokensMetadata.flat();
    const collections = [] as Array<{
        armor: CollectionArmoury;
        helmet: CollectionArmoury;
        shield: CollectionArmoury;
        weapon: CollectionArmoury;
    }>;
    for (let i = 0; i < armorTokenIds.length; i++) {
        collections[i] = {
            armor: {
                tokenId: parseInt(armorTokenIds[i]),
                rarity: parseInt(armorTokensMetadata[i].tokenRarity),
                exp: parseInt(armorTokensMetadata[i].experiencePoint),
            },
            helmet: {
                tokenId: parseInt(helmetTokenIds[i]),
                rarity: parseInt(helmetTokensMetadata[i].tokenRarity),
                exp: parseInt(helmetTokensMetadata[i].experiencePoint),
            },
            shield: {
                tokenId: parseInt(shieldTokenIds[i]),
                rarity: parseInt(shieldTokensMetadata[i].tokenRarity),
                exp: parseInt(shieldTokensMetadata[i].experiencePoint),
            },
            weapon: {
                tokenId: parseInt(weaponTokenIds[i]),
                rarity: parseInt(weaponTokensMetadata[i].tokenRarity),
                exp: parseInt(weaponTokensMetadata[i].experiencePoint),
            },
        };
    }
    return collections;
};

export async function fetchBasicCollections(collectionIds: Array<string>, appState: ApplicationState): Promise<{
    normalCollections: Array<NormalKnight>;
    specialCollections: Array<SpecialKnight>;
}> {
    const [collectionSetIds, collectionsMetadata, collectionsExp] = await Promise.all([
        multiCall(
            NFTCollectionABI,
            collectionIds.map((collectionId) => ({
                address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'getCollectionSetId',
                params: [collectionId],
            })),
            appState.web3,
            appState.chainId
        ),
        multiCall(
            NFTCollectionABI,
            collectionIds.map((collectionId) => ({
                address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'getCollectionMetadata',
                params: [collectionId],
            })),
            appState.web3,
            appState.chainId
        ),
        multiCall(
            NFTCollectionABI,
            collectionIds.map((collectionId) => ({
                address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'getCollectionExperience',
                params: [collectionId],
            })),
            appState.web3,
            appState.chainId
        ),
    ]);
    const _collectionsExp = collectionsExp.flat();
    const _collectionsMetadata = collectionsMetadata
        .map(([components, tokenRarity]: any, index: number) => ({
            armorTokenId: parseInt(components.armorTokenId),
            helmetTokenId: parseInt(components.helmetTokenId),
            shieldTokenId: parseInt(components.shieldTokenId),
            weaponTokenId: parseInt(components.swordTokenId),
            rarity: parseInt(tokenRarity),
            id: parseInt(collectionIds[index]),
            setId: parseInt(collectionSetIds[index]),
            exp: parseInt(_collectionsExp[index]),
        }))
        .filter((item: any) => item.rarity >= 1);
    const normalCollections = _collectionsMetadata.filter((item: any) => item.rarity <= 5);
    let specialCollections = _collectionsMetadata.filter((item: any) => item.rarity > 5);

    // fetch special collections metadata
    let [tokenURIList] = await Promise.all([
        multiCall(
            NFTCollectionABI,
            specialCollections.map((item: any) => ({
                address: getAddr("NFT_COLLECTION_ADDRESS", appState.chainId),
                name: 'tokenURI',
                params: [item.id],
            })),
            appState.web3,
            appState.chainId
        ),
    ]);
    tokenURIList = tokenURIList.flat();
    specialCollections = specialCollections.map((item: any, index: number) => ({
        ...item,
        metadataLink: tokenURIList[index],
    }));
    return { normalCollections, specialCollections } as {
        normalCollections: Array<NormalKnight>;
        specialCollections: Array<SpecialKnight>;
    };
};

// Fetch tất cả nft đang bán trên chợ
export async function _fetchNormal(
    appState: ApplicationState,
    tokenIds: any
): Promise<NFTSellingState> {
    let [tokenOrders, tokenMetadata] = await Promise.all([
        multiCall(
            TravaNFTSellABI,
            tokenIds.map((tokenId: any) => ({
                address: getAddr("NFT_SELL_ADDRESS", appState.chainId),
                name: "getTokenOrder",
                params: [tokenId],
            })),
            appState.web3,
            appState.chainId
        ),
        multiCall(
            TravaNFTCoreABI,
            tokenIds.map((tokenId: any) => ({
                address: getAddr("NFT_CORE_ADDRESS", appState.chainId),
                name: "getTokenMetadata",
                params: [tokenId],
            })),
            appState.web3,
            appState.chainId
        ),
    ]);
    tokenOrders = tokenOrders.flat();
    tokenMetadata = tokenMetadata.flat();
    let v1 = [] as Array<SellingArmouryType>;
    let v2 = [] as Array<SellingArmouryType>;
    let counter = 0;
    for (const tokenData of tokenMetadata) {
        const collectionId = parseInt(tokenData.collectionId);
        const collectionName = CollectionName[collectionId - 1];
        const rarity = parseInt(tokenData.tokenRarity);
        if (rarity >= 1 && collectionName) {
            const type = parseInt(tokenData.tokenType);
            const tType = TypeMapping[type - 1];
            const tRarity = RarityMapping[rarity - 1];
            const id = parseInt(tokenIds[counter]);
            const exp = parseInt(tokenData.experiencePoint);
            const price = BigNumber(tokenOrders[counter].price).toFixed(0);
            const seller = tokenOrders[counter].nftSeller;
            const data: SellingArmouryType = {
                id,
                collectionName,
                collectionId,
                nRarity: rarity,
                nType: type,
                rarity: tRarity,
                type: tType,
                exp,
                price,
                seller,
            };
            if (collectionId == 1) v1.push(data);
            else if (collectionId == 2) v2.push(data);
        }
        counter++;
    }
    v1 = v1.sort(armourySort);
    v2 = v2.sort(armourySort);
    return { v1, v2 } as NFTSellingState;
}

export function armourySort(item1: SellingArmouryType, item2: SellingArmouryType) {
    return item2.nRarity - item1.nRarity || item2.exp - item1.exp || item1.nType - item2.nType;
}

export function collectionSort(item1: NormalKnight, item2: NormalKnight) {
    if (item1.rarity < item2.rarity) return 1;
    else return -1;
}

export function shuffleArray(array: any) {
    const n = array.length;
    for (let i = n - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}