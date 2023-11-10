import { VeTravaState } from "../../../../../State";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { getMode } from "../../../../../utils/helper";
import { EthAddress, wallet_mode } from "../../../../../utils/types";
import { updateTravaGovernanceState } from "../../../governance";
import { SellingVeTravaType, priceToken, tokenLocked } from "../../helpers";
import { updateSellingVeTrava } from "./UpdateStateAccount";
import BEP20ABI from "../../../../../abis/BEP20.json";
import { Contract } from "ethers";
export async function simulateNFTVeTravaCreateSale(
    _appState1: ApplicationState,
    _NFTId: string,
    _from: EthAddress,
    _price: string,
    _priceTokenAddress: EthAddress,
): Promise<ApplicationState> {
    let appState = {..._appState1};
    try{
        _priceTokenAddress = _priceTokenAddress.toLowerCase();
        if (appState.TravaGovernanceState.totalSupply == "") {
            appState = await updateTravaGovernanceState(appState);
        }
        if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
            appState = await updateSellingVeTrava(appState);
        }
        let modeFrom: wallet_mode = getMode(appState, _from);
        if (appState[modeFrom].veTravaListState.veTravaList.has(_NFTId)) {
            let data: VeTravaState = appState[modeFrom].veTravaListState.veTravaList.get(_NFTId)!;
            appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
            const tokenLockContract = new Contract(
                _priceTokenAddress,
                BEP20ABI,
                appState.web3
            )
            let tokenLockDecimal = await tokenLockContract.decimals();
            let priceToken: priceToken = {
                address: _priceTokenAddress,
                decimal: tokenLockDecimal,
            }
            console.log("------------------");
            console.log(priceToken);
            let tokenLocked: tokenLocked = {
                address: "",
                decimal: "",
            }
            console.log("------------------");
            console.log(tokenLocked);

            ///DANG FIX
            let sellVeToken: SellingVeTravaType = {
                id: _NFTId,
                amount: data.tokenInVeTrava.balances,
                rwAmount: data.rewardTokenBalance.compoundAbleRewards,
                end: data.unlockTime,
                tokenLocked: tokenLocked,
                votingPower: data.votingPower,
                seller: _from,
                price: _price,
                priceToken: priceToken,
            } 
            appState.NFTVeTravaMarketSellingState.sellingVeTrava.push(sellVeToken);
        }
        //   if (modeFrom == "walletState" || modeFrom == "smartWalletState") {
        //     let data: VeTravaState = appState[modeFrom].veTravaListState.veTravaList.get(_NFTId)!;
        //     appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
        //     appState[modeFrom].veTravaListState.veTravaList.set(_NFTId, data);
        //   }
        //   else{
        //       appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
        //   }
        
    } catch (err) {
        throw err;
      }
      return appState;
}