import { ApplicationState } from "../../../../../State/ApplicationState";
import { Contract } from "ethers";
import { getAddr } from "../../../../../utils/address";
import _ from "lodash";
import { SellingVeTravaType, tokenInfo } from "../../helpers/global";
import BigNumber from "bignumber.js";
import { multiCall } from "../../../../../utils/helper";
import veTravaMarketplaceABI from "../../../../../abis/veTravaMarketplaceABI.json";
import VeABI from "../../../../../abis/Ve.json";
import { TokenSellOption, tokenSellOptions } from "./veTravaConfig";

export async function updateSellingVeTrava(
    appState1: ApplicationState,
    force = false,
): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        const listTokenSell = tokenSellOptions[appState.chainId];
        for (let i = 0; i < listTokenSell.length; i++) {
            let key = listTokenSell[i].address.toLowerCase()
            let tokenSell: TokenSellOption = {
            ...listTokenSell[i],
            }
            appState.NFTVeTravaMarketSellingState.priceTokens.set(key, tokenSell)
        }
        if (appState.NFTVeTravaMarketSellingState.isFetch == false || force == true) {
            const veTravaMarketAddress = getAddr("VE_TRAVA_MARKETPLACE_ADDRESS", appState.chainId);
            const veTravaAddress = getAddr("VE_TRAVA_ADDRESS", appState.chainId);
            
            const Market = new Contract(
                veTravaMarketAddress,
                veTravaMarketplaceABI,
                appState.web3
            );
            const tokenOnMarket = await Market.getTokenOnSaleCount();
            let arrayCount = Array();
            for (let i = 0; i < tokenOnMarket; i++) {
                arrayCount.push(i);
            }
            const [tokenIdsOnMarket] = await Promise.all([
                multiCall(
                    veTravaMarketplaceABI,
                    arrayCount.map((_, idx) => ({
                        address: veTravaMarketAddress,
                        name: "getTokenOnSaleAtIndex",
                        params: [idx],
                    })),
                    appState.web3,
                    appState.chainId
                ),
            ]);
            const tokenOnSaleFlattened = tokenIdsOnMarket.flat();
            const [tokensMetadata, tokenVotingPower, tokenOrder] = await Promise.all([
                multiCall(
                    VeABI,
                    tokenOnSaleFlattened.map((id: any) => ({ address: veTravaAddress, name: "locked", params: [id] })),
                    appState.web3,
                    appState.chainId
                ),
                multiCall(
                    VeABI,
                    tokenOnSaleFlattened.map((id: any) => ({
                        address: veTravaAddress,
                        name: "balanceOfNFT",
                        params: [id],
                })),
                appState.web3,
                appState.chainId
                ),
                multiCall(
                    veTravaMarketplaceABI,
                    tokenOnSaleFlattened.map((id: any) => ({
                        address: veTravaMarketAddress,
                        name: "getTokenOrder",
                        params: [id],
                })),
                appState.web3,
                appState.chainId
                ),
            ]);

            const sellingVeTrava = new Array<SellingVeTravaType>;
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
                let tokenLocked: tokenInfo = {
                    address: tokenMetadata[3].toLowerCase(),
                    amount: tokenMetadata[1].toString(),
                }
                let priceToken: tokenInfo = {
                    address: priceTokenAddress.toLowerCase(),
                    amount: tokenOrderInfo[0][1].toString(),
                }
                let sellingVeTravaItem: SellingVeTravaType = {
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
    } catch (e) {
        console.log(e);
    }
    return appState;
}
