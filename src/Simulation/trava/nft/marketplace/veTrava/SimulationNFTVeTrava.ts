import { TokenLock, VeTravaState } from "../../../../../State";
import { ApplicationState } from "../../../../../State/ApplicationState";
import { getMode } from "../../../../../utils/helper";
import { EthAddress, wallet_mode } from "../../../../../utils/types";
import { TokenLockOption, getTokenRatio, tokenLockOptions, updateTravaGovernanceState } from "../../../governance";
import { SellingVeTravaType, tokenInfo } from "../../helpers";
import { updateSellingVeTrava } from "./UpdateStateAccount";
import BEP20ABI from "../../../../../abis/BEP20.json";
import { Contract } from "ethers";
import BigNumber from "bignumber.js";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../../../../basic";

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
            console.log(data);
            appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
            const tokenLockContract = new Contract(
                _priceTokenAddress,
                BEP20ABI,
                appState.web3
            )
            let tokenLockDecimal = await tokenLockContract.decimals();
            let priceToken: tokenInfo = {
                address: _priceTokenAddress,
                decimals: tokenLockDecimal.toString(),
            }
            let tokenLocked: tokenInfo = {
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
            let tokenLock: TokenLockOption = tokenLockOptions[appState.chainId].find(x => x.address == data.tokenLocked.address)!;
            let data1: VeTravaState = {
                id: data.id,
                votingPower: data.votingPower,
                tokenInVeTrava: {
                    balances: data.amount,
                    tokenLockOption: tokenLock,
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


export async function simulateNFTVeTravaBuy(
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
        if (appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId) && _from != appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)!.seller) {
            let data = appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)!;
            let tokenLock: TokenLockOption = tokenLockOptions[appState.chainId].find(x => x.address == data.tokenLocked.address)!;
            let data1: VeTravaState = {
                id: data.id,
                votingPower: data.votingPower,
                tokenInVeTrava: {
                    balances: data.amount,
                    tokenLockOption: tokenLock,
                },
                unlockTime: data.end,
                rewardTokenBalance: {
                    compoundAbleRewards: data.rwAmount,
                    compoundedRewards: data.rwAmount,
                    balances: data.rwAmount,
                },
            }

            // TEST
            //modeFrom = "walletState";

            let price = data.price;
            let priceTokenAddress = data.priceToken.address.toLowerCase();

            // TEST
            // let priceTokenAddress = getAddr("TRAVA_TOKEN");

            if (modeFrom == "walletState") {
                appState = await updateUserTokenBalance(appState, priceTokenAddress);
            }
            else if (modeFrom == "smartWalletState") {
                appState = await updateSmartWalletTokenBalance(appState, priceTokenAddress);
            }
            let balanceOfToken = BigNumber(0);
            if (appState[modeFrom].tokenBalances.has(priceTokenAddress.toLowerCase())) {
                balanceOfToken = BigNumber(appState[modeFrom].tokenBalances.get(priceTokenAddress.toLowerCase())!);
                console.log(appState[modeFrom].tokenBalances);
            }
            let newBalance = balanceOfToken.minus(price).toFixed();
            appState[modeFrom].tokenBalances.set(priceTokenAddress.toLowerCase(), newBalance);  
            appState[modeFrom].veTravaListState.veTravaList.set(_NFTId, data1);
            appState.NFTVeTravaMarketSellingState.sellingVeTrava = appState.NFTVeTravaMarketSellingState.sellingVeTrava.filter(x => x.id != _NFTId);
            console.log(appState[modeFrom].tokenBalances);
        }
    } catch (err) {
        throw err;
      }
      return appState;
}