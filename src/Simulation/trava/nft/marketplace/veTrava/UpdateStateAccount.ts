import { ApplicationState } from "../../../../../State/ApplicationState";
import { Contract } from "ethers";
import { getAddr } from "../../../../../utils/address";
import _ from "lodash";
import { SellingVeTravaType } from "../../helpers/global";
import BigNumber from "bignumber.js";
import { BigNumberish, EthAddress, wallet_mode } from "../../../../../utils/types";
import { multiCall } from "../../../../../utils/helper";
import veTravaMarketplaceABI from "../../../../../abis/veTravaMarketplaceABI.json";
import VeABI from "../../../../../abis/Ve.json";
import { FromAddressError } from "../../../../../utils/error";
import BEP20ABI from "../../../../../abis/BEP20.json";
export async function updateSellingVeTrava(
    appState1: ApplicationState,
    force = false,
): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        if (appState.NFTVeTravaMarketSellingState.isFetch == false || force == true) {
            const veTravaMarketAddress = getAddr("VE_TRAVA_MARKETPLACE_ADDRESS", appState.chainId);
            const veTravaAddress = getAddr("VE_TRAVA_ADDRESS", appState.chainId);
            
            const Market = new Contract(
                veTravaMarketAddress,
                veTravaMarketplaceABI,
                appState.web3
            );
            const tokenOnMarket = await Market.getTokenOnSaleCount();
            const [tokenIdsOnMarket] = await Promise.all([
                multiCall(
                    veTravaMarketplaceABI,
                    new Array(tokenOnMarket).fill(1).map((_, idx) => ({
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
            const travaContract = new Contract(
                getAddr("TRAVA_TOKEN", appState.chainId),
                BEP20ABI,
                appState.web3
                )
            const travaTokenDecimals = await travaContract.decimals();
            const busdContract = new Contract(
                getAddr("BUSD_TOKEN_ADDRESS", appState.chainId),
                BEP20ABI,
                appState.web3
                )
            const busdTokenDecimals = await busdContract.decimals();


            const sellingVeTrava = new Array<SellingVeTravaType>;
            for (let i = 0; i < tokenOnSaleFlattened.length; i++) {
                let tokenId = tokenOnSaleFlattened[i];
                let tokenMetadata = tokensMetadata[i];
                let tokenVoting = tokenVotingPower[i];
                let tokenOrderInfo = tokenOrder[i];
                let priceToken = "";
                let priceTokenDecimals = 0;
                if (BigNumber(tokenOrderInfo[0][2]).isEqualTo(1)) {
                    priceToken = getAddr("TRAVA_TOKEN", appState.chainId);
                    priceTokenDecimals = Number(travaTokenDecimals);
                }
                else if (BigNumber(tokenOrderInfo[0][2]).isEqualTo(2)) {
                    priceToken = getAddr("BUSD_TOKEN_ADDRESS", appState.chainId);
                    priceTokenDecimals = Number(busdTokenDecimals);
                }
                let sellingVeTravaItem: SellingVeTravaType = {
                    id: parseInt(tokenId),
                    amount: parseInt(tokenMetadata[1]),
                    rwAmount: parseInt(tokenMetadata[0]),
                    end: tokenMetadata[2].toString(),
                    token: tokenMetadata[3].toLowerCase(),
                    votingPower: parseInt(tokenVoting[0]),
                    seller: tokenOrderInfo[0][0].toLowerCase(),
                    price: parseInt(tokenOrderInfo[0][1]),
                    priceToken: priceToken.toLowerCase(),
                    priceTokenDecimals: priceTokenDecimals,
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
