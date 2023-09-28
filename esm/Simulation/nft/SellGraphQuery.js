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
class SellGraphQuery {
    static _rewriteData(data) {
        var _a;
        const setId = Number(data.token.setId) <= 1 ? 1 : 2;
        const id = Number(data.id);
        const collectionName = KnightConfig_1.CollectionName[setId - 1];
        const nRarity = data.token.rarity;
        const nType = data.token.type;
        const rarity = KnightConfig_1.RarityMapping[nRarity - 1];
        const type = KnightConfig_1.TypeMapping[nType - 1];
        const exp = (_a = data.token.exp) !== null && _a !== void 0 ? _a : 0;
        const price = (0, bignumber_js_1.default)(data.price).div(BASE18).toString();
        const seller = data.seller;
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
        };
    }
    static fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield graphindex_1.ethQuery.query({
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
exports.default = SellGraphQuery;
