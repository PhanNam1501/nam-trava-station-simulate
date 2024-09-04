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
exports.isBNBToken = isBNBToken;
exports.isUSDTToken = isUSDTToken;
exports.isSpecialToken = isSpecialToken;
exports.getSpecialToken = getSpecialToken;
exports.convertTokens = convertTokens;
exports.getTokenPrice = getTokenPrice;
exports.getLPTokenPrice = getLPTokenPrice;
const helper_1 = require("../utils/helper");
const utils_1 = require("../utils");
const BEP20_json_1 = __importDefault(require("../abis/BEP20.json"));
const PancakeSwapRouter_json_1 = __importDefault(require("../abis/PancakeSwapRouter.json"));
const PancakeSwapFactory_json_1 = __importDefault(require("../abis/PancakeSwapFactory.json"));
const PancakeSwapPair_json_1 = __importDefault(require("../abis/PancakeSwapPair.json"));
const AaveOracle_json_1 = __importDefault(require("../abis/AaveOracle.json"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
function isBNBToken(token, _chainId) {
    if (token.toLowerCase() == utils_1.bnb || token.toLowerCase() == (0, utils_1.getAddr)("WBNB_ADDRESS", _chainId).toLowerCase()) {
        return true;
    }
    return false;
}
function isUSDTToken(token, _chainId) {
    if (token.toLowerCase() == (0, utils_1.getAddr)("USDT_ADDRESS", _chainId).toLowerCase()) {
        return true;
    }
    return false;
}
function isSpecialToken(token, _chainId) {
    if (token.toLowerCase() == utils_1.bnb) {
        return true;
    }
    return false;
}
function getSpecialToken(token, _chainId) {
    const web3 = (0, helper_1.getJsonProvider)(_chainId);
    if (token.toLowerCase() == utils_1.bnb) {
        return (0, utils_1.getAddr)("WBNB_ADDRESS", _chainId);
    }
    return (0, utils_1.convertHexStringToAddress)(token);
}
function convertTokens(_listTokens, _chainId) {
    const listTokens = new Array();
    for (let i = 0; i < _listTokens.length; i++) {
        if (isSpecialToken(_listTokens[i], _chainId)) {
            listTokens.push(getSpecialToken(_listTokens[i], _chainId));
        }
        else {
            listTokens.push((0, utils_1.convertHexStringToAddress)(_listTokens[i]));
        }
    }
    return listTokens;
}
function getTokenPrice(_listTokens, _chainId, _web3) {
    return __awaiter(this, void 0, void 0, function* () {
        const listTokenPrices = new Array();
        const web3 = _web3 ? _web3 : (0, helper_1.getJsonProvider)(_chainId);
        const usdtAddress = (0, utils_1.getAddr)("USDT_ADDRESS", _chainId);
        const wbnbAddress = (0, utils_1.getAddr)("WBNB_ADDRESS", _chainId);
        const routerAddress = (0, utils_1.getAddr)("RouterAddress", _chainId);
        let listTokensAfterFilter = _listTokens.filter(e => !isUSDTToken(e, _chainId));
        listTokensAfterFilter = convertTokens(listTokensAfterFilter, _chainId);
        const listPathTokensAfterFilter = listTokensAfterFilter.map(e => isBNBToken(e, _chainId) ? [wbnbAddress, usdtAddress] : [e, wbnbAddress, usdtAddress]);
        const mockupAmount = utils_1.BASE_E18;
        const [decimals, amountOut, usdtPrice] = yield Promise.all([
            (0, helper_1.multiCall)(BEP20_json_1.default, [...listTokensAfterFilter, usdtAddress].map((_tokenAddress, _) => ({
                address: _tokenAddress,
                name: "decimals",
                params: []
            })), web3, _chainId),
            (0, helper_1.multiCall)(PancakeSwapRouter_json_1.default, [...listPathTokensAfterFilter].map((_path, _) => ({
                address: routerAddress,
                name: "getAmountsOut",
                params: [mockupAmount, _path]
            })), web3, _chainId),
            (0, helper_1.multiCall)(AaveOracle_json_1.default, [usdtAddress].map((address, _) => ({
                address: (0, utils_1.getAddr)("ORACLE_ADDRESS", _chainId),
                name: "getAssetPrice",
                params: [address],
            })), web3, _chainId),
        ]);
        const usdtPriceUSD = (0, bignumber_js_1.default)(usdtPrice).div(utils_1.BASE_E8).toFixed();
        let cnt = 0;
        for (let i = 0; i < _listTokens.length; i++) {
            if (isUSDTToken(_listTokens[i], _chainId)) {
                listTokenPrices.push(usdtPriceUSD);
            }
            else {
                let amount = isBNBToken(_listTokens[i], _chainId) ? String(amountOut[cnt][0][1]) : String(amountOut[cnt][0][2]);
                // let convertPrice = (await getSpecialTokenPrice(_listTokens[i], _chainId, amount))!
                let price = (0, bignumber_js_1.default)(amount)
                    .multipliedBy(usdtPriceUSD)
                    .div(mockupAmount)
                    .multipliedBy((0, bignumber_js_1.default)(10).pow(decimals[cnt]))
                    .div((0, bignumber_js_1.default)(10).pow(decimals[decimals.length - 1]))
                    .toFixed();
                listTokenPrices.push(price);
                cnt++;
            }
        }
        return listTokenPrices;
    });
}
function getLPTokenPrice(_listLPTokens, _chainId, _web3) {
    return __awaiter(this, void 0, void 0, function* () {
        const web3 = _web3 ? _web3 : (0, helper_1.getJsonProvider)(_chainId);
        const usdtAddress = (0, utils_1.getAddr)("USDT_ADDRESS", _chainId);
        const wbnbAddress = (0, utils_1.getAddr)("WBNB_ADDRESS", _chainId);
        const listLPTokens = _listLPTokens.map(e => (0, utils_1.convertHexStringToAddress)(e));
        const factoryAddr = (0, utils_1.getAddr)("FactoryAddress", _chainId);
        const [listToken0Addresses, listToken1Addresses, listTotalSupplies, listDecimalsLP] = yield Promise.all([
            (0, helper_1.multiCall)(PancakeSwapPair_json_1.default, listLPTokens.map((_tokenAddress, _) => ({
                address: _tokenAddress,
                name: "token0",
                params: []
            })), web3, _chainId),
            (0, helper_1.multiCall)(PancakeSwapPair_json_1.default, listLPTokens.map((_tokenAddress, _) => ({
                address: _tokenAddress,
                name: "token1",
                params: []
            })), web3, _chainId),
            (0, helper_1.multiCall)(PancakeSwapPair_json_1.default, listLPTokens.map((_tokenAddress, _) => ({
                address: _tokenAddress,
                name: "totalSupply",
                params: [],
            })), web3, _chainId),
            (0, helper_1.multiCall)(PancakeSwapPair_json_1.default, listLPTokens.map((_tokenAddress, _) => ({
                address: _tokenAddress,
                name: "decimals",
                params: [],
            })), web3, _chainId)
        ]);
        const [listPair0, listPair1, listDecimals0, listDecimals1, listBalance0, listBalance1] = yield Promise.all([
            (0, helper_1.multiCall)(PancakeSwapFactory_json_1.default, listToken0Addresses.map((_tokenAddress, _) => ({
                address: factoryAddr,
                name: "getPair",
                params: [String(_tokenAddress), wbnbAddress]
            })), web3, _chainId),
            (0, helper_1.multiCall)(PancakeSwapFactory_json_1.default, listToken1Addresses.map((_tokenAddress, _) => ({
                address: factoryAddr,
                name: "getPair",
                params: [String(_tokenAddress), wbnbAddress]
            })), web3, _chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, listToken0Addresses.map((_tokenAddress, _) => ({
                address: String(_tokenAddress),
                name: "decimals",
                params: [],
            })), web3, _chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, listToken1Addresses.map((_tokenAddress, _) => ({
                address: String(_tokenAddress),
                name: "decimals",
                params: [],
            })), web3, _chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, listToken0Addresses.map((_tokenAddress, i) => ({
                address: String(_tokenAddress),
                name: "balanceOf",
                params: [listLPTokens[i]],
            })), web3, _chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, listToken1Addresses.map((_tokenAddress, i) => ({
                address: String(_tokenAddress),
                name: "balanceOf",
                params: [listLPTokens[i]],
            })), web3, _chainId)
        ]);
        // get tvl pool
        const listAmountToken = new Array(_listLPTokens.length);
        const listTokenPriceAddresses = new Array(_listLPTokens.length);
        for (let i = 0; i < _listLPTokens.length; i++) {
            if (String(listPair0[i]) != utils_1.ZERO_ADDRESS || isBNBToken(String(listToken0Addresses[i]), _chainId)) {
                listAmountToken[i] = (0, bignumber_js_1.default)(String(listBalance0[i])).div((0, bignumber_js_1.default)(10).pow(String(listDecimals0[i]))).toFixed();
                listTokenPriceAddresses[i] = String(listToken0Addresses[i]);
            }
            else if (String(listPair1[i]) != utils_1.ZERO_ADDRESS || isBNBToken(String(listToken1Addresses[i]), _chainId)) {
                listAmountToken[i] = (0, bignumber_js_1.default)(String(listBalance1[i])).div((0, bignumber_js_1.default)(10).pow(String(listDecimals1[i]))).toFixed();
                listTokenPriceAddresses[i] = String(listToken1Addresses[i]);
            }
            else {
                listAmountToken[i] = "0";
                listTokenPriceAddresses[i] = utils_1.ZERO_ADDRESS;
            }
        }
        const listTokenPrices = yield getTokenPrice(listTokenPriceAddresses, _chainId, _web3);
        let listLPTokenPrices = new Array(_listLPTokens.length);
        for (let i = 0; i < _listLPTokens.length; i++) {
            // lp price * lp amount = amount0 * price0 + amount1 * price1 = 2 * amount0 * price0 = 2 * amount1 * price1
            listLPTokenPrices[i] = (0, bignumber_js_1.default)(2).multipliedBy(listAmountToken[i]).multipliedBy(listTokenPrices[i])
                .div((0, bignumber_js_1.default)(String(listTotalSupplies[i])).div((0, bignumber_js_1.default)(10).pow(String(listDecimalsLP[i]))))
                .toFixed();
        }
        return listLPTokenPrices;
    });
}
