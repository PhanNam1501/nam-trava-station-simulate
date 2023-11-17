var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Contract } from "ethers";
import { getAddr } from "../../../../../utils/address";
import BigNumber from "bignumber.js";
import { multiCall } from "../../../../../utils/helper";
import veTravaMarketplaceABI from "../../../../../abis/veTravaMarketplaceABI.json";
import VeABI from "../../../../../abis/Ve.json";
import { tokenSellOptions } from "./veTravaConfig";
export function updateSellingVeTrava(appState1, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            const listTokenSell = tokenSellOptions[appState.chainId];
            for (let i = 0; i < listTokenSell.length; i++) {
                let key = listTokenSell[i].address.toLowerCase();
                let tokenSell = Object.assign({}, listTokenSell[i]);
                appState.NFTVeTravaMarketSellingState.priceTokens.set(key, tokenSell);
            }
            if (appState.NFTVeTravaMarketSellingState.isFetch == false || force == true) {
                const veTravaMarketAddress = getAddr("VE_TRAVA_MARKETPLACE_ADDRESS", appState.chainId);
                const veTravaAddress = getAddr("VE_TRAVA_ADDRESS", appState.chainId);
                const Market = new Contract(veTravaMarketAddress, veTravaMarketplaceABI, appState.web3);
                const tokenOnMarket = yield Market.getTokenOnSaleCount();
                let arrayCount = Array();
                for (let i = 0; i < tokenOnMarket; i++) {
                    arrayCount.push(i);
                }
                const [tokenIdsOnMarket] = yield Promise.all([
                    multiCall(veTravaMarketplaceABI, arrayCount.map((_, idx) => ({
                        address: veTravaMarketAddress,
                        name: "getTokenOnSaleAtIndex",
                        params: [idx],
                    })), appState.web3, appState.chainId),
                ]);
                const tokenOnSaleFlattened = tokenIdsOnMarket.flat();
                const [tokensMetadata, tokenVotingPower, tokenOrder] = yield Promise.all([
                    multiCall(VeABI, tokenOnSaleFlattened.map((id) => ({ address: veTravaAddress, name: "locked", params: [id] })), appState.web3, appState.chainId),
                    multiCall(VeABI, tokenOnSaleFlattened.map((id) => ({
                        address: veTravaAddress,
                        name: "balanceOfNFT",
                        params: [id],
                    })), appState.web3, appState.chainId),
                    multiCall(veTravaMarketplaceABI, tokenOnSaleFlattened.map((id) => ({
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
                    if (BigNumber(tokenOrderInfo[0][2]).isEqualTo(1)) {
                        priceTokenAddress = getAddr("TRAVA_TOKEN", appState.chainId);
                    }
                    else if (BigNumber(tokenOrderInfo[0][2]).isEqualTo(2)) {
                        priceTokenAddress = getAddr("BUSD_TOKEN_ADDRESS", appState.chainId);
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
