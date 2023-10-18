import BigNumber from 'bignumber.js';
import { CollectionName, RarityMapping, TypeMapping } from './KnightConfig';
import { CollectionOwnedMarketplaceType, NFTMarketplaceType, SellingArmouryType } from '../../../../../global';
import { ethQuery } from './graphindex';
import { EthAddress } from '../../../../../utils/types';

const ArmourElement = ['exp', 'rarity', 'id', 'type', 'setId'];
const BASE18 = BigNumber('1000000000000000000');
const MarketplaceElement = ['buyer', 'id', 'price', 'seller', 'status'];

function armourySort(item1: SellingArmouryType, item2: SellingArmouryType) {
  return item2.nRarity - item1.nRarity || item2.exp - item1.exp || item1.nType - item2.nType;
}

// Graph lỗi setId bị null
export default class SellGraphQuery {
  private static _rewriteData(data: NFTMarketplaceType) {
    const setId = Number(data.token.setId) <= 1 ? 1 : 2;
    const collectionName = CollectionName[setId - 1];
    const nRarity = data.token.rarity;
    const nType = data.token.type;
    const rawPrice = data.price as string;
    const price = BigNumber(rawPrice).div(BASE18).toString();
    return {
      rawData: data,
      collectionId: setId,
      collectionName,
      exp: data.token.exp ?? 0,
      id: Number(data.id),
      nRarity,
      nType,
      price,
      rarity: RarityMapping[nRarity - 1],
      type: TypeMapping[nType - 1],
      seller: data.seller,
    } as SellingArmouryType & { rawData: NFTMarketplaceType };
  }

  static async fetchData(owner: EthAddress) {
    try {
      const result = await ethQuery.query<{ data: { nftcollections: CollectionOwnedMarketplaceType[] } }>(
        {
          collection: 'nftcollections',
          params: {
            elements: [
              "id", "setId", "exp", "rarity",
              {
                collection: 'armor',
                params: {
                  elements: ["exp", "id", "rarity"]
                }
              },
              {
                collection: 'helmet',
                params: {
                  elements: ["exp", "id", "rarity"]
                }
              },
              {
                collection: 'shield',
                params: {
                  elements: ["exp", "id", "rarity"]
                }
              },
              {
                collection: 'sword',
                params: {
                  elements: ["exp", "id", "rarity"]
                }
              }
            ],
            where: { owner },
            first: 5000,
            orderBy: 'id',
          },
        }
      );
      const rawData = result['data']['nftcollections'];
      for (const item of rawData) {

      }
      // return {
      //   v1: 
      //   v2: 
      //   specials: 
      // }
      // 
      // let v1: (SellingArmouryType & { rawData: NFTMarketplaceType })[] = [];
      // let v2: (SellingArmouryType & { rawData: NFTMarketplaceType })[] = [];
      // for (const item of rawData) {
      //   if (item.token.setId == '2') v2.push(this._rewriteData(item));
      //   else v1.push(this._rewriteData(item));
      // }
      // v1 = v1.sort(armourySort);
      // v2 = v2.sort(armourySort);
      // return { v1, v2 };

      // appState[mode].collection.v1 = v1.sort(collectionSort);
      // appState[mode].collection.v2 = v2;
      // appState[mode].collection.specials = specialCollections;
    } catch (error) {
      console.error(error);
      return { v1: [], v2: [] };
    }
  }
}
