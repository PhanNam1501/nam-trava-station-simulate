import BigNumber from 'bignumber.js';
import { CollectionName, RarityMapping, TypeMapping } from './KnightConfig';
import { NFTMarketplaceType, SellingArmouryType } from '../../../../../global';
import { ethQuery } from './graphindex';

const ArmourElement = ['exp', 'rarity', 'id', 'type', 'setId'];
const BASE18 = BigNumber('1000000000000000000');
const MarketplaceElement = ['buyer', 'id', 'price', 'seller', 'status'];

function armourySort(item1: SellingArmouryType, item2: SellingArmouryType) {
  return item2.nRarity - item1.nRarity || item2.exp - item1.exp || item1.nType - item2.nType;
}

export default class SellGraphQuery {
  private static _rewriteData(data: NFTMarketplaceType) {
    const setId = Number(data.token.setId) <= 1 ? 1 : 2;
    const id = Number(data.id);
    const collectionName = CollectionName[setId - 1];
    const nRarity = data.token.rarity;
    const nType = data.token.type;
    const rarity = RarityMapping[nRarity - 1];
    const type = TypeMapping[nType - 1];
    const exp = data.token.exp ?? 0
    const price = BigNumber(data.price as string).div(BASE18).toString();
    const seller = data.seller
    return {
      rawData: data,
      id: id,
      collectionName: collectionName,
      collectionId: setId,
      nRarity: nRarity,
      nType: nType,
      rarity: rarity,
      exp: exp,
      type: type,
      price: price,
      seller: seller,
    } as SellingArmouryType & { rawData: NFTMarketplaceType };
  }

  static async fetchData() {
    try {
      const result = await ethQuery.query<{ data: { nftmarketplaces: Array<NFTMarketplaceType> } }>(
        {
          collection: 'nftmarketplaces',
          params: {
            elements: [
              ...MarketplaceElement,
              { collection: 'token', params: { elements: ArmourElement } },
            ],
            where: { buyer: null, status: 'CREATED', token_: { setId: { $in: [0, 1, 2] } } },
            first: 5000,
            orderBy: 'price',
          },
        }
      );
      const rawData = result['data']['nftmarketplaces'];
      let v1: (SellingArmouryType & { rawData: NFTMarketplaceType })[] = [];
      let v2: (SellingArmouryType & { rawData: NFTMarketplaceType })[] = [];
      for (const item of rawData) {
        if (item.token.setId == '2') v2.push(this._rewriteData(item));
        else v1.push(this._rewriteData(item));
      }
      v1 = v1.sort(armourySort);
      v2 = v2.sort(armourySort);
      return { v1, v2 };
    } catch (error) {
      console.error(error);
      return { v1: [], v2: [] };
    }
  }
}
