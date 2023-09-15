var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import BigNumber from 'bignumber.js';
import { CollectionName, RarityMapping, TypeMapping } from './KnightConfig';
import { ethQuery } from './graphindex';
const ArmourElement = ['exp', 'rarity', 'id', 'type', 'setId'];
const BASE18 = BigNumber('1000000000000000000');
const MarketplaceElement = ['buyer', 'id', 'price', 'seller', 'status'];
function armourySort(item1, item2) {
    return item2.nRarity - item1.nRarity || item2.exp - item1.exp || item1.nType - item2.nType;
}
export default class SellGraphQuery {
    static _rewriteData(data) {
        var _a;
        const setId = Number(data.token.setId) <= 1 ? 1 : 2;
        const collectionName = CollectionName[setId - 1];
        const nRarity = data.token.rarity;
        const nType = data.token.type;
        const rawPrice = data.price;
        const price = BigNumber(rawPrice).div(BASE18).toString();
        return {
            rawData: data,
            id: Number(data.id),
            collectionName,
            collectionId: setId,
            nRarity,
            nType,
            rarity: RarityMapping[nRarity - 1],
            exp: (_a = data.token.exp) !== null && _a !== void 0 ? _a : 0,
            type: TypeMapping[nType - 1],
            price,
            seller: data.seller,
        };
    }
    static fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield ethQuery.query({
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
                });
                const rawData = result['data']['nftmarketplaces'];
                let v1 = [];
                let v2 = [];
                for (const item of rawData) {
                    if (item.token.setId == '2')
                        v2.push(this._rewriteData(item));
                    else
                        v1.push(this._rewriteData(item));
                }
                v1 = v1.sort(armourySort);
                v2 = v2.sort(armourySort);
                return { v1, v2 };
            }
            catch (error) {
                console.error(error);
                return { v1: [], v2: [] };
            }
        });
    }
}
