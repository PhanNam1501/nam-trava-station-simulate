var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import BigNumber from "bignumber.js";
import PancakeSwapFactoryABI from "../../abis/PancakeSwapFactory.json";
import rawData from "./token_combinationsMainnet.json";
import rawDataTokens from "./addressTokenMainnet.json";
import BEP20ABI from "../../abis/BEP20.json";
import { centic_api, centic_api_key, getAddr, ZERO_ADDRESS } from "../../utils";
import axios from "axios";
import { multiCall } from "../../utils/helper";
export function updatePancakeSwapV2(appState1, force) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let factoryAddress = getAddr("FactoryAddress", appState.chainId);
            const tokenPairs = rawData;
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
                multiCall(PancakeSwapFactoryABI, tokens0Address.map((address, index) => ({
                    address: factoryAddress,
                    name: "getPair",
                    params: [tokensAddress[index][0], tokensAddress[index][1]],
                })), appState.web3, appState.chainId)
            ]);
            const tokens = rawDataTokens;
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
                if (pairAddress != ZERO_ADDRESS) {
                    tokensAddressAndpairToken.push([token0, token1, pairAddress]);
                    pairTokensAddressNot0.push(pairAddress);
                }
            }
            let [tokens0InPair, tokens1InPair, tokens0Decimals, tokens1Decimals, pairTokensOfSmartWallet, pairTokensDecimals, totalSupplyPairTokens,] = yield Promise.all([
                multiCall(BEP20ABI, pairTokensAddressNot0.map((address, index) => ({
                    address: tokensAddressAndpairToken[index][0],
                    name: "balanceOf",
                    params: [address],
                })), appState.web3, appState.chainId),
                multiCall(BEP20ABI, pairTokensAddressNot0.map((address, index) => ({
                    address: tokensAddressAndpairToken[index][1],
                    name: "balanceOf",
                    params: [address],
                })), appState.web3, appState.chainId),
                multiCall(BEP20ABI, pairTokensAddressNot0.map((address, index) => ({
                    address: tokensAddressAndpairToken[index][0],
                    name: "decimals",
                    params: [],
                })), appState.web3, appState.chainId),
                multiCall(BEP20ABI, pairTokensAddressNot0.map((address, index) => ({
                    address: tokensAddressAndpairToken[index][1],
                    name: "decimals",
                    params: [],
                })), appState.web3, appState.chainId),
                multiCall(BEP20ABI, pairTokensAddressNot0.map((address, index) => ({
                    address: address,
                    name: "balanceOf",
                    params: [appState.smartWalletState.address],
                })), appState.web3, appState.chainId),
                multiCall(BEP20ABI, pairTokensAddressNot0.map((address, index) => ({
                    address: address,
                    name: "decimals",
                    params: [],
                })), appState.web3, appState.chainId),
                multiCall(BEP20ABI, pairTokensAddressNot0.map((address, index) => ({
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
                let token0Price = new BigNumber(dataTokensSupported.find((token) => token.address == token0)["price"]);
                let token1Price = new BigNumber(dataTokensSupported.find((token) => token.address == token1)["price"]);
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
function getDataTokenByAxios(address, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${centic_api}/v3//tokens/price?chain=${chain}&addresses=${address}`;
        try {
            const response = yield axios.request({
                method: "get",
                url: url,
                headers: {
                    "x-apikey": centic_api_key
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
