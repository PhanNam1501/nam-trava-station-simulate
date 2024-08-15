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
exports.updatePancakeSwapV2 = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const PancakeSwapFactory_json_1 = __importDefault(require("../../abis/PancakeSwapFactory.json"));
const token_combinationsMainnet_json_1 = __importDefault(require("./token_combinationsMainnet.json"));
const addressTokenMainnet_json_1 = __importDefault(require("./addressTokenMainnet.json"));
const BEP20_json_1 = __importDefault(require("../../abis/BEP20.json"));
const utils_1 = require("../../utils");
const axios_1 = __importDefault(require("axios"));
const helper_1 = require("../../utils/helper");
function updatePancakeSwapV2(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let factoryAddress = (0, utils_1.getAddr)("FactoryAddress", appState.chainId);
            const tokenPairs = token_combinationsMainnet_json_1.default;
            let tokensAddress = [];
            let tokens0Address = [];
            for (let i = 0; i < tokenPairs.length; i++) {
                let token0 = tokenPairs[i].address1;
                let token1 = tokenPairs[i].address2;
                let token = [token0, token1];
                tokens0Address.push(token0);
                tokensAddress.push(token);
            }
            let [pairTokensAddress,] = yield Promise.all([
                (0, helper_1.multiCall)(PancakeSwapFactory_json_1.default, tokens0Address.map((address, index) => ({
                    address: factoryAddress,
                    name: "getPair",
                    params: [tokensAddress[index][0], tokensAddress[index][1]],
                })), appState.web3, appState.chainId)
            ]);
            const tokens = addressTokenMainnet_json_1.default;
            function getAddressList(tokens) {
                return tokens.map(token => token.address);
            }
            const addressList = getAddressList(tokens);
            let stringAddress = "";
            for (let i = 0; i < addressList.length; i++) {
                stringAddress += addressList[i] + "%2C%20";
            }
            stringAddress = stringAddress.slice(0, -6);
            let dataTokensSupported = yield getDataTokenByAxios(stringAddress, "0x38");
            dataTokensSupported = dataTokensSupported["tokens"];
            let tokensAddressAndpairToken = [];
            let pairTokensAddressNot0 = [];
            for (let i = 0; i < tokenPairs.length; i++) {
                let token0 = tokenPairs[i].address1;
                let token1 = tokenPairs[i].address2;
                let pairAddress = pairTokensAddress[i][0];
                if (pairAddress != utils_1.ZERO_ADDRESS) {
                    tokensAddressAndpairToken.push([token0, token1, pairAddress]);
                    pairTokensAddressNot0.push(pairAddress);
                }
            }
            let [tokens0InPair, tokens1InPair, tokens0Decimals, tokens1Decimals, pairTokensOfSmartWallet, pairTokensDecimals, totalSupplyPairTokens,] = yield Promise.all([
                (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map((address, index) => ({
                    address: tokensAddressAndpairToken[index][0],
                    name: "balanceOf",
                    params: [address],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map((address, index) => ({
                    address: tokensAddressAndpairToken[index][1],
                    name: "balanceOf",
                    params: [address],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map((address, index) => ({
                    address: tokensAddressAndpairToken[index][0],
                    name: "decimals",
                    params: [],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map((address, index) => ({
                    address: tokensAddressAndpairToken[index][1],
                    name: "decimals",
                    params: [],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map((address, index) => ({
                    address: address,
                    name: "balanceOf",
                    params: [appState.smartWalletState.address],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map((address, index) => ({
                    address: address,
                    name: "decimals",
                    params: [],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, pairTokensAddressNot0.map((address, index) => ({
                    address: address,
                    name: "totalSupply",
                    params: [],
                })), appState.web3, appState.chainId)
            ]);
            for (let i = 0; i < pairTokensAddressNot0.length; i++) {
                let token0 = tokensAddressAndpairToken[i][0];
                let token1 = tokensAddressAndpairToken[i][1];
                let pairAddress = pairTokensAddressNot0[i];
                let token0InPair = tokens0InPair[i][0];
                let token0Decimals = tokens0Decimals[i][0];
                let token1InPair = tokens1InPair[i][0];
                let token1Decimals = tokens1Decimals[i][0];
                let pairTokenOfSmartWallet = pairTokensOfSmartWallet[i][0];
                let pairTokenDecimals = pairTokensDecimals[i][0];
                let totalSupplyPairToken = totalSupplyPairTokens[i][0];
                let token0Price = new bignumber_js_1.default(dataTokensSupported.find((token) => token.address == token0)["price"]);
                let token1Price = new bignumber_js_1.default(dataTokensSupported.find((token) => token.address == token1)["price"]);
                let totalValue = token0Price.multipliedBy(token0InPair).dividedBy(Math.pow(10, Number(token0Decimals))).plus(token1Price.multipliedBy(token1InPair).dividedBy(Math.pow(10, Number(token1Decimals))));
                // 1000 USD
                if (totalValue.isGreaterThan(1000)) {
                    appState.pancakeSwapV2Pair.pancakeV2Pairs.set(pairAddress.toLowerCase(), {
                        addressToken0: token0.toLowerCase(),
                        addressToken1: token1.toLowerCase(),
                        token0Price: Number(token0Price),
                        token1Price: Number(token1Price),
                        token0Decimals: Number(token0Decimals),
                        token1Decimals: Number(token1Decimals),
                        token0Hold: Number(token0InPair),
                        token1Hold: Number(token1InPair),
                        pairTokenDecimals: Number(pairTokenDecimals),
                        totalSupplyPairToken: Number(totalSupplyPairToken),
                        tvl: Number(totalValue),
                        pairTokenOfSmartWallet: Number(pairTokenOfSmartWallet)
                    });
                }
            }
            appState.pancakeSwapV2Pair.isFetch = true;
            return appState;
        }
        catch (error) {
            console.error(error);
        }
        return appState;
    });
}
exports.updatePancakeSwapV2 = updatePancakeSwapV2;
function getDataTokenByAxios(address, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${utils_1.centic_api}/v3//tokens/price?chain=${chain}&addresses=${address}`;
        try {
            const response = yield axios_1.default.request({
                method: "get",
                url: url,
                headers: {
                    "x-apikey": utils_1.centic_api_key
                }
            });
            const data = response.data;
            return data;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
