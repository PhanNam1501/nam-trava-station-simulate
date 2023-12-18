import BigNumber from "bignumber.js";
import { ApplicationState, ForkedAave, UserAsset } from "../../State";
import { EthAddress } from "../../utils/types";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic";
import { MAX_UINT256 } from "../../utils";
import { calculateMaxAmountBorrow, calculateMaxAmountRepay, calculateMaxAmountSupply, calculateMaxAmountWithdraw, updateLPtTokenInfo } from "../trava";
import _ from "lodash";
import { getMode } from "../../utils/helper";
import { updateForkAaveLPState } from "./UpdateStateAccount";
import { LimitExceededError } from "web3";

export async function SimulationSupplyForkAaveLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkAaveLPState.isFetch == false ){
            updateForkAaveLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let  modeFrom = getMode(appState, _from);
        if (
            amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)
            ) {
            amount = calculateMaxAmountSupply(appState, tokenAddress, modeFrom)
        }


        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkAaveLPState.forkAaveLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
            let price = data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.price;
            if (!price) {
                throw new Error("price not found");
            }
            const asset = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            if (asset) {
                asset.totalSupplyInUSD = Number(BigNumber(asset.totalSupplyInUSD || 0).plus(amount.multipliedBy(price)).toFixed(0));
            }
            data.totalSupplyInUSD = Number(BigNumber(data.totalSupplyInUSD || 0).plus(amount.multipliedBy(price)).toFixed(0));
            
            let dataWallet = appState[modeFrom].forkedAaveLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            // data.numberOfLenders = Number(BigNumber(data.numberOfLenders || 0).plus(1).toFixed(0));
            // data.numberOfUsers = Number(BigNumber(data.numberOfUsers || 0).plus(1).toFixed(0));
            let newData: UserAsset = {
                // key: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.id || "",
                // name: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.symbol || "",
                amount: Number(amount.toFixed()),
                valueInUSD: Number(amount.multipliedBy(price).toFixed(0)),
                // imgUrl: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.multipliedBy(price).toFixed(0)),
            };
            dataWallet.dapps[0].reserves[0].deposit.push(newData);
        }
        else{
            let newData: UserAsset = {
                // key: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.id || "",
                // name: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.symbol || "",
                amount: Number(amount.toFixed())+dataInWallet.amount,
                valueInUSD: Number(amount.plus(dataInWallet.amount).multipliedBy(price).toFixed()),
                // imgUrl: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.plus(dataInWallet.amount).multipliedBy(price).toFixed()),
            };
            dataWallet.dapps[0].value = Number(BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toFixed());
            dataWallet.dapps[0].depositInUSD = Number(BigNumber(dataWallet.dapps[0].depositInUSD || 0).plus(amount.multipliedBy(price)).toFixed());
            dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.minus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount); 
        appState[modeFrom].forkedAaveLPState.set(_idLP, dataWallet);
        appState.forkAaveLPState.forkAaveLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }

  export async function SimulationWithdrawForkAaveLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkAaveLPState.isFetch == false ){
            updateForkAaveLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let  modeFrom = getMode(appState, _from);
        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = calculateMaxAmountWithdraw(appState, tokenAddress);
          }

        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkAaveLPState.forkAaveLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
            let price = data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.price;
            if (!price) {
                throw new Error("price not found");
            }
            const asset = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            if (asset) {
                asset.totalSupplyInUSD = Number(BigNumber(asset.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toFixed(0));
            }
            data.totalSupplyInUSD = Number(BigNumber(data.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toFixed(0));
            
            let dataWallet = appState[modeFrom].forkedAaveLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            // data.numberOfLenders = Number(BigNumber(data.numberOfLenders || 0).plus(1).toFixed(0));
            // data.numberOfUsers = Number(BigNumber(data.numberOfUsers || 0).plus(1).toFixed(0));
            let newData: UserAsset = {
                // key: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.id || "",
                // name: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.symbol || "",
                amount: -Number(amount.toFixed()),
                valueInUSD: -Number(amount.multipliedBy(price).toFixed(0)),
                // imgUrl: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.imgUrl || "",
                totalValue: -Number(amount.multipliedBy(price).toFixed(0)),
            };
            dataWallet.dapps[0].reserves[0].deposit.push(newData);
        }
        else{
            let newData: UserAsset = {
                // key: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.id || "",
                // name: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.symbol || "",
                amount: -Number(amount.toFixed())+dataInWallet.amount,
                valueInUSD: Number(amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toFixed()),
                // imgUrl: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toFixed()),
            };
            dataWallet.dapps[0].value = Number(BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toFixed());
            dataWallet.dapps[0].depositInUSD = Number(BigNumber(dataWallet.dapps[0].depositInUSD || 0).minus(amount.multipliedBy(price)).toFixed());
            dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.plus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState[modeFrom].forkedAaveLPState.set(_idLP, dataWallet);
        appState.forkAaveLPState.forkAaveLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }

  export async function SimulationBorrowForkAaveLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkAaveLPState.isFetch == false ){
            updateForkAaveLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let  modeFrom = getMode(appState, _from);
        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = calculateMaxAmountBorrow(
              appState,
              tokenAddress
            )
          }

        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkAaveLPState.forkAaveLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
            let price = data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.price;
            if (!price) {
                throw new Error("price not found");
            }
            const asset = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            if (asset) {
                asset.totalBorrowInUSD = Number(BigNumber(asset.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toFixed(0));
            }
            data.totalBorrowInUSD = Number(BigNumber(data.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toFixed(0));
            
            let dataWallet = appState[modeFrom].forkedAaveLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            // data.numberOfLenders = Number(BigNumber(data.numberOfLenders || 0).plus(1).toFixed(0));
            // data.numberOfUsers = Number(BigNumber(data.numberOfUsers || 0).plus(1).toFixed(0));
            let newData: UserAsset = {
                // key: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.id || "",
                // name: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.symbol || "",
                amount: Number(amount.toFixed()),
                valueInUSD: Number(amount.multipliedBy(price).toFixed(0)),
                // imgUrl: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.multipliedBy(price).toFixed(0)),
            };
            dataWallet.dapps[0].reserves[0].borrow.push(newData);
        }
        else{
            let newData: UserAsset = {
                // key: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.id || "",
                // name: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.symbol || "",
                amount: Number(amount.toFixed())+dataInWallet.amount,
                valueInUSD: Number(amount.plus(dataInWallet.amount).multipliedBy(price).toFixed()),
                // imgUrl: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.plus(dataInWallet.amount).multipliedBy(price).toFixed()),
            };
            dataWallet.dapps[0].value = Number(BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toFixed());
            dataWallet.dapps[0].borrowInUSD = Number(BigNumber(dataWallet.dapps[0].borrowInUSD || 0).plus(amount.multipliedBy(price)).toFixed());
            dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.plus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState[modeFrom].forkedAaveLPState.set(_idLP, dataWallet);
        appState.forkAaveLPState.forkAaveLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }


  export async function SimulationRepayForkAaveLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkAaveLPState.isFetch == false ){
            updateForkAaveLPState(appState, _idLP);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let  modeFrom = getMode(appState, _from);
        if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            amount = calculateMaxAmountRepay(appState, tokenAddress, modeFrom);
          }

        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkAaveLPState.forkAaveLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
        let price = data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.price;
        if (!price) {
            throw new Error("price not found");
        }
        const asset = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
        if (asset) {
            asset.totalBorrowInUSD = Number(BigNumber(asset.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toFixed(0));
        }
        data.totalBorrowInUSD = Number(BigNumber(data.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toFixed(0));
        
        let dataWallet = appState[modeFrom].forkedAaveLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            // data.numberOfLenders = Number(BigNumber(data.numberOfLenders || 0).plus(1).toFixed(0));
            // data.numberOfUsers = Number(BigNumber(data.numberOfUsers || 0).plus(1).toFixed(0));
            let newData: UserAsset = {
                // key: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.id || "",
                // name: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.symbol || "",
                amount: -Number(amount.toFixed()),
                valueInUSD: -Number(amount.multipliedBy(price).toFixed(0)),
                // imgUrl: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.imgUrl || "",
                totalValue: -Number(amount.multipliedBy(price).toFixed(0)),
            };
            dataWallet.dapps[0].reserves[0].borrow.push(newData);
        }
        else{
            let newData: UserAsset = {
                // key: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.id || "",
                // name: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.symbol || "",
                amount: -Number(amount.toFixed())+dataInWallet.amount,
                valueInUSD: Number(amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toFixed()),
                // imgUrl: data.markets[0].assets.find((asset) => asset.address == tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toFixed()),
            };
            dataWallet.dapps[0].value = Number(BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toFixed());
            dataWallet.dapps[0].borrowInUSD = Number(BigNumber(dataWallet.dapps[0].borrowInUSD || 0).minus(amount.multipliedBy(price)).toFixed());
            dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.minus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState[modeFrom].forkedAaveLPState.set(_idLP, dataWallet);
        appState.forkAaveLPState.forkAaveLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }