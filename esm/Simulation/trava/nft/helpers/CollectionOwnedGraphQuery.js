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
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const KnightConfig_1 = require("./KnightConfig");
const graphindex_1 = require("./graphindex");
const ArmourElement = ['exp', 'rarity', 'id', 'type', 'setId'];
const BASE18 = (0, bignumber_js_1.default)('1000000000000000000');
const MarketplaceElement = ['buyer', 'id', 'price', 'seller', 'status'];
function armourySort(item1, item2) {
    return item2.nRarity - item1.nRarity || item2.exp - item1.exp || item1.nType - item2.nType;
}
// Graph lỗi setId bị null
class SellGraphQuery {
    static _rewriteData(data) {
        var _a;
        const setId = Number(data.token.setId) <= 1 ? 1 : 2;
        const collectionName = KnightConfig_1.CollectionName[setId - 1];
        const nRarity = data.token.rarity;
        const nType = data.token.type;
        const rawPrice = data.price;
        const price = (0, bignumber_js_1.default)(rawPrice).div(BASE18).toString();
        return {
            rawData: data,
            collectionId: setId,
            collectionName,
            exp: (_a = data.token.exp) !== null && _a !== void 0 ? _a : 0,
            id: Number(data.id),
            nRarity,
            nType,
            price,
            rarity: KnightConfig_1.RarityMapping[nRarity - 1],
            type: KnightConfig_1.TypeMapping[nType - 1],
            seller: data.seller,
        };
    }
    static fetchData(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield graphindex_1.ethQuery.query({
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
                });
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
            }
            catch (error) {
                console.error(error);
                return { v1: [], v2: [] };
            }
        });
    }
}
exports.default = SellGraphQuery;
