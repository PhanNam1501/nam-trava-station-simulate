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
exports.detailTokenAddressToCToken = exports.cTokenToDetailTokenAddress = exports.SimulationCollateral = exports.SimulationRepayForkCompoundLP = exports.SimulationBorrowForkCompoundLP = exports.SimulationWithdrawForkCompoundLP = exports.SimulationSupplyForkCompoundLP = exports.calculateMaxAmountForkCompoundRepay = exports.calculateMaxAmountForkCompoundWithdraw = exports.calculateMaxAmountForkCompoundBorrow = exports.calculateMaxAmountForkCompoundSupply = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const basic_1 = require("../basic");
const helper_1 = require("../../utils/helper");
const UpdateStateAccount_1 = require("./UpdateStateAccount");
const utils_1 = require("../../utils");
function calculateMaxAmountForkCompoundSupply(appState, _entity_id, _tokenAddress, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenAddress = _tokenAddress.toLowerCase();
        const mode = (0, helper_1.getMode)(appState, _from);
        if (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
            appState = yield (0, UpdateStateAccount_1.updateForkCompoundLPState)(appState, _entity_id);
        }
        if (!appState[mode].tokenBalances.has(tokenAddress)) {
            appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
        }
        const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
        if (typeof walletBalance == undefined) {
            throw new Error("Token is not init in " + mode + " state!");
        }
        return (0, bignumber_js_1.default)(appState[mode].tokenBalances.get(tokenAddress));
    });
}
exports.calculateMaxAmountForkCompoundSupply = calculateMaxAmountForkCompoundSupply;
function calculateMaxAmountForkCompoundBorrow(appState1, _entity_id, _tokenAddress, _from) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        let mode = (0, helper_1.getMode)(appState, _from);
        let tokenAddress = _tokenAddress.toLowerCase();
        let dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
        if (!dataWallet) {
            throw new Error("data not found");
        }
        let assetsIn = dataWallet.dapps[0].reserves[0].assetsIn;
        let sumSupplyByUSD = (0, bignumber_js_1.default)(0);
        let sumBorrowedByUSD = (0, bignumber_js_1.default)(0);
        for (let asset of assetsIn) {
            let assetTokenDetail = cTokenToDetailTokenAddress(appState, _from, _entity_id, asset);
            if (!assetTokenDetail || assetTokenDetail == "") {
                throw new Error("assetTokenDetail not found");
            }
            let dataAssetDeposit = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == assetTokenDetail);
            let dataAssetBorrow = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == assetTokenDetail);
            let maxLTV = (_a = dataWallet.detailTokenInPool.get(assetTokenDetail)) === null || _a === void 0 ? void 0 : _a.maxLTV;
            if (dataAssetDeposit && maxLTV) {
                sumSupplyByUSD = sumSupplyByUSD.plus((0, bignumber_js_1.default)(dataAssetDeposit.valueInUSD).multipliedBy(maxLTV));
            }
            if (dataAssetBorrow && maxLTV) {
                sumBorrowedByUSD = sumBorrowedByUSD.plus((0, bignumber_js_1.default)(dataAssetBorrow.valueInUSD).multipliedBy(maxLTV));
            }
        }
        let tokenInfo = (_b = appState[mode].forkedCompoundLPState.get(_entity_id)) === null || _b === void 0 ? void 0 : _b.detailTokenInPool.get(tokenAddress);
        if (!tokenInfo) {
            throw new Error("tokenInfo not found");
        }
        let tokenPrice = tokenInfo.price;
        return (sumSupplyByUSD.minus(sumBorrowedByUSD)).dividedBy(tokenPrice);
    });
}
exports.calculateMaxAmountForkCompoundBorrow = calculateMaxAmountForkCompoundBorrow;
function calculateMaxAmountForkCompoundWithdraw(appState, _entity_id, _tokenAddress, _from) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const tokenAddress = _tokenAddress.toLowerCase();
        const mode = (0, helper_1.getMode)(appState, _from);
        if (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
            appState = yield (0, UpdateStateAccount_1.updateForkCompoundLPState)(appState, _entity_id);
        }
        if (!appState[mode].tokenBalances.has(tokenAddress)) {
            appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
        }
        const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
        if (typeof walletBalance == undefined) {
            throw new Error("Token is not init in " + mode + " state!");
        }
        const dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
        const deposited = (_a = dataWallet === null || dataWallet === void 0 ? void 0 : dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress)) === null || _a === void 0 ? void 0 : _a.amount;
        if (!deposited) {
            return (0, bignumber_js_1.default)(0);
        }
        return (0, bignumber_js_1.default)(deposited);
    });
}
exports.calculateMaxAmountForkCompoundWithdraw = calculateMaxAmountForkCompoundWithdraw;
function calculateMaxAmountForkCompoundRepay(appState, _entity_id, _tokenAddress, _from) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const tokenAddress = _tokenAddress.toLowerCase();
        const mode = (0, helper_1.getMode)(appState, _from);
        if (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
            appState = yield (0, UpdateStateAccount_1.updateForkCompoundLPState)(appState, _entity_id);
        }
        if (!appState[mode].tokenBalances.has(tokenAddress)) {
            appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
        }
        const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
        if (typeof walletBalance == undefined) {
            throw new Error("Token is not init in " + mode + " state!");
        }
        const dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
        const borrowed = (_a = dataWallet === null || dataWallet === void 0 ? void 0 : dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress)) === null || _a === void 0 ? void 0 : _a.amount;
        if (!borrowed) {
            return (0, bignumber_js_1.default)(0);
        }
        return bignumber_js_1.default.max(bignumber_js_1.default.min(walletBalance, borrowed), 0);
    });
}
exports.calculateMaxAmountForkCompoundRepay = calculateMaxAmountForkCompoundRepay;
function SimulationSupplyForkCompoundLP(appState1, _from, _idLP, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.default)(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkCompoundLPState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateForkCompoundLPState)(appState, _idLP);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (amount.toFixed() == utils_1.MAX_UINT256 || amount.isEqualTo(utils_1.MAX_UINT256)) {
                amount = yield calculateMaxAmountForkCompoundSupply(appState, _idLP, tokenAddress, _from);
            }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
            }
            const tokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                price = 0;
            }
            data.totalSupplyInUSD = (0, bignumber_js_1.default)(data.totalSupplyInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
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
            let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
            if (!dataToken) {
                throw new Error("dataToken not found");
            }
            dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) + amount.toNumber()).toString();
            dataWallet.detailTokenInPool.set(tokenAddress, dataToken);
            let cTokenAddress = detailTokenAddressToCToken(appState, _from, _idLP, tokenAddress);
            const cTokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(cTokenAddress));
            const newcTokenAmount = cTokenAmount.plus(amount).toFixed();
            appState[modeFrom].tokenBalances.set(cTokenAddress, newcTokenAmount);
            const newAmount = tokenAmount.minus(amount).toFixed();
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedCompoundLPState.set(_idLP, dataWallet);
            appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationSupplyForkCompoundLP = SimulationSupplyForkCompoundLP;
function SimulationWithdrawForkCompoundLP(appState1, _from, _idLP, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.default)(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkCompoundLPState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateForkCompoundLPState)(appState, _idLP);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (amount.toFixed() == utils_1.MAX_UINT256 || amount.isEqualTo(utils_1.MAX_UINT256)) {
                amount = yield calculateMaxAmountForkCompoundWithdraw(appState, _idLP, tokenAddress, _from);
            }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
            }
            const tokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalSupplyInUSD = (0, bignumber_js_1.default)(data.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
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
                    valueInUSD: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                    totalValue: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
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
            let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
            if (!dataToken) {
                throw new Error("dataToken not found");
            }
            dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) - amount.toNumber()).toString();
            dataToken.cToken.balances = (Number(dataToken.cToken.balances) + amount.toNumber()).toString();
            dataWallet.detailTokenInPool.set(tokenAddress, dataToken);
            let cTokenAddress = detailTokenAddressToCToken(appState, _from, _idLP, tokenAddress);
            const cTokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(cTokenAddress));
            const newcTokenAmount = cTokenAmount.minus(amount).toFixed();
            appState[modeFrom].tokenBalances.set(cTokenAddress, newcTokenAmount);
            const newAmount = tokenAmount.plus(amount).toFixed();
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedCompoundLPState.set(_idLP, dataWallet);
            appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationWithdrawForkCompoundLP = SimulationWithdrawForkCompoundLP;
function SimulationBorrowForkCompoundLP(appState1, _from, _idLP, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.default)(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkCompoundLPState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateForkCompoundLPState)(appState, _idLP);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (amount.toFixed() == utils_1.MAX_UINT256 || amount.isEqualTo(utils_1.MAX_UINT256)) {
                amount = yield calculateMaxAmountForkCompoundBorrow(appState, _idLP, tokenAddress, _from);
            }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
            }
            const tokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalBorrowInUSD = (0, bignumber_js_1.default)(data.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
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
            let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
            if (!dataToken) {
                throw new Error("dataToken not found");
            }
            dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) - amount.toNumber()).toString();
            dataWallet.detailTokenInPool.set(tokenAddress, dataToken);
            let assetsIn = dataWallet.dapps[0].reserves[0].assetsIn;
            let cTokenAddress = detailTokenAddressToCToken(appState, _from, _idLP, tokenAddress);
            if (!assetsIn.find((asset) => asset == cTokenAddress)) {
                dataWallet.dapps[0].reserves[0].assetsIn.push(cTokenAddress);
            }
            const newAmount = tokenAmount.plus(amount).toFixed();
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedCompoundLPState.set(_idLP, dataWallet);
            appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationBorrowForkCompoundLP = SimulationBorrowForkCompoundLP;
function SimulationRepayForkCompoundLP(appState1, _from, _idLP, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.default)(_amount);
            let appState = Object.assign({}, appState1);
            if (appState.forkCompoundLPState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateForkCompoundLPState)(appState, _idLP);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            if (amount.toFixed() == utils_1.MAX_UINT256 || amount.isEqualTo(utils_1.MAX_UINT256)) {
                amount = yield calculateMaxAmountForkCompoundRepay(appState, _idLP, tokenAddress, _from);
            }
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, basic_1.updateUserTokenBalance)(appState, tokenAddress);
            }
            const tokenAmount = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkCompoundLPState.forkCompoundLP.get(_idLP);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalBorrowInUSD = (0, bignumber_js_1.default)(data.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
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
                    valueInUSD: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                    totalValue: amount.multipliedBy(-1).plus(dataInWallet.amount).multipliedBy(price).toNumber(),
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
            let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
            if (!dataToken) {
                throw new Error("dataToken not found");
            }
            dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) + amount.toNumber()).toString();
            dataWallet.detailTokenInPool.set(tokenAddress, dataToken);
            const newAmount = tokenAmount.minus(amount).toFixed();
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedCompoundLPState.set(_idLP, dataWallet);
            appState.forkCompoundLPState.forkCompoundLP.set(_idLP, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationRepayForkCompoundLP = SimulationRepayForkCompoundLP;
function SimulationCollateral(appState1, _from, _idLP, _collateralList) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let appState = Object.assign({}, appState1);
            let mode = (0, helper_1.getMode)(appState, _from);
            let dataWallet = appState[mode].forkedCompoundLPState.get(_idLP);
            if (!dataWallet) {
                throw new Error("data not found");
            }
            let assetsIn = dataWallet.dapps[0].reserves[0].assetsIn;
            let assetsOut = [];
            for (let collateral of _collateralList) {
                let dataTokenAddress = dataWallet.detailTokenInPool.get(collateral.tokenAddress);
                if (!dataTokenAddress) {
                    throw new Error("TokenAddress not found");
                }
                let cTokenAddress = dataTokenAddress.cToken.address;
                if (collateral.enableAsColl == 1) {
                    if (!(assetsIn.find((asset) => asset == cTokenAddress))) {
                        assetsIn.push(cTokenAddress);
                    }
                }
                else if (collateral.enableAsColl == 0) {
                    if (assetsIn.find((asset) => asset == cTokenAddress)) {
                        assetsOut.push(cTokenAddress);
                        assetsIn = assetsIn.filter((asset) => asset != cTokenAddress);
                    }
                }
                else {
                    throw new Error("collateral.enableAsColl must be 0 or 1");
                }
            }
            let tokenBorrowing = [];
            // totalCollateral (sum Supply By USD Assets In Multiplied LTV)
            let totalCollateral = (0, bignumber_js_1.default)(0);
            let sumBorrowByUSD = (0, bignumber_js_1.default)(0);
            for (let collateral of _collateralList) {
                let dataTokenAddress = dataWallet.detailTokenInPool.get(collateral.tokenAddress);
                if (!dataTokenAddress) {
                    throw new Error("TokenAddress not found");
                }
                let cTokenAddress = dataTokenAddress.cToken.address;
                let maxLTV = dataTokenAddress.maxLTV;
                let dataAssetDeposit = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == collateral.tokenAddress);
                if (dataAssetDeposit) {
                    if (assetsIn.find((asset) => asset == cTokenAddress)) {
                        totalCollateral = totalCollateral.plus((0, bignumber_js_1.default)(dataAssetDeposit.valueInUSD).multipliedBy(maxLTV));
                    }
                }
                let dataAssetBorrow = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == collateral.tokenAddress);
                if (dataAssetBorrow) {
                    sumBorrowByUSD = sumBorrowByUSD.plus(dataAssetBorrow.valueInUSD);
                    if (dataAssetBorrow.amount != 0) {
                        tokenBorrowing.push(cTokenAddress);
                    }
                }
            }
            if (assetsOut.length > 0) {
                for (let asset of assetsOut) {
                    if (tokenBorrowing.find((token) => token == asset)) {
                        throw new Error("Can't remove collateral when borrowing");
                    }
                }
                if (totalCollateral.isLessThan(sumBorrowByUSD)) {
                    throw new Error("Can't remove collateral, please repay first");
                }
            }
            dataWallet.dapps[0].reserves[0].assetsIn = assetsIn;
            appState[mode].forkedCompoundLPState.set(_idLP, dataWallet);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationCollateral = SimulationCollateral;
function cTokenToDetailTokenAddress(appState1, _from, _idLP, cTokenAddress) {
    try {
        let appState = Object.assign({}, appState1);
        let mode = (0, helper_1.getMode)(appState, _from);
        let dataWallet = appState[mode].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }
        let dataTokenAddress = dataWallet.detailTokenInPool;
        if (!dataTokenAddress) {
            throw new Error("TokenAddress not found");
        }
        let detailTokenAddress = "";
        for (const [key, value] of dataTokenAddress) {
            if (value.cToken.address == cTokenAddress) {
                detailTokenAddress = key;
            }
        }
        return detailTokenAddress;
    }
    catch (err) {
        throw err;
    }
}
exports.cTokenToDetailTokenAddress = cTokenToDetailTokenAddress;
function detailTokenAddressToCToken(appState1, _from, _idLP, detailTokenAddress) {
    try {
        let appState = Object.assign({}, appState1);
        let mode = (0, helper_1.getMode)(appState, _from);
        let dataWallet = appState[mode].forkedCompoundLPState.get(_idLP);
        if (!dataWallet) {
            throw new Error("data not found");
        }
        let dataTokenAddress = dataWallet.detailTokenInPool;
        if (!dataTokenAddress) {
            throw new Error("TokenAddress not found");
        }
        let cTokenAddress = "";
        for (const [key, value] of dataTokenAddress) {
            if (key == detailTokenAddress) {
                cTokenAddress = value.cToken.address;
            }
        }
        return cTokenAddress;
    }
    catch (err) {
        throw err;
    }
}
exports.detailTokenAddressToCToken = detailTokenAddressToCToken;
