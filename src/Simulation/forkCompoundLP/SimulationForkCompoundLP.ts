import BigNumber from "bignumber.js";
import { ApplicationState, UserAsset } from "../../State";
import { EthAddress } from "../../utils/types";
import { updateUserTokenBalance } from "../basic";
import _ from "lodash";
import { getMode } from "../../utils/helper";
import { updateForkCompoundLPState } from "./UpdateStateAccount";
import { MAX_UINT256 } from "../../utils";

export async function calculateMaxAmountForkCompoundSupply(appState: ApplicationState, _entity_id: string, _tokenAddress: string, _from: EthAddress): Promise<BigNumber> {
    const tokenAddress = _tokenAddress.toLowerCase();
    const mode = getMode(appState, _from);

    if (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
        appState = await updateForkCompoundLPState(appState, _entity_id);
    }
    if (!appState[mode].tokenBalances.has(tokenAddress)) {
        appState = await updateUserTokenBalance(appState, tokenAddress);
    }
    const walletBalance = appState[mode].tokenBalances.get(tokenAddress)!;
    if (typeof walletBalance == undefined) {
        throw new Error("Token is not init in " + mode + " state!")
    }

    return BigNumber(appState[mode].tokenBalances.get(tokenAddress)!);
}

export async function calculateMaxAmountForkCompoundBorrow(appState: ApplicationState, _entity_id: string, _tokenAddress: string, _from: EthAddress): Promise<BigNumber> {
    //TODO
    return BigNumber(0);
}


export async function calculateMaxAmountForkCompoundWithdraw(appState: ApplicationState, _entity_id: string, _tokenAddress: string, _from: EthAddress): Promise<BigNumber> {
    const tokenAddress = _tokenAddress.toLowerCase();
    const mode = getMode(appState, _from);

    if (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
        appState = await updateForkCompoundLPState(appState, _entity_id);
    }
    if (!appState[mode].tokenBalances.has(tokenAddress)) {
        appState = await updateUserTokenBalance(appState, tokenAddress);
    }
    const walletBalance = appState[mode].tokenBalances.get(tokenAddress)!;
    if (typeof walletBalance == undefined) {
        throw new Error("Token is not init in " + mode + " state!")
    }

    const dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
    const deposited = dataWallet?.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress)?.amount;
    if (!deposited) {
        return BigNumber(0);
    }
    return BigNumber(deposited);
}

export async function calculateMaxAmountForkCompoundRepay(appState: ApplicationState, _entity_id: string, _tokenAddress: string, _from: EthAddress): Promise<BigNumber> {
    const tokenAddress = _tokenAddress.toLowerCase();
    const mode = getMode(appState, _from);

    if (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
        appState = await updateForkCompoundLPState(appState, _entity_id);
    }
    if (!appState[mode].tokenBalances.has(tokenAddress)) {
        appState = await updateUserTokenBalance(appState, tokenAddress);
    }
    const walletBalance = appState[mode].tokenBalances.get(tokenAddress)!;
    if (typeof walletBalance == undefined) {
        throw new Error("Token is not init in " + mode + " state!")
    }

    const dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
    const borrowed = dataWallet?.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress)?.amount;
    if (!borrowed) {
        return BigNumber(0);
    }
    return BigNumber(borrowed);
}

export async function SimulationSupplyForkCompoundLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkCompoundLPState.isFetch == false ){
            appState = await updateForkCompoundLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let  modeFrom = getMode(appState, _from);
        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = await calculateMaxAmountForkCompoundSupply(appState, _idLP, tokenAddress, _from);
        }

        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
        let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);   
        let price = dataAssets?.price;
            if (!price) {
                price = 0;
            }

            data.totalSupplyInUSD = BigNumber(data.totalSupplyInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            
            let dataWallet = appState[modeFrom].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: amount.toNumber(),
                valueInUSD: amount.multipliedBy(price).toNumber(),
                totalValue: amount.multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].reserves[0].deposit.push(newData);
        }
        else{
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: amount.toNumber()+dataInWallet.amount,
                valueInUSD: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                totalValue: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toNumber();
            dataWallet.dapps[0].depositInUSD = BigNumber(dataWallet.dapps[0].depositInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.minus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount); 
        appState[modeFrom].forkedCompoundLPState.set(_idLP, dataWallet);
        appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }

  export async function SimulationWithdrawForkCompoundLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkCompoundLPState.isFetch == false ){
            appState = await updateForkCompoundLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let  modeFrom = getMode(appState, _from);
        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = await calculateMaxAmountForkCompoundWithdraw(appState, _idLP, tokenAddress, _from);
          }
        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
        let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);   
        let price = dataAssets?.price;
            if (!price) {
                throw new Error("price not found");
            }

            data.totalSupplyInUSD = BigNumber(data.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            
            let dataWallet = appState[modeFrom].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: -amount.toNumber(),
                valueInUSD: -amount.multipliedBy(price).toNumber(),
                totalValue: -amount.multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].reserves[0].deposit.push(newData);
        }
        else{
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: -amount.toNumber()+dataInWallet.amount,
                valueInUSD: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                totalValue: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toNumber();
            dataWallet.dapps[0].depositInUSD = BigNumber(dataWallet.dapps[0].depositInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.plus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState[modeFrom].forkedCompoundLPState.set(_idLP, dataWallet);
        appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }

  export async function SimulationBorrowForkCompoundLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        //TODO
        // Amount max borrow, entered market 
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkCompoundLPState.isFetch == false ){
            appState = await updateForkCompoundLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let  modeFrom = getMode(appState, _from);
        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = await calculateMaxAmountForkCompoundBorrow(appState, _idLP, tokenAddress, _from);
        }

        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
        let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);   
        let price = dataAssets?.price;
            if (!price) {
                throw new Error("price not found");
            }

            data.totalBorrowInUSD = BigNumber(data.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            
            let dataWallet = appState[modeFrom].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: amount.toNumber(),
                valueInUSD: amount.multipliedBy(price).toNumber(),
                totalValue: amount.multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].reserves[0].borrow.push(newData);
        }
        else{
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: amount.toNumber()+dataInWallet.amount,
                valueInUSD: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                totalValue: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toNumber();
            dataWallet.dapps[0].borrowInUSD = BigNumber(dataWallet.dapps[0].borrowInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.plus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState[modeFrom].forkedCompoundLPState.set(_idLP, dataWallet);
        appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }


  export async function SimulationRepayForkCompoundLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        //TODO
        // Amount max borrow, entered market 
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkCompoundLPState.isFetch == false ){
            appState = await updateForkCompoundLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = await calculateMaxAmountForkCompoundRepay(appState, _idLP, tokenAddress, _from);
          }
        let  modeFrom = getMode(appState, _from);

        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
        let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);   
        let price = dataAssets?.price;
            if (!price) {
                throw new Error("price not found");
            }

            data.totalBorrowInUSD = BigNumber(data.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            
            let dataWallet = appState[modeFrom].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: -amount.toNumber(),
                valueInUSD: -amount.multipliedBy(price).toNumber(),
                totalValue: -amount.multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].reserves[0].borrow.push(newData);
        }
        else{
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: -amount.toNumber()+dataInWallet.amount,
                valueInUSD: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                totalValue: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toNumber();
            dataWallet.dapps[0].borrowInUSD = BigNumber(dataWallet.dapps[0].borrowInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.minus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState[modeFrom].forkedCompoundLPState.set(_idLP, dataWallet);
        appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }