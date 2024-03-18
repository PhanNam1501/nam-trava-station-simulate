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
exports.SimulationTransferTToken = exports.SimulationConvertReward = exports.SimulationClaimReward = exports.SimulationWithdraw = exports.SimulationRepay = exports.SimulationBorrow = exports.SimulationSupply = exports.getAmountFromBalanceUsd = exports.getBalanceUsdFromAmount = exports.calculateNewLiquidThreshold = exports.calculateNewLTV = exports.calculateNewHealFactor = exports.calculateNewAvailableBorrow = exports.calculateMaxAmountTransferTToken = exports.calculateMaxAmountWithdraw = exports.calculateMaxAmountRepay = exports.calculateMaxAmountBorrow = exports.calculateMaxAmountSupply = exports.getListTDTokenRewardsAddress = exports.calculateMaxRewards = void 0;
const address_1 = require("../../../utils/address");
const ethers_1 = require("ethers");
const config_1 = require("../../../utils/config");
const IncentiveContract_json_1 = __importDefault(require("../../../abis/IncentiveContract.json"));
const bignumber_js_1 = require("bignumber.js");
const UpdateStateAccount_1 = require("./UpdateStateAccount");
const UpdateStateAccount_2 = require("../../basic/UpdateStateAccount");
const helper_1 = require("../../../utils/helper");
function calculateMaxRewards(appState) {
    return __awaiter(this, void 0, void 0, function* () {
        let listTDTokenRewardsAddress = getListTDTokenRewardsAddress(appState);
        const travaIncentiveContract = new ethers_1.Contract((0, address_1.getAddr)("INCENTIVE_CONTRACT", appState.chainId), IncentiveContract_json_1.default, appState.web3);
        let maxRewardCanGet = yield travaIncentiveContract.getRewardsBalance(listTDTokenRewardsAddress, appState.smartWalletState.address);
        return maxRewardCanGet;
    });
}
exports.calculateMaxRewards = calculateMaxRewards;
function getListTDTokenRewardsAddress(appState) {
    let detailTokenInPool = appState.smartWalletState.detailTokenInPool;
    let listTDTokenRewardsAddress = new Array();
    detailTokenInPool.forEach(token => {
        if ((0, bignumber_js_1.BigNumber)(token.tToken.balances).isGreaterThan(0)) {
            listTDTokenRewardsAddress.push((0, address_1.convertHexStringToAddress)(token.tToken.address));
        }
        if ((0, bignumber_js_1.BigNumber)(token.dToken.balances).isGreaterThan(0.00001)) {
            listTDTokenRewardsAddress.push((0, address_1.convertHexStringToAddress)(token.dToken.address));
        }
    });
    return listTDTokenRewardsAddress;
}
exports.getListTDTokenRewardsAddress = getListTDTokenRewardsAddress;
function calculateMaxAmountSupply(appState, _tokenAddress, mode) {
    let tokenAddress = _tokenAddress.toLowerCase();
    const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
    if (typeof walletBalance == undefined) {
        throw new Error("Token is not init in " + mode + " state!");
    }
    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress);
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in smart wallet lending pool state!");
    }
    return (0, bignumber_js_1.BigNumber)(appState[mode].tokenBalances.get(tokenAddress));
}
exports.calculateMaxAmountSupply = calculateMaxAmountSupply;
function calculateMaxAmountBorrow(appState, _tokenAddress) {
    let tokenAddress = _tokenAddress.toLowerCase();
    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress);
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in smart wallet lending pool state!");
    }
    const tTokenReserveBalanceRaw = (0, bignumber_js_1.BigNumber)(tokenInfo.tToken.originToken.balances);
    const tTokenReserveBalance = (0, bignumber_js_1.BigNumber)(tTokenReserveBalanceRaw).div((0, bignumber_js_1.BigNumber)("10").pow(tokenInfo.tToken.decimals));
    const availableBorrowsUSD = (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.availableBorrowsUSD);
    const nativeAvailableBorrow = availableBorrowsUSD.div(tokenInfo.price);
    return bignumber_js_1.BigNumber.max(bignumber_js_1.BigNumber.min(nativeAvailableBorrow, tTokenReserveBalance), 0).multipliedBy((0, bignumber_js_1.BigNumber)("10").pow(tokenInfo.tToken.decimals));
}
exports.calculateMaxAmountBorrow = calculateMaxAmountBorrow;
function calculateMaxAmountRepay(appState, _tokenAddress, mode) {
    let tokenAddress = _tokenAddress.toLowerCase();
    const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
    if (typeof walletBalance == undefined) {
        throw new Error("Token is not init in " + mode + " state!");
    }
    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress.toLowerCase());
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in smart wallet lending pool state!");
    }
    let dTokenBalance = tokenInfo.dToken.balances;
    const borrowed = new bignumber_js_1.BigNumber(dTokenBalance);
    return bignumber_js_1.BigNumber.max(bignumber_js_1.BigNumber.min(walletBalance, borrowed), 0);
}
exports.calculateMaxAmountRepay = calculateMaxAmountRepay;
function calculateMaxAmountWithdraw(appState, _tokenAddress) {
    let tokenAddress = _tokenAddress.toLowerCase();
    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress.toLowerCase());
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in smart wallet lending pool state!");
    }
    const depositedRaw = tokenInfo.tToken.balances;
    const deposited = (0, bignumber_js_1.BigNumber)(depositedRaw).dividedBy((0, bignumber_js_1.BigNumber)("10").pow(tokenInfo.tToken.decimals));
    const tTokenReserveBalanceRaw = tokenInfo.tToken.originToken.balances;
    const tTokenReserveBalance = (0, bignumber_js_1.BigNumber)(tTokenReserveBalanceRaw).dividedBy((0, bignumber_js_1.BigNumber)("10").pow(tokenInfo.tToken.decimals));
    let nativeAvailableWithdraw = (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalCollateralUSD)
        .minus((0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalDebtUSD).div((0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.ltv)))
        .div(tokenInfo.price);
    const available = (0, bignumber_js_1.BigNumber)(tokenInfo.tToken.totalSupply).minus(tokenInfo.dToken.totalSupply).div(tokenInfo.price);
    if (nativeAvailableWithdraw.isNaN()) {
        nativeAvailableWithdraw = (0, bignumber_js_1.BigNumber)(0);
    }
    return bignumber_js_1.BigNumber.max(bignumber_js_1.BigNumber.min(deposited, nativeAvailableWithdraw, tTokenReserveBalance, available), 0).multipliedBy((0, bignumber_js_1.BigNumber)("10").pow(tokenInfo.tToken.decimals));
}
exports.calculateMaxAmountWithdraw = calculateMaxAmountWithdraw;
function calculateMaxAmountTransferTToken(appState, _tokenAddress, _from) {
    let modeFrom = (0, helper_1.getMode)(appState, _from);
    let tokenAddress = _tokenAddress.toLowerCase();
    let tokenInfo = appState[modeFrom].detailTokenInPool.get(tokenAddress.toLowerCase());
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in lending pool state!");
    }
    const depositedRaw = tokenInfo.tToken.balances;
    const deposited = (0, bignumber_js_1.BigNumber)(depositedRaw).dividedBy((0, bignumber_js_1.BigNumber)("10").pow(tokenInfo.tToken.decimals));
    const tTokenReserveBalanceRaw = tokenInfo.tToken.originToken.balances;
    const tTokenReserveBalance = (0, bignumber_js_1.BigNumber)(tTokenReserveBalanceRaw).dividedBy((0, bignumber_js_1.BigNumber)("10").pow(tokenInfo.tToken.decimals));
    let nativeAvailableTransfer = (0, bignumber_js_1.BigNumber)(appState[modeFrom].travaLPState.totalCollateralUSD)
        .minus((0, bignumber_js_1.BigNumber)(appState[modeFrom].travaLPState.totalDebtUSD).div((0, bignumber_js_1.BigNumber)(appState[modeFrom].travaLPState.ltv)))
        .div(tokenInfo.price);
    const available = (0, bignumber_js_1.BigNumber)(tokenInfo.tToken.totalSupply).minus(tokenInfo.dToken.totalSupply).div(tokenInfo.price);
    if (nativeAvailableTransfer.isNaN()) {
        nativeAvailableTransfer = (0, bignumber_js_1.BigNumber)(0);
    }
    return bignumber_js_1.BigNumber.max(bignumber_js_1.BigNumber.min(deposited, nativeAvailableTransfer, tTokenReserveBalance, available), 0).multipliedBy((0, bignumber_js_1.BigNumber)("10").pow(tokenInfo.tToken.decimals));
}
exports.calculateMaxAmountTransferTToken = calculateMaxAmountTransferTToken;
function calculateNewAvailableBorrow(newTotalCollateral, newLTV, newTotalDebt) {
    return (0, config_1.percentMul)(newTotalCollateral, newLTV)
        .minus(newTotalDebt);
}
exports.calculateNewAvailableBorrow = calculateNewAvailableBorrow;
function calculateNewHealFactor(newTotalCollateral, newLiquidationThreshold, newTotalDebt) {
    if (newTotalDebt.toFixed(0) == "0") {
        return (0, bignumber_js_1.BigNumber)(config_1.MAX_UINT256);
    }
    return (0, config_1.wadDiv)((0, config_1.percentMul)(newTotalCollateral, newLiquidationThreshold), newTotalDebt);
}
exports.calculateNewHealFactor = calculateNewHealFactor;
// ltv = sum(C[i] * ltv[i]) / sum(C[i]) with C[i] is colleteral of token[i] and ltv[i] is ltv of this token
// <=> oldLtv = sum(C[i] * ltv[i]) / oldTotalColleteral
// newLTV = (sum(C[i] * ltv[i]) + (new C'[i] * ltv[i] )) /(oldTotalColleteral + C'[i])
// => newLTV = (oldLTV * oldTotalColleteral + new C'[i] * ltv[i]) / newTotalColleteral
// <=> newLTV = (oldLTV * oldTotalColleteral + new amount * tokenPrice[i] / tokenDecimal[i]) / newTOtalColleteral
// if amount == 0, LTV is unchanged
function calculateNewLTV(oldTotalColleteral, oldLTV, newTotalCollateral, tokenLTV) {
    let usd_changed = newTotalCollateral.minus(oldTotalColleteral);
    if (usd_changed.toFixed(0) == "0") {
        return oldLTV;
    }
    if (newTotalCollateral.toFixed(0) == "0") {
        return (0, bignumber_js_1.BigNumber)(0);
    }
    let newLTV = oldTotalColleteral
        .multipliedBy(oldLTV)
        .plus(usd_changed.multipliedBy(tokenLTV))
        .div(newTotalCollateral);
    return newLTV;
}
exports.calculateNewLTV = calculateNewLTV;
//liquid threshold has a formula like LTV
function calculateNewLiquidThreshold(oldTotalColleteral, oldLiqThres, newTotalCollateral, tokenLiqThres) {
    if (newTotalCollateral.toFixed(0) == "0") {
        return (0, bignumber_js_1.BigNumber)(0);
    }
    let usd_changed = newTotalCollateral.minus(oldTotalColleteral);
    let newLiqThres = oldTotalColleteral
        .multipliedBy(oldLiqThres)
        .plus(usd_changed.multipliedBy(tokenLiqThres))
        .div(newTotalCollateral);
    return newLiqThres;
}
exports.calculateNewLiquidThreshold = calculateNewLiquidThreshold;
function getBalanceUsdFromAmount(amount, tokenInfo) {
    //get token decimals
    const tokenDecimal = tokenInfo.tToken.decimals;
    const originTokenDecimal = (0, bignumber_js_1.BigNumber)(Math.pow(10, parseInt(tokenDecimal)));
    const tokenPrice = tokenInfo.price;
    const balanceUSD = amount
        .multipliedBy(tokenPrice)
        .div(originTokenDecimal);
    return balanceUSD;
}
exports.getBalanceUsdFromAmount = getBalanceUsdFromAmount;
function getAmountFromBalanceUsd(balanceUsd, tokenInfo) {
    //get token decimals
    const tokenDecimal = tokenInfo.tToken.decimals;
    const originTokenDecimal = (0, bignumber_js_1.BigNumber)(Math.pow(10, parseInt(tokenDecimal)));
    const tokenPrice = tokenInfo.price;
    const amount = balanceUsd
        .multipliedBy(originTokenDecimal)
        .div(tokenPrice);
    return amount;
}
exports.getAmountFromBalanceUsd = getAmountFromBalanceUsd;
function SimulationSupply(appState1, _from, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.BigNumber)(_amount);
            const appState = Object.assign({}, appState1);
            _tokenAddress = _tokenAddress.toLowerCase();
            if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
                if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
                    yield (0, UpdateStateAccount_2.updateUserTokenBalance)(appState, _tokenAddress);
                }
                if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                    amount = calculateMaxAmountSupply(appState, _tokenAddress, "walletState");
                }
                // get token amount
                const tokenAmount = (0, bignumber_js_1.BigNumber)(appState.walletState.tokenBalances.get(_tokenAddress));
                // check amount tokenName on appState is enough .Before check convert string to number
                // if (tokenAmount >= BigInt(amount)) {
                // update appState amount tokenName
                const newAmount = tokenAmount.minus(amount).toFixed(0);
                appState.walletState.tokenBalances.set(_tokenAddress, newAmount);
            }
            else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                // console.log("amount", amount.toFixed(0))
                // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
                if (!appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
                    yield (0, UpdateStateAccount_2.updateSmartWalletTokenBalance)(appState, _tokenAddress);
                }
                if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                    amount = calculateMaxAmountSupply(appState, _tokenAddress, "smartWalletState");
                }
                // get token amount
                const tokenAmount = appState.smartWalletState.tokenBalances.get(_tokenAddress);
                // check amount tokenName on appState is enough .Before check convert string to number
                // if (tokenAmount >= BigInt(amount)) {
                // update appState amount tokenName
                const newAmount = (0, bignumber_js_1.BigNumber)(tokenAmount).minus(amount);
                appState.smartWalletState.tokenBalances.set(_tokenAddress, newAmount.toFixed(0));
            }
            // check tokenAddress is exist on reverseList
            if (!appState.smartWalletState.detailTokenInPool.has(_tokenAddress)) {
                yield (0, UpdateStateAccount_1.updateLPtTokenInfo)(appState, _tokenAddress, "smartWalletState");
            }
            //Update Smart Wallet Position
            let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
            let supplyUSD = getBalanceUsdFromAmount((0, bignumber_js_1.BigNumber)(amount), tokenInfo);
            let oldTotalCollateralUSD = appState.smartWalletState.travaLPState.totalCollateralUSD;
            // newTotalCollateral = oldTotalCOlletearl + amountToken * price / its decimal
            let newTotalCollateralUSD = (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalCollateralUSD)
                .plus(supplyUSD);
            let oldLTV = appState.smartWalletState.travaLPState.ltv;
            let newLTV = calculateNewLTV((0, bignumber_js_1.BigNumber)(oldTotalCollateralUSD), (0, bignumber_js_1.BigNumber)(oldLTV), newTotalCollateralUSD, (0, bignumber_js_1.BigNumber)(tokenInfo.maxLTV));
            //Calculate liquid threshold
            let oldLiquidTreshold = appState.smartWalletState.travaLPState.currentLiquidationThreshold;
            let newLiquidTreshold = calculateNewLiquidThreshold((0, bignumber_js_1.BigNumber)(oldTotalCollateralUSD), (0, bignumber_js_1.BigNumber)(oldLiquidTreshold), newTotalCollateralUSD, (0, bignumber_js_1.BigNumber)(tokenInfo.liqThres));
            // update state of smart wallet trava lp
            // update healthFactor .((deposited + amount * asset.price) * currentLiquidationThreshold) / borrowe
            // if totalDebtUSD = 0  , not update healthFactor
            const healthFactor = calculateNewHealFactor(newTotalCollateralUSD, newLiquidTreshold, (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalDebtUSD));
            const availableBorrowsUSD = calculateNewAvailableBorrow(newTotalCollateralUSD, newLTV, (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalDebtUSD));
            appState.smartWalletState.travaLPState.totalCollateralUSD = newTotalCollateralUSD.toFixed(0);
            appState.smartWalletState.travaLPState.currentLiquidationThreshold = newLiquidTreshold.toFixed(0);
            appState.smartWalletState.travaLPState.ltv = newLTV.toFixed(0);
            appState.smartWalletState.travaLPState.healthFactor = healthFactor.toFixed(0);
            appState.smartWalletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0);
            tokenInfo.tToken = {
                address: tokenInfo.tToken.address,
                decimals: tokenInfo.tToken.decimals,
                balances: (0, bignumber_js_1.BigNumber)(tokenInfo.tToken.balances).plus(amount).toFixed(0),
                totalSupply: (0, bignumber_js_1.BigNumber)(tokenInfo.tToken.totalSupply).plus(supplyUSD).toFixed(0),
                originToken: {
                    balances: (0, bignumber_js_1.BigNumber)(tokenInfo.tToken.originToken.balances).plus(amount).toFixed(0)
                }
            };
            appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationSupply = SimulationSupply;
// need add debt token to smart wallet state
function SimulationBorrow(appState1, _to, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log("amount", _amount)
            let amount = (0, bignumber_js_1.BigNumber)(_amount);
            const appState = Object.assign({}, appState1);
            _tokenAddress = _tokenAddress.toLowerCase();
            // add debToken to smart wallet state if not exist
            let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
            if (typeof tokenInfo.dToken == undefined) {
                yield (0, UpdateStateAccount_1.updateLPDebtTokenInfo)(appState, _tokenAddress);
            }
            if (typeof tokenInfo.tToken == undefined) {
                yield (0, UpdateStateAccount_1.updateLPDebtTokenInfo)(appState, _tokenAddress);
            }
            if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                amount = calculateMaxAmountBorrow(appState, _tokenAddress);
            }
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                _to = appState.walletState.address;
                //  check tokenAddress is on tokenBalance of wallet
                if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
                    yield (0, UpdateStateAccount_2.updateUserTokenBalance)(appState, _tokenAddress);
                }
                appState.walletState.tokenBalances.set(_tokenAddress, (0, bignumber_js_1.BigNumber)(appState.walletState.tokenBalances.get(_tokenAddress))
                    .plus(amount)
                    .toFixed(0));
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                _to = appState.smartWalletState.address;
                //  check tokenAddress is on tokenBalance of smartWallet
                if (!appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
                    yield (0, UpdateStateAccount_2.updateSmartWalletTokenBalance)(appState, _tokenAddress);
                }
                // add debToken to smart wallet state if not exist
                appState.smartWalletState.tokenBalances.set(_tokenAddress, (0, bignumber_js_1.BigNumber)(appState.smartWalletState.tokenBalances.get(_tokenAddress))
                    .plus(amount)
                    .toFixed(0));
            }
            //Update Smart Wallet Position
            let borrowUSD = getBalanceUsdFromAmount(amount, tokenInfo);
            // update totalDebtUSD : borrowed + amount * asset.price
            let newTotalDebtUSD = (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalDebtUSD)
                .plus(borrowUSD);
            let newHealthFactor = calculateNewHealFactor((0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalCollateralUSD), (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.currentLiquidationThreshold), newTotalDebtUSD);
            // update availableBorrowUSD :  deposited * ltv - borrowed - amount * asset.price
            let newAvailableBorrow = calculateNewAvailableBorrow((0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalCollateralUSD), (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.ltv), newTotalDebtUSD);
            appState.smartWalletState.travaLPState.totalDebtUSD = newTotalDebtUSD.toFixed(0);
            appState.smartWalletState.travaLPState.availableBorrowsUSD = newAvailableBorrow.toFixed(0);
            appState.smartWalletState.travaLPState.healthFactor = newHealthFactor.toFixed(0);
            tokenInfo.dToken = {
                address: tokenInfo.dToken.address,
                decimals: tokenInfo.dToken.decimals,
                balances: (0, bignumber_js_1.BigNumber)(tokenInfo.dToken.balances).plus(amount).toFixed(0),
                totalSupply: (0, bignumber_js_1.BigNumber)(tokenInfo.dToken.totalSupply).plus(borrowUSD).toFixed(0),
                originToken: {
                    balances: (0, bignumber_js_1.BigNumber)(tokenInfo.dToken.originToken.balances).minus(amount).toFixed(0)
                }
            };
            appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationBorrow = SimulationBorrow;
// need remove debt token from smart wallet state
function SimulationRepay(appState1, _from, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.BigNumber)(_amount);
            const appState = Object.assign({}, appState1);
            _tokenAddress = _tokenAddress.toLowerCase();
            let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
            if (typeof tokenInfo.tToken == undefined) {
                yield (0, UpdateStateAccount_1.updateLPDebtTokenInfo)(appState, _tokenAddress);
            }
            if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                    amount = calculateMaxAmountRepay(appState, _tokenAddress, "walletState");
                }
                // check tokenAddress is exist on reverseList
                if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
                    yield (0, UpdateStateAccount_2.updateUserTokenBalance)(appState, _tokenAddress);
                }
                // set debt token balance to debtTokenSmartWalletBalance - amount
                appState.walletState.tokenBalances.set(_tokenAddress, (0, bignumber_js_1.BigNumber)(appState.walletState.tokenBalances.get(_tokenAddress))
                    .minus(amount)
                    .toFixed(0));
            }
            else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                    amount = calculateMaxAmountRepay(appState, _tokenAddress, "smartWalletState");
                }
                // check tokenAddress is exist on reverseList
                if (!appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
                    yield (0, UpdateStateAccount_2.updateSmartWalletTokenBalance)(appState, _tokenAddress);
                }
                // set debt token balance to debtTokenSmartWalletBalance - amount
                appState.smartWalletState.tokenBalances.set(_tokenAddress, (0, bignumber_js_1.BigNumber)(appState.smartWalletState.tokenBalances.get(_tokenAddress))
                    .minus(amount)
                    .toFixed(0));
            }
            // repay piece of borrowed token = amount * asset.price
            let repayUSD = getBalanceUsdFromAmount(amount, tokenInfo);
            // update totalDebtUSD : borrowed - amount * asset.price
            let newTotalDebt = (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalDebtUSD).minus(repayUSD);
            let healthFactor = calculateNewHealFactor((0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalCollateralUSD), (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.currentLiquidationThreshold), newTotalDebt);
            // update availableBorrowUSD :  availableBorrowsUSD + amount * asset.price
            let availableBorrowsUSD = calculateNewAvailableBorrow((0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalCollateralUSD), (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.ltv), newTotalDebt);
            appState.smartWalletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0);
            appState.smartWalletState.travaLPState.totalDebtUSD = newTotalDebt.toFixed(0);
            appState.smartWalletState.travaLPState.healthFactor = healthFactor.toFixed(0);
            tokenInfo.dToken = {
                address: tokenInfo.dToken.address,
                decimals: tokenInfo.dToken.decimals,
                balances: (0, bignumber_js_1.BigNumber)(tokenInfo.dToken.balances).minus(amount).toFixed(0),
                totalSupply: (0, bignumber_js_1.BigNumber)(tokenInfo.dToken.totalSupply).minus(repayUSD).toFixed(0),
                originToken: {
                    balances: (0, bignumber_js_1.BigNumber)(tokenInfo.dToken.originToken.balances).plus(amount).toFixed(0)
                }
            };
            appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationRepay = SimulationRepay;
// need remove tToken from smart wallet state
function SimulationWithdraw(appState1, _to, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.BigNumber)(_amount);
            const appState = Object.assign({}, appState1);
            _tokenAddress = _tokenAddress.toLowerCase();
            let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
            if (typeof tokenInfo.tToken == undefined) {
                yield (0, UpdateStateAccount_1.updateLPDebtTokenInfo)(appState, _tokenAddress);
            }
            if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                amount = calculateMaxAmountWithdraw(appState, _tokenAddress);
            }
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                _to = appState.walletState.address.toLowerCase();
                // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
                if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
                    yield (0, UpdateStateAccount_2.updateUserTokenBalance)(appState, _tokenAddress);
                }
                // update token balances
                appState.walletState.tokenBalances.set(_tokenAddress, (0, bignumber_js_1.BigNumber)(appState.walletState.tokenBalances.get(_tokenAddress))
                    .plus(amount)
                    .toFixed(0));
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                _to = appState.smartWalletState.address.toLowerCase();
                // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
                if (!appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
                    yield (0, UpdateStateAccount_2.updateSmartWalletTokenBalance)(appState, _tokenAddress);
                }
                // update token balances
                appState.smartWalletState.tokenBalances.set(_tokenAddress, (0, bignumber_js_1.BigNumber)(appState.smartWalletState.tokenBalances.get(_tokenAddress)).plus(amount).toFixed(0));
            }
            let withdrawUSD = getBalanceUsdFromAmount(amount, tokenInfo);
            let oldTotalCollateralUSD = appState.smartWalletState.travaLPState.totalCollateralUSD;
            let newTotalCollateralUSD = (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalCollateralUSD).minus(withdrawUSD);
            // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
            let oldLTV = appState.smartWalletState.travaLPState.ltv;
            let newLTV = calculateNewLTV((0, bignumber_js_1.BigNumber)(oldTotalCollateralUSD), (0, bignumber_js_1.BigNumber)(oldLTV), newTotalCollateralUSD, (0, bignumber_js_1.BigNumber)(tokenInfo.maxLTV));
            //Calculate liquid threshold
            let oldLiquidTreshold = appState.smartWalletState.travaLPState.currentLiquidationThreshold;
            let newLiquidTreshold = calculateNewLiquidThreshold((0, bignumber_js_1.BigNumber)(oldTotalCollateralUSD), (0, bignumber_js_1.BigNumber)(oldLiquidTreshold), newTotalCollateralUSD, (0, bignumber_js_1.BigNumber)(tokenInfo.liqThres));
            // if totalDebtUSD = 0  , not update healthFactor
            const healthFactor = calculateNewHealFactor(newTotalCollateralUSD, newLiquidTreshold, (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalDebtUSD));
            const availableBorrowsUSD = calculateNewAvailableBorrow(newTotalCollateralUSD, newLTV, (0, bignumber_js_1.BigNumber)(appState.smartWalletState.travaLPState.totalDebtUSD));
            appState.smartWalletState.travaLPState.totalCollateralUSD = newTotalCollateralUSD.toFixed(0);
            appState.smartWalletState.travaLPState.currentLiquidationThreshold = newLiquidTreshold.toFixed(0);
            appState.smartWalletState.travaLPState.ltv = newLTV.toFixed(0);
            appState.smartWalletState.travaLPState.healthFactor = healthFactor.toFixed(0);
            appState.smartWalletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0);
            tokenInfo.tToken = {
                address: tokenInfo.tToken.address,
                decimals: tokenInfo.tToken.decimals,
                balances: (0, bignumber_js_1.BigNumber)(tokenInfo.tToken.balances).minus(amount).toFixed(0),
                totalSupply: (0, bignumber_js_1.BigNumber)(tokenInfo.tToken.totalSupply).minus(withdrawUSD).toFixed(0),
                originToken: {
                    balances: (0, bignumber_js_1.BigNumber)(tokenInfo.tToken.originToken.balances).minus(amount).toFixed(0)
                }
            };
            appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationWithdraw = SimulationWithdraw;
function SimulationClaimReward(appState1, _to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let amount = (0, bignumber_js_1.BigNumber)(_amount);
            const rTravaAddress = appState.smartWalletState.travaLPState.lpReward.tokenAddress;
            let maxReward = appState.smartWalletState.travaLPState.lpReward.claimableReward;
            if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                amount = (0, bignumber_js_1.BigNumber)(maxReward);
            }
            appState.smartWalletState.travaLPState.lpReward.claimableReward = ((0, bignumber_js_1.BigNumber)(maxReward).minus(amount)).toFixed(0);
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                _to = appState.walletState.address;
                if (!appState.walletState.tokenBalances.has(rTravaAddress)) {
                    appState = yield (0, UpdateStateAccount_2.updateUserTokenBalance)(appState, rTravaAddress);
                }
                appState.walletState.tokenBalances.set(rTravaAddress, (0, bignumber_js_1.BigNumber)(appState.walletState.tokenBalances.get(rTravaAddress)).plus(amount).toFixed(0));
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                _to = appState.smartWalletState.address;
                if (!appState.smartWalletState.tokenBalances.has(rTravaAddress)) {
                    appState = yield (0, UpdateStateAccount_2.updateSmartWalletTokenBalance)(appState, rTravaAddress);
                }
                appState.smartWalletState.tokenBalances.set(rTravaAddress, (0, bignumber_js_1.BigNumber)(appState.smartWalletState.tokenBalances.get(rTravaAddress)).plus(amount).toFixed(0));
            }
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
exports.SimulationClaimReward = SimulationClaimReward;
function SimulationConvertReward(appState1, from, to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let amount = (0, bignumber_js_1.BigNumber)(_amount);
            const rTravaAddress = appState.smartWalletState.travaLPState.lpReward.tokenAddress;
            if (from == appState.walletState.address) {
                if (!appState.walletState.tokenBalances.has(rTravaAddress)) {
                    appState = yield (0, UpdateStateAccount_2.updateUserTokenBalance)(appState, rTravaAddress);
                }
                const rTravaBalance = appState.walletState.tokenBalances.get(rTravaAddress);
                if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                    amount = (0, bignumber_js_1.BigNumber)(rTravaBalance);
                }
                appState.walletState.tokenBalances.set(rTravaAddress, (0, bignumber_js_1.BigNumber)(rTravaBalance).minus(amount).toFixed(0));
            }
            else if (from == appState.smartWalletState.address) {
                if (!appState.smartWalletState.tokenBalances.has(rTravaAddress)) {
                    appState = yield (0, UpdateStateAccount_2.updateSmartWalletTokenBalance)(appState, rTravaAddress);
                }
                const rTravaBalance = appState.smartWalletState.tokenBalances.get(rTravaAddress);
                if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                    amount = (0, bignumber_js_1.BigNumber)(rTravaBalance);
                }
                appState.smartWalletState.tokenBalances.set(rTravaAddress, (0, bignumber_js_1.BigNumber)(rTravaBalance).minus(amount).toFixed(0));
            }
            const travaAddress = (0, address_1.getAddr)("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase();
            if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                to = appState.walletState.address;
                if (!appState.walletState.tokenBalances.has(travaAddress)) {
                    appState = yield (0, UpdateStateAccount_2.updateUserTokenBalance)(appState, travaAddress);
                }
                const travaBalance = appState.walletState.tokenBalances.get(travaAddress);
                appState.walletState.tokenBalances.set(travaAddress, (0, bignumber_js_1.BigNumber)(travaBalance).plus(amount).toFixed(0));
            }
            else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                to = appState.smartWalletState.address;
                if (!appState.smartWalletState.tokenBalances.has(travaAddress)) {
                    appState = yield (0, UpdateStateAccount_2.updateSmartWalletTokenBalance)(appState, travaAddress);
                }
                const travaBalance = appState.smartWalletState.tokenBalances.get(travaAddress);
                appState.smartWalletState.tokenBalances.set(travaAddress, (0, bignumber_js_1.BigNumber)(travaBalance).plus(amount).toFixed(0));
            }
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
exports.SimulationConvertReward = SimulationConvertReward;
function SimulationTransferTToken(appState1, _from, _to, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = (0, bignumber_js_1.BigNumber)(_amount);
            let appState = Object.assign({}, appState1);
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            appState = yield (0, UpdateStateAccount_1.updateTravaLPInfo)(appState);
            appState = yield (0, UpdateStateAccount_1.updateTokenInPoolInfo)(appState, _from.toLowerCase());
            let tokenInfoFrom = appState[modeFrom].detailTokenInPool.get(tokenAddress);
            if (amount.toFixed(0) == config_1.MAX_UINT256 || amount.isEqualTo(config_1.MAX_UINT256)) {
                amount = calculateMaxAmountTransferTToken(appState, _tokenAddress, _from.toLowerCase());
            }
            // check tokenAddress is exist on reverseList
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, UpdateStateAccount_2.updateUserTokenBalance)(appState, tokenAddress);
            }
            let transferUSD = getBalanceUsdFromAmount(amount, tokenInfoFrom);
            let oldTotalCollateralUSDOfFrom = appState[modeFrom].travaLPState.totalCollateralUSD;
            let newTotalCollateralUSDOfFrom = (0, bignumber_js_1.BigNumber)(appState[modeFrom].travaLPState.totalCollateralUSD).minus(transferUSD);
            // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
            let oldLTVOfFrom = appState[modeFrom].travaLPState.ltv;
            let newLTVOfFrom = calculateNewLTV((0, bignumber_js_1.BigNumber)(oldTotalCollateralUSDOfFrom), (0, bignumber_js_1.BigNumber)(oldLTVOfFrom), newTotalCollateralUSDOfFrom, (0, bignumber_js_1.BigNumber)(tokenInfoFrom.maxLTV));
            //Calculate liquid threshold
            let oldLiquidTresholdOfFrom = appState[modeFrom].travaLPState.currentLiquidationThreshold;
            let newLiquidTresholdOfFrom = calculateNewLiquidThreshold((0, bignumber_js_1.BigNumber)(oldTotalCollateralUSDOfFrom), (0, bignumber_js_1.BigNumber)(oldLiquidTresholdOfFrom), newTotalCollateralUSDOfFrom, (0, bignumber_js_1.BigNumber)(tokenInfoFrom.liqThres));
            // if totalDebtUSD = 0  , not update healthFactor
            const healthFactorOfFrom = calculateNewHealFactor(newTotalCollateralUSDOfFrom, newLiquidTresholdOfFrom, (0, bignumber_js_1.BigNumber)(appState[modeFrom].travaLPState.totalDebtUSD));
            const availableBorrowsUSDOfFrom = calculateNewAvailableBorrow(newTotalCollateralUSDOfFrom, newLTVOfFrom, (0, bignumber_js_1.BigNumber)(appState[modeFrom].travaLPState.totalDebtUSD));
            appState[modeFrom].travaLPState.totalCollateralUSD = newTotalCollateralUSDOfFrom.toFixed(0);
            appState[modeFrom].travaLPState.currentLiquidationThreshold = newLiquidTresholdOfFrom.toFixed(0);
            appState[modeFrom].travaLPState.ltv = newLTVOfFrom.toFixed(0);
            appState[modeFrom].travaLPState.healthFactor = healthFactorOfFrom.toFixed(0);
            appState[modeFrom].travaLPState.availableBorrowsUSD = availableBorrowsUSDOfFrom.toFixed(0);
            tokenInfoFrom.tToken = {
                address: tokenInfoFrom.tToken.address,
                decimals: tokenInfoFrom.tToken.decimals,
                balances: (0, bignumber_js_1.BigNumber)(tokenInfoFrom.tToken.balances).minus(amount).toFixed(0),
                totalSupply: (0, bignumber_js_1.BigNumber)(tokenInfoFrom.tToken.totalSupply).minus(amount).toFixed(0),
                originToken: {
                    balances: (0, bignumber_js_1.BigNumber)(tokenInfoFrom.tToken.originToken.balances).toFixed(0)
                }
            };
            appState[modeFrom].detailTokenInPool.set(tokenAddress, tokenInfoFrom);
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase() || _to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                let modeTo = (0, helper_1.getMode)(appState, _to);
                appState = yield (0, UpdateStateAccount_1.updateTokenInPoolInfo)(appState, _to.toLowerCase());
                let tokenInfoTo = appState[modeTo].detailTokenInPool.get(tokenAddress);
                // check tokenAddress is exist on reverseList
                if (!appState[modeTo].tokenBalances.has(tokenAddress)) {
                    appState = yield (0, UpdateStateAccount_2.updateUserTokenBalance)(appState, tokenAddress);
                }
                let receiveUSD = getBalanceUsdFromAmount(amount, tokenInfoTo);
                let oldTotalCollateralUSDOfTo = appState[modeTo].travaLPState.totalCollateralUSD;
                let newTotalCollateralUSDOfTo = (0, bignumber_js_1.BigNumber)(appState[modeTo].travaLPState.totalCollateralUSD).plus(receiveUSD);
                // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
                let oldLTVOfTo = appState[modeTo].travaLPState.ltv;
                let newLTVOfTo = calculateNewLTV((0, bignumber_js_1.BigNumber)(oldTotalCollateralUSDOfTo), (0, bignumber_js_1.BigNumber)(oldLTVOfTo), newTotalCollateralUSDOfTo, (0, bignumber_js_1.BigNumber)(tokenInfoTo.maxLTV));
                //Calculate liquid threshold
                let oldLiquidTresholdOfTo = appState[modeTo].travaLPState.currentLiquidationThreshold;
                let newLiquidTresholdOfTo = calculateNewLiquidThreshold((0, bignumber_js_1.BigNumber)(oldTotalCollateralUSDOfTo), (0, bignumber_js_1.BigNumber)(oldLiquidTresholdOfTo), newTotalCollateralUSDOfTo, (0, bignumber_js_1.BigNumber)(tokenInfoTo.liqThres));
                // if totalDebtUSD = 0  , not update healthFactor
                const healthFactorOfTo = calculateNewHealFactor(newTotalCollateralUSDOfTo, newLiquidTresholdOfTo, (0, bignumber_js_1.BigNumber)(appState[modeTo].travaLPState.totalDebtUSD));
                const availableBorrowsUSDOfTo = calculateNewAvailableBorrow(newTotalCollateralUSDOfTo, newLTVOfTo, (0, bignumber_js_1.BigNumber)(appState[modeTo].travaLPState.totalDebtUSD));
                appState[modeTo].travaLPState.totalCollateralUSD = newTotalCollateralUSDOfTo.toFixed(0);
                appState[modeTo].travaLPState.currentLiquidationThreshold = newLiquidTresholdOfTo.toFixed(0);
                appState[modeTo].travaLPState.ltv = newLTVOfTo.toFixed(0);
                appState[modeTo].travaLPState.healthFactor = healthFactorOfTo.toFixed(0);
                appState[modeTo].travaLPState.availableBorrowsUSD = availableBorrowsUSDOfTo.toFixed(0);
                tokenInfoTo.tToken = {
                    address: tokenInfoTo.tToken.address,
                    decimals: tokenInfoTo.tToken.decimals,
                    balances: (0, bignumber_js_1.BigNumber)(tokenInfoTo.tToken.balances).plus(amount).toFixed(0),
                    totalSupply: (0, bignumber_js_1.BigNumber)(tokenInfoTo.tToken.totalSupply).plus(amount).toFixed(0),
                    originToken: {
                        balances: (0, bignumber_js_1.BigNumber)(tokenInfoTo.tToken.originToken.balances).toFixed(0)
                    }
                };
                appState[modeTo].detailTokenInPool.set(tokenAddress, tokenInfoTo);
            }
            ;
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.SimulationTransferTToken = SimulationTransferTToken;
