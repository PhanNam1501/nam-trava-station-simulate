"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAvailableAaveBorrow = getUserAvailableAaveBorrow;
exports.calculateMaxAmountForkAaveSupply = calculateMaxAmountForkAaveSupply;
exports.calculateMaxAmountForkAaveBorrow = calculateMaxAmountForkAaveBorrow;
exports.calculateMaxAmountForkAaveRepay = calculateMaxAmountForkAaveRepay;
exports.calculateMaxAmountForkAaveWithdraw = calculateMaxAmountForkAaveWithdraw;
exports.SimulationSupplyForkAaveLP = SimulationSupplyForkAaveLP;
exports.SimulationWithdrawForkAaveLP = SimulationWithdrawForkAaveLP;
exports.SimulationBorrowForkAaveLP = SimulationBorrowForkAaveLP;
exports.SimulationRepayForkAaveLP = SimulationRepayForkAaveLP;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const basic_1 = require("../basic");
const helper_1 = require("../../utils/helper");
const UpdateStateAccount_1 = require("./UpdateStateAccount");
const utils_1 = require("../../utils");
function getUserAvailableAaveBorrow(appState1, _entity_id, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (appState1.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
            appState1 = yield (0, UpdateStateAccount_1.updateForkAaveLPState)(appState1, _entity_id);
        }
        let appState = Object.assign({}, appState1);
        const mode = (0, helper_1.getMode)(appState, _from);
        let dataWallet = appState[mode].forkedAaveLPState.get(_entity_id);
        if (!dataWallet) {
            return (0, bignumber_js_1.default)(0);
        }
        let sumSupplyByUSD = (0, bignumber_js_1.default)(0);
        let sumBorrowedByUSD = (0, bignumber_js_1.default)(0);
        for (let dataAssetDeposit of dataWallet.dapps[0].reserves[0].deposit) {
            // let dataAssetBorrow = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == assetTokenDetail);
            let maxLTV = (_a = dataWallet.detailTokenInPool.get(dataAssetDeposit.address.toLowerCase())) === null || _a === void 0 ? void 0 : _a.maxLTV;
            if (dataAssetDeposit && maxLTV) {
                sumSupplyByUSD = sumSupplyByUSD.plus((0, bignumber_js_1.default)(dataAssetDeposit.valueInUSD).multipliedBy(maxLTV));
            }
        }
        for (let dataAssetBorrow of dataWallet.dapps[0].reserves[0].borrow) {
            sumBorrowedByUSD = sumBorrowedByUSD.plus((0, bignumber_js_1.default)(dataAssetBorrow.valueInUSD));
        }
        return sumSupplyByUSD.minus(sumBorrowedByUSD);
    });
}
function calculateMaxAmountForkAaveSupply(appState, _entity_id, _tokenAddress, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenAddress = _tokenAddress.toLowerCase();
        const mode = (0, helper_1.getMode)(appState, _from);
        if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
            appState = yield (0, UpdateStateAccount_1.updateForkAaveLPState)(appState, _entity_id);
        }
        if (!appState[mode].tokenBalances.has(tokenAddress)) {
            appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
        }
        const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
        if (typeof walletBalance == undefined) {
            throw new Error("Token is not init in " + mode + " state!");
        }
        const lpState = appState.smartWalletState.forkedAaveLPState.get(_entity_id);
        let tokenInfo = lpState.detailTokenInPool.get(tokenAddress);
        if (typeof tokenInfo == undefined) {
            throw new Error("Token is not init in smart wallet lending pool state!");
        }
        return (0, bignumber_js_1.default)(appState[mode].tokenBalances.get(tokenAddress));
    });
}
function calculateMaxAmountForkAaveBorrow(appState, _entity_id, _tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenAddress = _tokenAddress.toLowerCase();
        if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
            appState = yield (0, UpdateStateAccount_1.updateForkAaveLPState)(appState, _entity_id);
        }
        const lpState = appState.smartWalletState.forkedAaveLPState.get(_entity_id);
        let tokenInfo = lpState.detailTokenInPool.get(tokenAddress);
        const tTokenReserveBalanceRaw = (0, bignumber_js_1.default)(tokenInfo.tToken.originToken.balances);
        const tTokenReserveBalance = (0, bignumber_js_1.default)(tTokenReserveBalanceRaw).div((0, bignumber_js_1.default)("10").pow(tokenInfo.tToken.decimals));
        const availableBorrowsUSD = yield getUserAvailableAaveBorrow(appState, _entity_id, appState.smartWalletState.address);
        const nativeAvailableBorrow = availableBorrowsUSD.div(tokenInfo.price);
        return bignumber_js_1.default.max(bignumber_js_1.default.min(nativeAvailableBorrow, tTokenReserveBalance), 0).multipliedBy((0, bignumber_js_1.default)("10").pow(tokenInfo.tToken.decimals));
    });
}
function calculateMaxAmountForkAaveRepay(appState, _entity_id, _tokenAddress, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenAddress = _tokenAddress.toLowerCase();
        const mode = (0, helper_1.getMode)(appState, _from);
        if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
            appState = yield (0, UpdateStateAccount_1.updateForkAaveLPState)(appState, _entity_id);
        }
        if (!appState[mode].tokenBalances.has(tokenAddress)) {
            appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
        }
        const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
        if (typeof walletBalance == undefined) {
            throw new Error("Token is not init in " + mode + " state!");
        }
        const lpState = appState.smartWalletState.forkedAaveLPState.get(_entity_id);
        let tokenInfo = lpState.detailTokenInPool.get(tokenAddress);
        let dTokenBalance = tokenInfo.dToken.balances;
        const borrowed = new bignumber_js_1.default(dTokenBalance);
        return bignumber_js_1.default.max(bignumber_js_1.default.min(walletBalance, borrowed), 0);
    });
}
function calculateMaxAmountForkAaveWithdraw(appState, _entity_id, _tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenAddress = _tokenAddress.toLowerCase();
        if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
            appState = yield (0, UpdateStateAccount_1.updateForkAaveLPState)(appState, _entity_id);
        }
        const lpState = appState.smartWalletState.forkedAaveLPState.get(_entity_id);
        let tokenInfo = lpState.detailTokenInPool.get(tokenAddress);
        // const depositedRaw = tokenInfo.tToken.balances;
        // const deposited = BigNumber(depositedRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
        const tTokenReserveBalanceRaw = tokenInfo.tToken.originToken.balances;
        const tTokenReserveBalance = (0, bignumber_js_1.default)(tTokenReserveBalanceRaw);
        let dataWallet = appState.smartWalletState.forkedAaveLPState.get(_entity_id);
        if (!dataWallet) {
            return (0, bignumber_js_1.default)(0);
        }
        let reservesData = dataWallet.dapps[0].reserves[0];
        let nativeAvailableWithdraw = (0, bignumber_js_1.default)(0);
        let dataDeposit = reservesData.deposit;
        for (let i = 0; i < dataDeposit.length; i++) {
            if (dataDeposit[i].address == tokenAddress) {
                nativeAvailableWithdraw = nativeAvailableWithdraw.plus(dataDeposit[i].valueInUSD);
                break;
            }
        }
        let dataBorrow = reservesData.borrow;
        for (let i = 0; i < dataBorrow.length; i++) {
            if (dataBorrow[i].address == tokenAddress) {
                nativeAvailableWithdraw = nativeAvailableWithdraw.minus(dataBorrow[i].valueInUSD);
            }
        }
        nativeAvailableWithdraw = nativeAvailableWithdraw.div(tokenInfo.price);
        const available = (0, bignumber_js_1.default)(tokenInfo.tToken.totalSupply).minus(tokenInfo.dToken.totalSupply).div(tokenInfo.price);
        if (nativeAvailableWithdraw.isNaN()) {
            nativeAvailableWithdraw = (0, bignumber_js_1.default)(0);
        }
        // return BigNumber.max(
        //     BigNumber.min(deposited, nativeAvailableWithdraw, tTokenReserveBalance, available),
        //     0
        // ).multipliedBy(BigNumber("10").pow(tokenInfo.tToken.decimals))
        return bignumber_js_1.default.max(bignumber_js_1.default.min(nativeAvailableWithdraw, tTokenReserveBalance, available), 0).multipliedBy((0, bignumber_js_1.default)("10").pow(tokenInfo.tToken.decimals));
    });
}
function SimulationSupplyForkAaveLP(appState1, _from, _entity_id, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.default)(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
                appState = yield (0, UpdateStateAccount_1.updateForkAaveLPState)(appState, _entity_id);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (amount.isEqualTo(utils_1.MAX_UINT256)) {
                amount = yield calculateMaxAmountForkAaveSupply(appState, _entity_id, tokenAddress, _from);
            }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
            }
            if (!appState[modeFrom].forkedAaveLPState.has(_entity_id)) {
                appState = yield (0, UpdateStateAccount_1.updateUserInForkAaveLPState)(appState, _from, _entity_id);
            }
            const tokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkAaveLPState.forkAaveLP.get(_entity_id);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                price = 0;
            }
            data.totalSupplyInUSD = (0, bignumber_js_1.default)(data.totalSupplyInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedAaveLPState.get(_entity_id);
            if (dataWallet.dapps.length == 0) {
                let reserve = {
                    category: "Lending",
                    healthFactor: Number(utils_1.MAX_UINT256),
                    deposit: new Array(),
                    borrow: new Array()
                };
                let reserves = new Array();
                reserves.push(reserve);
                let dapp = {
                    id: _entity_id,
                    type: "token",
                    value: amount.multipliedBy(price).toNumber(),
                    depositInUSD: amount.multipliedBy(price).toNumber(),
                    borrowInUSD: 0,
                    claimable: 0,
                    reserves: reserves
                };
                dataWallet.dapps.push(dapp);
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
            if (!dataInWallet) {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: amount.toNumber(),
                    valueInUSD: amount.multipliedBy(price).toNumber(),
                    totalValue: amount.multipliedBy(price).toNumber(),
                    isCollateral: true
                };
                dataWallet.dapps[0].reserves[0].deposit.push(newData);
            }
            else {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: amount.toNumber() + dataInWallet.amount,
                    valueInUSD: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                    totalValue: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                    isCollateral: true
                };
                dataWallet.dapps[0].value = (0, bignumber_js_1.default)(dataWallet.dapps[0].value || 0).plus(amount).toNumber();
                dataWallet.dapps[0].depositInUSD = (0, bignumber_js_1.default)(dataWallet.dapps[0].depositInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
                dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                    if (reserve.address == tokenAddress) {
                        return newData;
                    }
                    return reserve;
                });
            }
            const newAmount = tokenAmount.minus(amount).toFixed(0);
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedAaveLPState.set(_entity_id, dataWallet);
            appState.forkAaveLPState.forkAaveLP.set(_entity_id, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
function SimulationWithdrawForkAaveLP(appState1, _from, _entity_id, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.default)(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
                appState = yield (0, UpdateStateAccount_1.updateForkAaveLPState)(appState, _entity_id);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (amount.isEqualTo(utils_1.MAX_UINT256)) {
                amount = yield calculateMaxAmountForkAaveWithdraw(appState, _entity_id, tokenAddress);
            }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
            }
            if (!appState[modeFrom].forkedAaveLPState.has(_entity_id)) {
                appState = yield (0, UpdateStateAccount_1.updateUserInForkAaveLPState)(appState, _from, _entity_id);
            }
            const tokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkAaveLPState.forkAaveLP.get(_entity_id);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalSupplyInUSD = (0, bignumber_js_1.default)(data.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedAaveLPState.get(_entity_id);
            if (dataWallet.dapps.length == 0) {
                let reserve = {
                    category: "Lending",
                    healthFactor: Number(utils_1.MAX_UINT256),
                    deposit: new Array(),
                    borrow: new Array()
                };
                let reserves = new Array();
                reserves.push(reserve);
                let dapp = {
                    id: _entity_id,
                    type: "token",
                    value: 0,
                    depositInUSD: 0,
                    borrowInUSD: 0,
                    claimable: 0,
                    reserves: reserves
                };
                dataWallet.dapps.push(dapp);
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
            if (!dataInWallet) {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber(),
                    valueInUSD: -amount.multipliedBy(price).toNumber(),
                    totalValue: -amount.multipliedBy(price).toNumber(),
                    isCollateral: true
                };
                dataWallet.dapps[0].reserves[0].deposit.push(newData);
            }
            else {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber() + dataInWallet.amount,
                    valueInUSD: (0, bignumber_js_1.default)(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
                    totalValue: (0, bignumber_js_1.default)(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
                    isCollateral: true
                };
                dataWallet.dapps[0].value = (0, bignumber_js_1.default)(dataWallet.dapps[0].value || 0).minus(amount).toNumber();
                dataWallet.dapps[0].depositInUSD = (0, bignumber_js_1.default)(dataWallet.dapps[0].depositInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
                dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                    if (reserve.address == tokenAddress) {
                        return newData;
                    }
                    return reserve;
                });
            }
            const newAmount = tokenAmount.plus(amount).toFixed(0);
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedAaveLPState.set(_entity_id, dataWallet);
            appState.forkAaveLPState.forkAaveLP.set(_entity_id, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
function SimulationBorrowForkAaveLP(appState1, _from, _entity_id, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.default)(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
                appState = yield (0, UpdateStateAccount_1.updateForkAaveLPState)(appState, _entity_id);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (amount.isEqualTo(utils_1.MAX_UINT256)) {
                amount = yield calculateMaxAmountForkAaveBorrow(appState, _entity_id, tokenAddress);
            }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
            }
            if (!appState[modeFrom].forkedAaveLPState.has(_entity_id)) {
                appState = yield (0, UpdateStateAccount_1.updateUserInForkAaveLPState)(appState, _from, _entity_id);
            }
            const tokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkAaveLPState.forkAaveLP.get(_entity_id);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalBorrowInUSD = (0, bignumber_js_1.default)(data.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedAaveLPState.get(_entity_id);
            if (dataWallet.dapps.length == 0) {
                let reserve = {
                    category: "Lending",
                    healthFactor: Number(utils_1.MAX_UINT256),
                    deposit: new Array(),
                    borrow: new Array()
                };
                let reserves = new Array();
                reserves.push(reserve);
                let dapp = {
                    id: _entity_id,
                    type: "token",
                    value: 0,
                    depositInUSD: 0,
                    borrowInUSD: 0,
                    claimable: 0,
                    reserves: reserves
                };
                dataWallet.dapps.push(dapp);
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
            if (!dataInWallet) {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: amount.toNumber(),
                    valueInUSD: amount.multipliedBy(price).toNumber(),
                    totalValue: amount.multipliedBy(price).toNumber(),
                    isCollateral: true
                };
                dataWallet.dapps[0].reserves[0].borrow.push(newData);
            }
            else {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: amount.toNumber() + dataInWallet.amount,
                    valueInUSD: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                    totalValue: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                    isCollateral: true
                };
                dataWallet.dapps[0].value = (0, bignumber_js_1.default)(dataWallet.dapps[0].value || 0).plus(amount).toNumber();
                dataWallet.dapps[0].borrowInUSD = (0, bignumber_js_1.default)(dataWallet.dapps[0].borrowInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
                dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                    if (reserve.address == tokenAddress) {
                        return newData;
                    }
                    return reserve;
                });
            }
            const newAmount = tokenAmount.plus(amount).toFixed(0);
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedAaveLPState.set(_entity_id, dataWallet);
            appState.forkAaveLPState.forkAaveLP.set(_entity_id, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
function SimulationRepayForkAaveLP(appState1, _from, _entity_id, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.default)(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
                appState = yield (0, UpdateStateAccount_1.updateForkAaveLPState)(appState, _entity_id);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (amount.isEqualTo(utils_1.MAX_UINT256)) {
                amount = yield calculateMaxAmountForkAaveRepay(appState, _entity_id, tokenAddress, _from);
            }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
            }
            if (!appState[modeFrom].forkedAaveLPState.has(_entity_id)) {
                appState = yield (0, UpdateStateAccount_1.updateUserInForkAaveLPState)(appState, _from, _entity_id);
            }
            const tokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkAaveLPState.forkAaveLP.get(_entity_id);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalBorrowInUSD = (0, bignumber_js_1.default)(data.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedAaveLPState.get(_entity_id);
            if (dataWallet.dapps.length == 0) {
                let reserve = {
                    category: "Lending",
                    healthFactor: Number(utils_1.MAX_UINT256),
                    deposit: new Array(),
                    borrow: new Array()
                };
                let reserves = new Array();
                reserves.push(reserve);
                let dapp = {
                    id: _entity_id,
                    type: "token",
                    value: 0,
                    depositInUSD: 0,
                    borrowInUSD: 0,
                    claimable: 0,
                    reserves: reserves
                };
                dataWallet.dapps.push(dapp);
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
            if (!dataInWallet) {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber(),
                    valueInUSD: -amount.multipliedBy(price).toNumber(),
                    totalValue: -amount.multipliedBy(price).toNumber(),
                    isCollateral: true
                };
                dataWallet.dapps[0].reserves[0].borrow.push(newData);
            }
            else {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber() + dataInWallet.amount,
                    valueInUSD: (0, bignumber_js_1.default)(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
                    totalValue: (0, bignumber_js_1.default)(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
                    isCollateral: true
                };
                dataWallet.dapps[0].value = (0, bignumber_js_1.default)(dataWallet.dapps[0].value || 0).minus(amount).toNumber();
                dataWallet.dapps[0].borrowInUSD = (0, bignumber_js_1.default)(dataWallet.dapps[0].borrowInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
                dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                    if (reserve.address == tokenAddress) {
                        return newData;
                    }
                    return reserve;
                });
            }
            const newAmount = tokenAmount.minus(amount).toFixed(0);
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedAaveLPState.set(_entity_id, dataWallet);
            appState.forkAaveLPState.forkAaveLP.set(_entity_id, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
