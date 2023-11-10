import { TokenLock, VeTravaState } from "../../../../../State";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { getMode } from "../../../../../utils/helper";
import { EthAddress, wallet_mode } from "../../../../../utils/types";
import { TokenLockOption, getTokenRatio, tokenLockOptions, updateTravaGovernanceState } from "../../../governance";
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
                decimals: tokenLockDecimal.toString(),
            }
            let tokenLocked: tokenLocked = {
                address: data.tokenInVeTrava.tokenLockOption.address,
                decimals: data.tokenInVeTrava.tokenLockOption.decimals,
            }
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
    } catch (err) {
        throw err;
      }
      return appState;
}

export async function simulateNFTVeTravaCancelSale(
    _appState1: ApplicationState,
    _NFTId: string,
    _from: EthAddress,
): Promise<ApplicationState> {
    let appState = {..._appState1};
    try{
        if (appState.TravaGovernanceState.totalSupply == "") {
            appState = await updateTravaGovernanceState(appState);
        }
        if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
            appState = await updateSellingVeTrava(appState);
        }
        let modeFrom: wallet_mode = getMode(appState, _from);
        if (appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId) && _from == appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)!.seller) {
            let data = appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)!;
            let tokenRatio = (await getTokenRatio(appState, data.tokenLocked.address));
            let tokenLock: TokenLockOption = tokenLockOptions[appState.chainId].find(x => x.address == data.tokenLocked.address)!;
            let tokenLockHasRatio: TokenLock = {
                address: tokenLock.address,
                symbol: tokenLock.symbol,
                name: tokenLock.name,
                decimals: tokenLock.decimals,
                ratio: tokenRatio.toFixed(),
            }
            let data1: VeTravaState = {
                id: data.id,
                votingPower: data.votingPower,
                tokenInVeTrava: {
                    balances: data.amount,
                    tokenLockOption: tokenLockHasRatio,
                },
                unlockTime: data.end,
                rewardTokenBalance: {
                    compoundAbleRewards: data.rwAmount,
                    compoundedRewards: data.rwAmount,
                    balances: data.rwAmount,
                },
            }
            appState[modeFrom].veTravaListState.veTravaList.set(_NFTId, data1);
            appState.NFTVeTravaMarketSellingState.sellingVeTrava = appState.NFTVeTravaMarketSellingState.sellingVeTrava.filter(x => x.id != _NFTId);
            
        }
    } catch (err) {
        throw err;
      }
      return appState;
}
