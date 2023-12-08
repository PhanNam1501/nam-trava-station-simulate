import BigNumber from "bignumber.js";
import { ApplicationState, ForkedCompound, UserAsset } from "../../State";
import { EthAddress } from "../../utils/types";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic";
import { MAX_UINT256 } from "../../utils";
import { calculateMaxAmountSupply, updateLPtTokenInfo } from "../trava";
import _ from "lodash";
import { getMode } from "../../utils/helper";

export async function SimulationSupplyForkCompoundLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _idLP: string,
    _tokenAddress: EthAddress,
    _amount: string
  ): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        const appState = { ...appState1 };
        if (
            amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)
            ) {
            amount = calculateMaxAmountSupply(appState, _tokenAddress, "walletState")
            }

        _tokenAddress = _tokenAddress.toLowerCase();
        _from = _from.toLowerCase();
        let  modeFrom = getMode(appState, _from);

        if (!appState[modeFrom].tokenBalances.has(_tokenAddress)) {
            await updateUserTokenBalance(appState, _tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(_tokenAddress)!
        );
        const newAmount = tokenAmount.minus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(_tokenAddress, newAmount);

        let data: ForkedCompound | undefined = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
            let price = data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.price;
            if (!price) {
                throw new Error("price not found");
            }
            const asset = data.markets[0].assets.find((asset) => asset.address == _tokenAddress);
            if (asset) {
                asset.totalSupplyInUSD = Number(BigNumber(asset.totalSupplyInUSD || 0).plus(amount.multipliedBy(price)).toFixed(0));
            }
            data.totalSupplyInUSD = Number(BigNumber(data.totalSupplyInUSD || 0).plus(amount.multipliedBy(price)).toFixed(0));
            
            let dataWallet = appState[modeFrom].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == _tokenAddress);
        if (!dataInWallet) {
            data.numberOfLenders = Number(BigNumber(data.numberOfLenders || 0).plus(1).toFixed(0));
            data.numberOfUsers = Number(BigNumber(data.numberOfUsers || 0).plus(1).toFixed(0));
            let newData: UserAsset = {
                key: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.id || "",
                name: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.name || "",
                type: "token",
                address: _tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.symbol || "",
                amount: Number(amount.toFixed()),
                valueInUSD: Number(amount.multipliedBy(price).toFixed(0)),
                imgUrl: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.multipliedBy(price).toFixed(0)),
            };
            dataWallet.dapps[0].reserves[0].deposit.push(newData);
        }
        else{
            let newData: UserAsset = {
                key: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.id || "",
                name: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.name || "",
                type: "token",
                address: _tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.symbol || "",
                amount: Number(amount.toFixed())+dataInWallet.amount,
                valueInUSD: Number(amount.plus(dataInWallet.amount).multipliedBy(price).toFixed()),
                imgUrl: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.plus(dataInWallet.amount).multipliedBy(price).toFixed()),
            };
            dataWallet.dapps[0].value = Number(BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toFixed());
            dataWallet.dapps[0].depositInUSD = Number(BigNumber(dataWallet.dapps[0].depositInUSD || 0).plus(amount.multipliedBy(price)).toFixed());
            dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                if (reserve.address == _tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
            
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
        const appState = { ...appState1 };
        // Comming Soon .......
        // if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
        //     amount = calculateMaxAmountWithdraw(appState, _tokenAddress);
        //   }
        _tokenAddress = _tokenAddress.toLowerCase();
        _from = _from.toLowerCase();
        let  modeFrom = getMode(appState, _from);

        if (!appState[modeFrom].tokenBalances.has(_tokenAddress)) {
            await updateUserTokenBalance(appState, _tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(_tokenAddress)!
        );
        const newAmount = tokenAmount.plus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(_tokenAddress, newAmount);

        let data: ForkedCompound | undefined = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
            let price = data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.price;
            if (!price) {
                throw new Error("price not found");
            }
            const asset = data.markets[0].assets.find((asset) => asset.address == _tokenAddress);
            if (asset) {
                asset.totalSupplyInUSD = Number(BigNumber(asset.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toFixed(0));
            }
            data.totalSupplyInUSD = Number(BigNumber(data.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toFixed(0));
            
            let dataWallet = appState[modeFrom].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == _tokenAddress);
        if (!dataInWallet) {
            data.numberOfLenders = Number(BigNumber(data.numberOfLenders || 0).plus(1).toFixed(0));
            data.numberOfUsers = Number(BigNumber(data.numberOfUsers || 0).plus(1).toFixed(0));
            let newData: UserAsset = {
                key: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.id || "",
                name: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.name || "",
                type: "token",
                address: _tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.symbol || "",
                amount: -Number(amount.toFixed()),
                valueInUSD: -Number(amount.multipliedBy(price).toFixed(0)),
                imgUrl: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.imgUrl || "",
                totalValue: -Number(amount.multipliedBy(price).toFixed(0)),
            };
            dataWallet.dapps[0].reserves[0].deposit.push(newData);
        }
        else{
            let newData: UserAsset = {
                key: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.id || "",
                name: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.name || "",
                type: "token",
                address: _tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.symbol || "",
                amount: -Number(amount.toFixed())+dataInWallet.amount,
                valueInUSD: Number(amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toFixed()),
                imgUrl: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toFixed()),
            };
            dataWallet.dapps[0].value = Number(BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toFixed());
            dataWallet.dapps[0].depositInUSD = Number(BigNumber(dataWallet.dapps[0].depositInUSD || 0).minus(amount.multipliedBy(price)).toFixed());
            dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                if (reserve.address == _tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
            
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
        let amount = BigNumber(_amount);
        const appState = { ...appState1 };
        // Comming Soon .......
        // if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
        //     amount = calculateMaxAmountBorrow(
        //       appState,
        //       _tokenAddress
        //     )
        //   }
        _tokenAddress = _tokenAddress.toLowerCase();
        _from = _from.toLowerCase();
        let  modeFrom = getMode(appState, _from);

        if (!appState[modeFrom].tokenBalances.has(_tokenAddress)) {
            await updateUserTokenBalance(appState, _tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(_tokenAddress)!
        );
        const newAmount = tokenAmount.plus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(_tokenAddress, newAmount);

        let data: ForkedCompound | undefined = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
            let price = data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.price;
            if (!price) {
                throw new Error("price not found");
            }
            const asset = data.markets[0].assets.find((asset) => asset.address == _tokenAddress);
            if (asset) {
                asset.totalBorrowInUSD = Number(BigNumber(asset.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toFixed(0));
            }
            data.totalBorrowInUSD = Number(BigNumber(data.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toFixed(0));
            
            let dataWallet = appState[modeFrom].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == _tokenAddress);
        if (!dataInWallet) {
            data.numberOfLenders = Number(BigNumber(data.numberOfLenders || 0).plus(1).toFixed(0));
            data.numberOfUsers = Number(BigNumber(data.numberOfUsers || 0).plus(1).toFixed(0));
            let newData: UserAsset = {
                key: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.id || "",
                name: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.name || "",
                type: "token",
                address: _tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.symbol || "",
                amount: Number(amount.toFixed()),
                valueInUSD: Number(amount.multipliedBy(price).toFixed(0)),
                imgUrl: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.multipliedBy(price).toFixed(0)),
            };
            dataWallet.dapps[0].reserves[0].borrow.push(newData);
        }
        else{
            let newData: UserAsset = {
                key: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.id || "",
                name: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.name || "",
                type: "token",
                address: _tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.symbol || "",
                amount: Number(amount.toFixed())+dataInWallet.amount,
                valueInUSD: Number(amount.plus(dataInWallet.amount).multipliedBy(price).toFixed()),
                imgUrl: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.plus(dataInWallet.amount).multipliedBy(price).toFixed()),
            };
            dataWallet.dapps[0].value = Number(BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toFixed());
            dataWallet.dapps[0].borrowInUSD = Number(BigNumber(dataWallet.dapps[0].borrowInUSD || 0).plus(amount.multipliedBy(price)).toFixed());
            dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                if (reserve.address == _tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
            
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
        let amount = BigNumber(_amount);
        const appState = { ...appState1 };
        // Comming Soon .......
        // if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
        //     amount = calculateMaxAmountRepay(appState, _tokenAddress, "walletState");
        //   }
        _tokenAddress = _tokenAddress.toLowerCase();
        _from = _from.toLowerCase();
        let  modeFrom = getMode(appState, _from);

        if (!appState[modeFrom].tokenBalances.has(_tokenAddress)) {
            await updateUserTokenBalance(appState, _tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(_tokenAddress)!
        );
        const newAmount = tokenAmount.minus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(_tokenAddress, newAmount);

        let data: ForkedCompound | undefined = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
        if (!data) {
            throw new Error("data not found");
        }
            let price = data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.price;
            if (!price) {
                throw new Error("price not found");
            }
            const asset = data.markets[0].assets.find((asset) => asset.address == _tokenAddress);
            if (asset) {
                asset.totalBorrowInUSD = Number(BigNumber(asset.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toFixed(0));
            }
            data.totalBorrowInUSD = Number(BigNumber(data.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toFixed(0));
            
            let dataWallet = appState[modeFrom].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == _tokenAddress);
        if (!dataInWallet) {
            data.numberOfLenders = Number(BigNumber(data.numberOfLenders || 0).plus(1).toFixed(0));
            data.numberOfUsers = Number(BigNumber(data.numberOfUsers || 0).plus(1).toFixed(0));
            let newData: UserAsset = {
                key: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.id || "",
                name: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.name || "",
                type: "token",
                address: _tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.symbol || "",
                amount: -Number(amount.toFixed()),
                valueInUSD: -Number(amount.multipliedBy(price).toFixed(0)),
                imgUrl: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.imgUrl || "",
                totalValue: -Number(amount.multipliedBy(price).toFixed(0)),
            };
            dataWallet.dapps[0].reserves[0].borrow.push(newData);
        }
        else{
            let newData: UserAsset = {
                key: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.key || "",
                id: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.id || "",
                name: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.name || "",
                type: "token",
                address: _tokenAddress,
                symbol: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.symbol || "",
                amount: -Number(amount.toFixed())+dataInWallet.amount,
                valueInUSD: Number(amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toFixed()),
                imgUrl: data.markets[0].assets.find((asset) => asset.address == _tokenAddress)?.imgUrl || "",
                totalValue: Number(amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toFixed()),
            };
            dataWallet.dapps[0].value = Number(BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toFixed());
            dataWallet.dapps[0].borrowInUSD = Number(BigNumber(dataWallet.dapps[0].borrowInUSD || 0).minus(amount.multipliedBy(price)).toFixed());
            dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                if (reserve.address == _tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
            
        appState[modeFrom].forkedCompoundLPState.set(_idLP, dataWallet);
        appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data!);

      return appState;
    } catch (err) {
      throw err;
    }
  }