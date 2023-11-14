import { VeTravaState } from "../../../../../State";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { getMode } from "../../../../../utils/helper";
import { EthAddress, uint256, wallet_mode } from "../../../../../utils/types";
import { TokenLockOption, tokenLockOptions, updateTravaGovernanceState } from "../../../governance";
import { SellingVeTravaType, tokenInfo } from "../../helpers";
import { updateSellingVeTrava } from "./UpdateStateAccount";
import BigNumber from "bignumber.js";
import { updateSmartWalletTokenBalance, updateTokenBalance, updateUserTokenBalance } from "../../../../basic";
import { NFTNotFoundError } from '../../../../../utils/error';
import { simulateNFTVeTravaTranfer } from "../../utilities/SimulationVeTravaNFTUtilities";
import _ from "lodash";
export async function simulateNFTVeTravaCreateSale(
    _appState1: ApplicationState,
    _NFTId: uint256,
    _from: EthAddress,
    _price: uint256,
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
        if (!appState[modeFrom].veTravaListState.veTravaList.has(_NFTId)) {
            throw new NFTNotFoundError("NFT not found");
        }
        if (appState[modeFrom].veTravaListState.veTravaList.has(_NFTId)) {
            let data: VeTravaState = appState[modeFrom].veTravaListState.veTravaList.get(_NFTId)!;
            let priceToken: tokenInfo = {
                address: _priceTokenAddress,
                amount: _price,
            }
            let tokenLocked: tokenInfo = {
                address: data.tokenInVeTrava.tokenLockOption.address,
                amount: data.tokenInVeTrava.balances,
            }
            let sellVeToken: SellingVeTravaType = {
                id: _NFTId,
                rwAmount: data.rewardTokenBalance.compoundAbleRewards,
                end: data.unlockTime,
                lockedToken: tokenLocked,
                votingPower: data.votingPower,
                seller: _from,
                priceToken: priceToken,
            } 
            appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
            appState.NFTVeTravaMarketSellingState.sellingVeTrava.push(sellVeToken);
        }
    } catch (err) {
        throw err;
      }
      return appState;
}

export async function simulateNFTVeTravaCancelSale(
    _appState1: ApplicationState,
    _NFTId: uint256,
    _to: EthAddress,
): Promise<ApplicationState> {
    let appState = {..._appState1};
    try{
        _to = _to.toLowerCase();
        if (appState.TravaGovernanceState.totalSupply == "") {
            appState = await updateTravaGovernanceState(appState);
        }
        if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
            appState = await updateSellingVeTrava(appState);
        }
        let _from = appState.smartWalletState.address.toLowerCase();
        if (!appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)) {
            throw new NFTNotFoundError("NFT not found");
        }
        if (!(_from == appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)!.seller.toLowerCase())){
            throw new Error("Not owner error");
        } 
        let data = appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)!;
        let tokenLock: TokenLockOption = tokenLockOptions[appState.chainId].find(x => x.address == data.lockedToken.address)!;
        let data1: VeTravaState = {
            id: data.id,
            votingPower: data.votingPower,
            tokenInVeTrava: {
                balances: data.lockedToken.amount,
                tokenLockOption: tokenLock,
            },
            unlockTime: data.end,
            rewardTokenBalance: {
                compoundAbleRewards: data.rwAmount,
                compoundedRewards: data.rwAmount,
                balances: data.rwAmount,
            },
        }
        appState.smartWalletState.veTravaListState.veTravaList.set(_NFTId, data1);
        appState.NFTVeTravaMarketSellingState.sellingVeTrava = appState.NFTVeTravaMarketSellingState.sellingVeTrava.filter(x => x.id != _NFTId);
        
        appState = await simulateNFTVeTravaTranfer(appState, _NFTId, _from, _to);
    } catch (err) {
        throw err;
      }
      return appState;
}


export async function simulateNFTVeTravaBuy(
    _appState1: ApplicationState,
    _NFTId: uint256,
    _from: EthAddress,
    _to: EthAddress,
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
        if (!appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)) {
            throw new NFTNotFoundError("NFT not found");
        }
        _from = _from.toLowerCase();
        if (_from == appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)!.seller.toLowerCase()) {
            throw new Error("Seller is Buyer error");
        }
        let data = appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)!;
        let tokenLock: TokenLockOption = tokenLockOptions[appState.chainId].find(x => x.address == data.lockedToken.address)!;
        let data1: VeTravaState = {
            id: data.id,
            votingPower: data.votingPower,
            tokenInVeTrava: {
                balances: data.lockedToken.amount,
                tokenLockOption: tokenLock,
            },
            unlockTime: data.end,
            rewardTokenBalance: {
                compoundAbleRewards: data.rwAmount,
                compoundedRewards: data.rwAmount,
                balances: data.rwAmount,
            },
        }


        let price = data.priceToken.amount;
        let priceTokenAddress = data.priceToken.address.toLowerCase();

        if(!appState[modeFrom].tokenBalances.has(priceTokenAddress.toLowerCase())) {
            appState = await updateTokenBalance(appState, _from, priceTokenAddress);
            }
        let balanceOfToken = BigNumber(0);            
        balanceOfToken = BigNumber(appState[modeFrom].tokenBalances.get(priceTokenAddress.toLowerCase())!);

        let newBalance = balanceOfToken.minus(price).toFixed();
        appState[modeFrom].tokenBalances.set(priceTokenAddress.toLowerCase(), newBalance);  
        appState[modeFrom].veTravaListState.veTravaList.set(_NFTId, data1);
        appState.NFTVeTravaMarketSellingState.sellingVeTrava = appState.NFTVeTravaMarketSellingState.sellingVeTrava.filter(x => x.id != _NFTId);
        
    } catch (err) {
        throw err;
      }
      return appState;
}