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
exports.updateSellingVeTrava = void 0;
const ethers_1 = require("ethers");
const address_1 = require("../../../../../utils/address");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const helper_1 = require("../../../../../utils/helper");
const veTravaMarketplaceABI_json_1 = __importDefault(require("../../../../../abis/veTravaMarketplaceABI.json"));
const Ve_json_1 = __importDefault(require("../../../../../abis/Ve.json"));
const veTravaConfig_1 = require("./veTravaConfig");
function updateSellingVeTrava(appState1, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            const listTokenSell = veTravaConfig_1.tokenSellOptions[appState.chainId];
            for (let i = 0; i < listTokenSell.length; i++) {
                let key = listTokenSell[i].address.toLowerCase();
                let tokenSell = Object.assign({}, listTokenSell[i]);
                appState.NFTVeTravaMarketSellingState.priceTokens.set(key, tokenSell);
            }
            if (appState.NFTVeTravaMarketSellingState.isFetch == false || force == true) {
                const veTravaMarketAddress = (0, address_1.getAddr)("VE_TRAVA_MARKETPLACE_ADDRESS", appState.chainId);
                const veTravaAddress = (0, address_1.getAddr)("VE_TRAVA_ADDRESS", appState.chainId);
                const Market = new ethers_1.Contract(veTravaMarketAddress, veTravaMarketplaceABI_json_1.default, appState.web3);
                const tokenOnMarket = yield Market.getTokenOnSaleCount();
                let arrayCount = Array();
                for (let i = 0; i < tokenOnMarket; i++) {
                    arrayCount.push(i);
                }
                const [tokenIdsOnMarket] = yield Promise.all([
                    (0, helper_1.multiCall)(veTravaMarketplaceABI_json_1.default, arrayCount.map((_, idx) => ({
                        address: veTravaMarketAddress,
                        name: "getTokenOnSaleAtIndex",
                        params: [idx],
                    })), appState.web3, appState.chainId),
                ]);
                const tokenOnSaleFlattened = tokenIdsOnMarket.flat();
                const [tokensMetadata, tokenVotingPower, tokenOrder] = yield Promise.all([
                    (0, helper_1.multiCall)(Ve_json_1.default, tokenOnSaleFlattened.map((id) => ({ address: veTravaAddress, name: "locked", params: [id] })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(Ve_json_1.default, tokenOnSaleFlattened.map((id) => ({
                        address: veTravaAddress,
                        name: "balanceOfNFT",
                        params: [id],
                    })), appState.web3, appState.chainId),
                    (0, helper_1.multiCall)(veTravaMarketplaceABI_json_1.default, tokenOnSaleFlattened.map((id) => ({
                        address: veTravaMarketAddress,
                        name: "getTokenOrder",
                        params: [id],
                    })), appState.web3, appState.chainId),
                ]);
                const sellingVeTrava = new Array;
                for (let i = 0; i < tokenOnSaleFlattened.length; i++) {
                    let tokenId = tokenOnSaleFlattened[i];
                    let tokenMetadata = tokensMetadata[i];
                    let tokenVoting = tokenVotingPower[i];
                    let tokenOrderInfo = tokenOrder[i];
                    let priceTokenAddress = "";
                    if ((0, bignumber_js_1.default)(tokenOrderInfo[0][2]).isEqualTo(1)) {
                        priceTokenAddress = (0, address_1.getAddr)("TRAVA_TOKEN", appState.chainId);
                    }
                    else if ((0, bignumber_js_1.default)(tokenOrderInfo[0][2]).isEqualTo(2)) {
                        priceTokenAddress = (0, address_1.getAddr)("BUSD_TOKEN_ADDRESS", appState.chainId);
                    }
                    let tokenLocked = {
                        address: tokenMetadata[3].toLowerCase(),
                        amount: tokenMetadata[1].toString(),
                    };
                    let priceToken = {
                        address: priceTokenAddress.toLowerCase(),
                        amount: tokenOrderInfo[0][1].toString(),
                    };
                    let sellingVeTravaItem = {
                        id: tokenId.toString(),
                        rwAmount: tokenMetadata[0].toString(),
                        end: tokenMetadata[2].toString(),
                        lockedToken: tokenLocked,
                        votingPower: tokenVoting[0].toString(),
                        seller: tokenOrderInfo[0][0].toLowerCase(),
                        priceToken: priceToken,
                    };
                    sellingVeTrava.push(sellingVeTravaItem);
                }
                appState.NFTVeTravaMarketSellingState.sellingVeTrava = sellingVeTrava;
                appState.NFTVeTravaMarketSellingState.isFetch = true;
            }
        }
        catch (e) {
            console.log(e);
        }
        return appState;
    });
}
exports.updateSellingVeTrava = updateSellingVeTrava;
