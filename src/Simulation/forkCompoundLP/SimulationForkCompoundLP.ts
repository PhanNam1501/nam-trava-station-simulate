import BigNumber from "bignumber.js";
import { ApplicationState, UserAsset, inputCollateral } from "../../State";
import { EthAddress } from "../../utils/types";
import { updateUserTokenBalance } from "../basic";
import _, { sum } from "lodash";
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

export async function calculateMaxAmountForkCompoundBorrow(appState1: ApplicationState, _entity_id: string, _tokenAddress: string, _from: EthAddress): Promise<BigNumber> {
    let appState = { ...appState1 };
    let mode = getMode(appState, _from);
    let tokenAddress = _tokenAddress.toLowerCase();
    let dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
        if (!dataWallet) {
            throw new Error("data not found");
        }
    let assetsIn = dataWallet.dapps[0].reserves[0].assetsIn;
    let sumSupplyByUSD = BigNumber(0);
    let sumBorrowedByUSD = BigNumber(0);
    for (let asset of assetsIn){
        let assetTokenDetail = cTokenToDetailTokenAddress(appState, _from, _entity_id, asset);
        if (!assetTokenDetail || assetTokenDetail == ""){
            throw new Error("assetTokenDetail not found");
        }
        
        let dataAssetDeposit = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == assetTokenDetail);
        let dataAssetBorrow = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == assetTokenDetail);
        let maxLTV = dataWallet.detailTokenInPool.get(assetTokenDetail)?.maxLTV;
        if (dataAssetDeposit && maxLTV){
            sumSupplyByUSD = sumSupplyByUSD.plus(BigNumber(dataAssetDeposit.valueInUSD).multipliedBy(maxLTV));
        }
        if (dataAssetBorrow && maxLTV){
            sumBorrowedByUSD = sumBorrowedByUSD.plus(BigNumber(dataAssetBorrow.valueInUSD).multipliedBy(maxLTV));
        }
    }
    let tokenInfo = appState[mode].forkedCompoundLPState.get(_entity_id)?.detailTokenInPool.get(tokenAddress);
    if (!tokenInfo){
        throw new Error("tokenInfo not found");
    }
    let tokenPrice = tokenInfo.price;
    return (sumSupplyByUSD.minus(sumBorrowedByUSD)).dividedBy(tokenPrice);
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
    return BigNumber.max(BigNumber.min(walletBalance, borrowed), 0);
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
        if (amount.toFixed() == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
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
            
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_idLP);
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
        let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
        if (!dataToken){
            throw new Error("dataToken not found");
        }
        dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) + amount.toNumber()).toString();
        dataWallet.detailTokenInPool.set(tokenAddress, dataToken);

        let cTokenAddress = detailTokenAddressToCToken(appState, _from, _idLP, tokenAddress);
        const cTokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(cTokenAddress)!
        );
        const newcTokenAmount = cTokenAmount.plus(amount).toFixed();
        appState[modeFrom].tokenBalances.set(cTokenAddress, newcTokenAmount);

        const newAmount = tokenAmount.minus(amount).toFixed();
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount); 
        appState.smartWalletState.forkedCompoundLPState.set(_idLP, dataWallet);
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
        if (amount.toFixed() == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
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
            
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_idLP);
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
        let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
        if (!dataToken){
            throw new Error("dataToken not found");
        }
        dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) - amount.toNumber()).toString();
        dataToken.cToken.balances = (Number(dataToken.cToken.balances) + amount.toNumber()).toString();
        dataWallet.detailTokenInPool.set(tokenAddress, dataToken);

        let cTokenAddress = detailTokenAddressToCToken(appState, _from, _idLP, tokenAddress);
        const cTokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(cTokenAddress)!
        );
        const newcTokenAmount = cTokenAmount.minus(amount).toFixed();
        appState[modeFrom].tokenBalances.set(cTokenAddress, newcTokenAmount);

        const newAmount = tokenAmount.plus(amount).toFixed();
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState.smartWalletState.forkedCompoundLPState.set(_idLP, dataWallet);
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
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkCompoundLPState.isFetch == false ){
            appState = await updateForkCompoundLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        
        let  modeFrom = getMode(appState, _from);
        if (amount.toFixed() == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
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
            
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_idLP);
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
        let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
        if (!dataToken){
            throw new Error("dataToken not found");
        }
        dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) - amount.toNumber()).toString();
        dataWallet.detailTokenInPool.set(tokenAddress, dataToken);

        let assetsIn = dataWallet.dapps[0].reserves[0].assetsIn;
        let cTokenAddress = detailTokenAddressToCToken(appState, _from, _idLP, tokenAddress);
        if (!assetsIn.find((asset) => asset == cTokenAddress)){
            dataWallet.dapps[0].reserves[0].assetsIn.push(cTokenAddress);
        }
        const newAmount = tokenAmount.plus(amount).toFixed();
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState.smartWalletState.forkedCompoundLPState.set(_idLP, dataWallet);
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
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkCompoundLPState.isFetch == false ){
            appState = await updateForkCompoundLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        
        if (amount.toFixed() == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
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
            
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_idLP);
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
        let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
        if (!dataToken){
            throw new Error("dataToken not found");
        }
        dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) + amount.toNumber()).toString();
        dataWallet.detailTokenInPool.set(tokenAddress, dataToken);

        const newAmount = tokenAmount.minus(amount).toFixed();
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState.smartWalletState.forkedCompoundLPState.set(_idLP, dataWallet);
        appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }

  export async function SimulationCollateral(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _collateralList: Array<inputCollateral>,
  ): Promise<ApplicationState> {
    try {
        let appState = { ...appState1 };
        let mode = getMode(appState, _from);
        let dataWallet = appState[mode].forkedCompoundLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
            }
        let assetsIn = dataWallet.dapps[0].reserves[0].assetsIn;
        let assetsOut: string[] = [];
        for (let collateral of _collateralList){
            let dataTokenAddress = dataWallet.detailTokenInPool.get(collateral.tokenAddress);
            if (!dataTokenAddress){
                throw new Error("TokenAddress not found");
            }
            let cTokenAddress = dataTokenAddress.cToken.address;
            if (collateral.enableAsColl == 1){
                if (!(assetsIn.find((asset) => asset == cTokenAddress))){
                    assetsIn.push(cTokenAddress)
                }
            }
            else if(collateral.enableAsColl == 0){
                if (assetsIn.find((asset) => asset == cTokenAddress)){
                    assetsOut.push(cTokenAddress)
                    assetsIn = assetsIn.filter((asset) => asset != cTokenAddress);
                }
            }
            else{
                throw new Error("collateral.enableAsColl must be 0 or 1");
            }
        }
        
        let tokenBorrowing = [];
        // totalCollateral (sum Supply By USD Assets In Multiplied LTV)
        let totalCollateral = BigNumber(0);
        let sumBorrowByUSD = BigNumber(0);
        for (let collateral of _collateralList){
            let dataTokenAddress = dataWallet.detailTokenInPool.get(collateral.tokenAddress)
            if (!dataTokenAddress){
                throw new Error("TokenAddress not found");
            }
            let cTokenAddress = dataTokenAddress.cToken.address;
            let maxLTV = dataTokenAddress.maxLTV;
            let dataAssetDeposit = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == collateral.tokenAddress);
            if (dataAssetDeposit){
                if (assetsIn.find((asset) => asset == cTokenAddress)){
                    totalCollateral = totalCollateral.plus(BigNumber(dataAssetDeposit.valueInUSD).multipliedBy(maxLTV));
                }
            }
            let dataAssetBorrow = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == collateral.tokenAddress);
            if (dataAssetBorrow){
                sumBorrowByUSD = sumBorrowByUSD.plus(dataAssetBorrow.valueInUSD);
                if (dataAssetBorrow.amount != 0){
                    tokenBorrowing.push(cTokenAddress)
                }
            }
        }
        if (assetsOut.length > 0){
            for (let asset of assetsOut){
                if (tokenBorrowing.find((token) => token == asset)){
                    throw new Error("Can't remove collateral when borrowing")
                }
            }
            if (totalCollateral.isLessThan(sumBorrowByUSD)){
                throw new Error("Can't remove collateral, please repay first")
            }
        }
        dataWallet.dapps[0].reserves[0].assetsIn = assetsIn;
        appState[mode].forkedCompoundLPState.set(_idLP, dataWallet);
      return appState;
    } catch (err) {
      throw err;
    }
  }

  export function cTokenToDetailTokenAddress(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    cTokenAddress: EthAddress,
  ): string {
    try {
        let appState = { ...appState1 };
        let mode = getMode(appState, _from);
        let dataWallet = appState[mode].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }
        let dataTokenAddress = dataWallet.detailTokenInPool;
        if (!dataTokenAddress){
            throw new Error("TokenAddress not found");
        }
        let detailTokenAddress: EthAddress = "";
        for (const [key, value] of dataTokenAddress) {
            if (value.cToken.address == cTokenAddress){
                detailTokenAddress = key;
            }
        }
        return detailTokenAddress;
    } catch (err) {
        throw err;
    }
}

export function detailTokenAddressToCToken(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    detailTokenAddress: EthAddress,
  ): string {
    try {
        let appState = { ...appState1 };
        let mode = getMode(appState, _from);
        let dataWallet = appState[mode].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }
        let dataTokenAddress = dataWallet.detailTokenInPool;
        if (!dataTokenAddress){
            throw new Error("TokenAddress not found");
        }
        let cTokenAddress: EthAddress = "";
        for (const [key, value] of dataTokenAddress) {
            if (key == detailTokenAddress){
                cTokenAddress = value.cToken.address;
            }
        }
        return cTokenAddress;
    } catch (err) {
        throw err;
    }
}

export async function SimulationClaimRewardsForkCompoundLP(
    appState1: ApplicationState,
    _idLP: string
  ): Promise<ApplicationState> {
    try {
        let appState = { ...appState1 };
    //     if (appState.forkCompoundLPState.isFetch == false ){
    //         appState = await updateForkCompoundLPState(appState, _idLP);
    //     }
    //     // Co trong market
    //     const tokenAddress = _tokenAddress.toLowerCase();
        
    //     if (!appState.smartWalletState.tokenBalances.has(tokenAddress)) {
    //         appState = await updateUserTokenBalance(appState, tokenAddress);
    //     }

    //     const tokenAmount = BigNumber(
    //         appState.smartWalletState.tokenBalances.get(tokenAddress)!
    //     );

    //     let data = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
    //     if (!data) {
    //         throw new Error("data not found");
    //     }
    //     let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);   
    //     let price = dataAssets?.price;
    //         if (!price) {
    //             throw new Error("price not found");
    //         }

    //         data.totalSupplyInUSD = BigNumber(data.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            
    //         let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_idLP);
    //     if (!dataWallet) {
    //         throw new Error("data not found");
    //     }

    //     let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
    //     if (!dataInWallet) {
    //         let newData: UserAsset = {
    //             id: dataAssets?.id || "",
    //             type: "token",
    //             address: tokenAddress,
    //             symbol: dataAssets?.symbol || "",
    //             amount: -amount.toNumber(),
    //             valueInUSD: -amount.multipliedBy(price).toNumber(),
    //             totalValue: -amount.multipliedBy(price).toNumber(),
    //         };
    //         dataWallet.dapps[0].reserves[0].deposit.push(newData);
    //     }
    //     else{
    //         let newData: UserAsset = {
    //             id: dataAssets?.id || "",
    //             type: "token",
    //             address: tokenAddress,
    //             symbol: dataAssets?.symbol || "",
    //             amount: -amount.toNumber()+dataInWallet.amount,
    //             valueInUSD: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
    //             totalValue: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
    //         };
    //         dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toNumber();
    //         dataWallet.dapps[0].depositInUSD = BigNumber(dataWallet.dapps[0].depositInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
    //         dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
    //             if (reserve.address == tokenAddress) {
    //                 return newData;
    //             }
    //             return reserve;
    //         });
    //     }
    //     let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
    //     if (!dataToken){
    //         throw new Error("dataToken not found");
    //     }
    //     dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) - amount.toNumber()).toString();
    //     dataToken.cToken.balances = (Number(dataToken.cToken.balances) + amount.toNumber()).toString();
    //     dataWallet.detailTokenInPool.set(tokenAddress, dataToken);

    //     let cTokenAddress = detailTokenAddressToCToken(appState, _from, _idLP, tokenAddress);
    //     const cTokenAmount = BigNumber(
    //         appState[modeFrom].tokenBalances.get(cTokenAddress)!
    //     );
    //     const newcTokenAmount = cTokenAmount.minus(amount).toFixed();
    //     appState[modeFrom].tokenBalances.set(cTokenAddress, newcTokenAmount);

    //     const newAmount = tokenAmount.plus(amount).toFixed();
    //     appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
    //     appState.smartWalletState.forkedCompoundLPState.set(_idLP, dataWallet);
    //     appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data!);

        return appState;
    } catch (err) {
      throw err;
    }
  }