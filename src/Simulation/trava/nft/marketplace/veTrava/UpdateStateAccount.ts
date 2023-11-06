import { ApplicationState } from "../../../../../State/ApplicationState";
import { Contract } from "ethers";
import { getAddr } from "../../../../../utils/address";
import _ from "lodash";
import { SellingVeTravaType } from "../../helpers/global";
import BigNumber from "bignumber.js";
import { NFTVeTravaSellingState } from "../../../../../State/TravaNFTState";
import { _fetchNormal } from "../../helpers/utils"
import { BigNumberish, EthAddress, wallet_mode } from "../../../../../utils/types";
import { multiCall } from "../../../../../utils/helper";
import veTravaMarketplaceABI from "../../../../../abis/veTravaMarketplaceABI.json";
import VeABI from "../../../../../abis/Ve.json";
import { FromAddressError } from "../../../../../utils/error";
import { updateTravaGovernanceState, updateUserLockBalance } from "../../../governance/UpdateStateAccount";


export async function updateSellingNFTFromContract(
    appState1: ApplicationState,
): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
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
        const sellingVeTrava = new Array<SellingVeTravaType>;
        for (let i = 0; i < tokenOnSaleFlattened.length; i++) {
            let tokenId = tokenOnSaleFlattened[i];
            let tokenMetadata = tokensMetadata[i];
            let tokenVoting = tokenVotingPower[i];
            let tokenOrderInfo = tokenOrder[i];
            let priceToken = "";
            if (BigNumber(tokenOrderInfo[0][2]).isEqualTo(1)) {
                priceToken = getAddr("TRAVA_TOKEN", appState.chainId);
            }
            else if (BigNumber(tokenOrderInfo[0][2]).isEqualTo(2)) {
                priceToken = getAddr("BUSD_TOKEN_ADDRESS", appState.chainId);
            }
            let sellingVeTravaItem = {
                id: tokenId,
                amount: tokenMetadata[1],
                rwAmount: tokenMetadata[0],
                end: tokenMetadata[2].toString(),
                token: tokenMetadata[3],
                votingPower: tokenVoting[0],
                seller: tokenOrderInfo[0][0],
                price: tokenOrderInfo[0][1],
                priceToken: priceToken,
            };
            sellingVeTrava.push(sellingVeTravaItem);
        }
        appState.NFTVeTravaMarketSellingState.sellingVeTrava = sellingVeTrava;
        appState.NFTVeTravaMarketSellingState.isFetch = true;
    } catch (e) {
        console.log(e);
    }
    return appState;
}

export async function updateUserVeTravaMarket(appState1: ApplicationState, _userAddress: EthAddress) {
    let appState = { ...appState1 };
    try {
        if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
            appState = await updateSellingNFTFromContract(appState);
          }
          await updateUserLockBalance(appState, _userAddress);
    } catch (e) {
        console.log(e);
    }
    return appState;
}