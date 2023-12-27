var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import BigNumber from "bignumber.js";
import { updateUserTokenBalance } from "../basic";
// Comming Soon .......
// import { calculateMaxAmountBorrow, calculateMaxAmountRepay, calculateMaxAmountSupply, calculateMaxAmountWithdraw, updateLPtTokenInfo } from "../trava";
import { getMode } from "../../utils/helper";
import { updateForkAaveLPState } from "./UpdateStateAccount";
export function SimulationSupplyForkAaveLP(appState1, _from, _idLP, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkAaveLPState.isFetch == false) {
                updateForkAaveLPState(appState, _idLP);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = getMode(appState, _from);
            // Comming Soon .......
            // if (
            //     amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)
            //     ) {
            //     amount = calculateMaxAmountSupply(appState, tokenAddress, modeFrom)
            // }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield updateUserTokenBalance(appState, tokenAddress);
            }
            const tokenAmount = BigNumber(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkAaveLPState.forkAaveLP.get(_idLP);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalSupplyInUSD = BigNumber(data.totalSupplyInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState[modeFrom].forkedAaveLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
            if (!dataInWallet) {
                // data.numberOfLenders = BigNumber(data.numberOfLenders || 0).plus(1).toNumber();
                // data.numberOfUsers = BigNumber(data.numberOfUsers || 0).plus(1).toNumber();
                let newData = {
                    // key: dataAssets?.key || "",
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    // name: dataAssets?.name || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: amount.toNumber(),
                    valueInUSD: amount.multipliedBy(price).toNumber(),
                    // imgUrl: dataAssets?.imgUrl || "",
                    totalValue: amount.multipliedBy(price).toNumber(),
                };
                dataWallet.dapps[0].reserves[0].deposit.push(newData);
            }
            else {
                let newData = {
                    // key: dataAssets?.key || "",
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    // name: dataAssets?.name || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: amount.toNumber() + dataInWallet.amount,
                    valueInUSD: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                    // imgUrl: dataAssets?.imgUrl || "",
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
            appState[modeFrom].forkedAaveLPState.set(_idLP, dataWallet);
            appState.forkAaveLPState.forkAaveLP.set(_idLP, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationWithdrawForkAaveLP(appState1, _from, _idLP, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkAaveLPState.isFetch == false) {
                updateForkAaveLPState(appState, _idLP);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = getMode(appState, _from);
            // Comming Soon .......
            // if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            //     amount = calculateMaxAmountWithdraw(appState, tokenAddress);
            //   }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield updateUserTokenBalance(appState, tokenAddress);
            }
            const tokenAmount = BigNumber(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkAaveLPState.forkAaveLP.get(_idLP);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalSupplyInUSD = BigNumber(data.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState[modeFrom].forkedAaveLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
            if (!dataInWallet) {
                // data.numberOfLenders = BigNumber(data.numberOfLenders || 0).plus(1).toNumber();
                // data.numberOfUsers = BigNumber(data.numberOfUsers || 0).plus(1).toNumber();
                let newData = {
                    // key: dataAssets?.key || "",
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    // name: dataAssets?.name || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber(),
                    valueInUSD: -amount.multipliedBy(price).toNumber(),
                    // imgUrl: dataAssets?.imgUrl || "",
                    totalValue: -amount.multipliedBy(price).toNumber(),
                };
                dataWallet.dapps[0].reserves[0].deposit.push(newData);
            }
            else {
                let newData = {
                    // key: dataAssets?.key || "",
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    // name: dataAssets?.name || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber() + dataInWallet.amount,
                    valueInUSD: BigNumber(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
                    // imgUrl: dataAssets?.imgUrl || "",
                    totalValue: BigNumber(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
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
            appState[modeFrom].forkedAaveLPState.set(_idLP, dataWallet);
            appState.forkAaveLPState.forkAaveLP.set(_idLP, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationBorrowForkAaveLP(appState1, _from, _idLP, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkAaveLPState.isFetch == false) {
                updateForkAaveLPState(appState, _idLP);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = getMode(appState, _from);
            // Comming Soon .......
            // if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            //     amount = calculateMaxAmountBorrow(
            //       appState,
            //       tokenAddress
            //     )
            //   }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield updateUserTokenBalance(appState, tokenAddress);
            }
            const tokenAmount = BigNumber(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkAaveLPState.forkAaveLP.get(_idLP);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalBorrowInUSD = BigNumber(data.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState[modeFrom].forkedAaveLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
            if (!dataInWallet) {
                // data.numberOfLenders = BigNumber(data.numberOfLenders || 0).plus(1).toNumber();
                // data.numberOfUsers = BigNumber(data.numberOfUsers || 0).plus(1).toNumber();
                let newData = {
                    // key: dataAssets?.key || "",
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    // name: dataAssets?.name || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: amount.toNumber(),
                    valueInUSD: amount.multipliedBy(price).toNumber(),
                    // imgUrl: dataAssets?.imgUrl || "",
                    totalValue: amount.multipliedBy(price).toNumber(),
                };
                dataWallet.dapps[0].reserves[0].borrow.push(newData);
            }
            else {
                let newData = {
                    // key: dataAssets?.key || "",
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    // name: dataAssets?.name || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: amount.toNumber() + dataInWallet.amount,
                    valueInUSD: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                    // imgUrl: dataAssets?.imgUrl || "",
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
            appState[modeFrom].forkedAaveLPState.set(_idLP, dataWallet);
            appState.forkAaveLPState.forkAaveLP.set(_idLP, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationRepayForkAaveLP(appState1, _from, _idLP, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkAaveLPState.isFetch == false) {
                updateForkAaveLPState(appState, _idLP);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = getMode(appState, _from);
            // Comming Soon .......
            // if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
            //     amount = calculateMaxAmountRepay(appState, tokenAddress, modeFrom);
            //   }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield updateUserTokenBalance(appState, tokenAddress);
            }
            const tokenAmount = BigNumber(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkAaveLPState.forkAaveLP.get(_idLP);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalBorrowInUSD = BigNumber(data.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState[modeFrom].forkedAaveLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
            if (!dataInWallet) {
                // data.numberOfLenders = BigNumber(data.numberOfLenders || 0).plus(1).toNumber();
                // data.numberOfUsers = BigNumber(data.numberOfUsers || 0).plus(1).toNumber();
                let newData = {
                    // key: dataAssets?.key || "",
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    // name: dataAssets?.name || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber(),
                    valueInUSD: -amount.multipliedBy(price).toNumber(),
                    // imgUrl: dataAssets?.imgUrl || "",
                    totalValue: -amount.multipliedBy(price).toNumber(),
                };
                dataWallet.dapps[0].reserves[0].borrow.push(newData);
            }
            else {
                let newData = {
                    // key: dataAssets?.key || "",
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    // name: dataAssets?.name || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber() + dataInWallet.amount,
                    valueInUSD: BigNumber(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
                    // imgUrl: dataAssets?.imgUrl || "",
                    totalValue: BigNumber(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
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
            appState[modeFrom].forkedAaveLPState.set(_idLP, dataWallet);
            appState.forkAaveLPState.forkAaveLP.set(_idLP, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
