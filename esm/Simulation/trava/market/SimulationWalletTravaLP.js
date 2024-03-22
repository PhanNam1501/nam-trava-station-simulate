var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { convertHexStringToAddress, getAddr } from "../../../utils/address";
import { Contract } from "ethers";
import { MAX_UINT256, percentMul, wadDiv } from "../../../utils/config";
import IncentiveContractABI from "../../../abis/IncentiveContract.json";
import { BigNumber } from "bignumber.js";
import { updateLPDebtTokenInfo, updateLPtTokenInfo, updateTokenInPoolInfo, updateTravaLPInfo } from "./UpdateStateAccount";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../../basic/UpdateStateAccount";
import { getMode } from "../../../utils/helper";
export function calculateMaxRewards(appState) {
    return __awaiter(this, void 0, void 0, function* () {
        let listTDTokenRewardsAddress = getListTDTokenRewardsAddress(appState);
        const travaIncentiveContract = new Contract(getAddr("INCENTIVE_CONTRACT", appState.chainId), IncentiveContractABI, appState.web3);
        let maxRewardCanGet = yield travaIncentiveContract.getRewardsBalance(listTDTokenRewardsAddress, appState.smartWalletState.address);
        return maxRewardCanGet;
    });
}
export function getListTDTokenRewardsAddress(appState) {
    let detailTokenInPool = appState.smartWalletState.detailTokenInPool;
    let listTDTokenRewardsAddress = new Array();
    detailTokenInPool.forEach(token => {
        if (BigNumber(token.tToken.balances).isGreaterThan(0)) {
            listTDTokenRewardsAddress.push(convertHexStringToAddress(token.tToken.address));
        }
        if (BigNumber(token.dToken.balances).isGreaterThan(0.00001)) {
            listTDTokenRewardsAddress.push(convertHexStringToAddress(token.dToken.address));
        }
    });
    return listTDTokenRewardsAddress;
}
export function calculateMaxAmountSupply(appState, _tokenAddress, mode) {
    let tokenAddress = _tokenAddress.toLowerCase();
    const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
    if (typeof walletBalance == undefined) {
        throw new Error("Token is not init in " + mode + " state!");
    }
    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress);
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in smart wallet lending pool state!");
    }
    return BigNumber(appState[mode].tokenBalances.get(tokenAddress));
}
export function calculateMaxAmountBorrow(appState, _tokenAddress) {
    let tokenAddress = _tokenAddress.toLowerCase();
    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress);
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in smart wallet lending pool state!");
    }
    const tTokenReserveBalanceRaw = BigNumber(tokenInfo.tToken.originToken.balances);
    const tTokenReserveBalance = BigNumber(tTokenReserveBalanceRaw).div(BigNumber("10").pow(tokenInfo.tToken.decimals));
    const availableBorrowsUSD = BigNumber(appState.smartWalletState.travaLPState.availableBorrowsUSD);
    const nativeAvailableBorrow = availableBorrowsUSD.div(tokenInfo.price);
    return BigNumber.max(BigNumber.min(nativeAvailableBorrow, tTokenReserveBalance), 0).multipliedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
}
export function calculateMaxAmountRepay(appState, _tokenAddress, mode) {
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
    const borrowed = new BigNumber(dTokenBalance);
    return BigNumber.max(BigNumber.min(walletBalance, borrowed), 0);
}
export function calculateMaxAmountWithdraw(appState, _tokenAddress) {
    let tokenAddress = _tokenAddress.toLowerCase();
    let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddress.toLowerCase());
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in smart wallet lending pool state!");
    }
    const depositedRaw = tokenInfo.tToken.balances;
    const deposited = BigNumber(depositedRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
    const tTokenReserveBalanceRaw = tokenInfo.tToken.originToken.balances;
    const tTokenReserveBalance = BigNumber(tTokenReserveBalanceRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
    let nativeAvailableWithdraw = BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD)
        .minus(BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD).div(BigNumber(appState.smartWalletState.travaLPState.ltv)))
        .div(tokenInfo.price);
    const available = BigNumber(tokenInfo.tToken.totalSupply).minus(tokenInfo.dToken.totalSupply).div(tokenInfo.price);
    if (nativeAvailableWithdraw.isNaN()) {
        nativeAvailableWithdraw = BigNumber(0);
    }
    return BigNumber.max(BigNumber.min(deposited, nativeAvailableWithdraw, tTokenReserveBalance, available), 0).multipliedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
}
export function calculateMaxAmountTransferTToken(appState, _tokenAddress, _from) {
    let modeFrom = getMode(appState, _from);
    let tokenAddress = _tokenAddress.toLowerCase();
    let tokenInfo = appState[modeFrom].detailTokenInPool.get(tokenAddress.toLowerCase());
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in lending pool state!");
    }
    const depositedRaw = tokenInfo.tToken.balances;
    const deposited = BigNumber(depositedRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
    const tTokenReserveBalanceRaw = tokenInfo.tToken.originToken.balances;
    const tTokenReserveBalance = BigNumber(tTokenReserveBalanceRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
    let nativeAvailableTransfer = BigNumber(appState[modeFrom].travaLPState.totalCollateralUSD)
        .minus(BigNumber(appState[modeFrom].travaLPState.totalDebtUSD).div(BigNumber(appState[modeFrom].travaLPState.ltv)))
        .div(tokenInfo.price);
    const available = BigNumber(tokenInfo.tToken.totalSupply).minus(tokenInfo.dToken.totalSupply).div(tokenInfo.price);
    if (nativeAvailableTransfer.isNaN()) {
        nativeAvailableTransfer = BigNumber(0);
    }
    return BigNumber.max(BigNumber.min(deposited, nativeAvailableTransfer, tTokenReserveBalance, available), 0).multipliedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
}
export function calculateNewAvailableBorrow(newTotalCollateral, newLTV, newTotalDebt) {
    return percentMul(newTotalCollateral, newLTV)
        .minus(newTotalDebt);
}
export function calculateNewHealFactor(newTotalCollateral, newLiquidationThreshold, newTotalDebt) {
    if (newTotalDebt.toFixed(0) == "0") {
        return BigNumber(MAX_UINT256);
    }
    return wadDiv(percentMul(newTotalCollateral, newLiquidationThreshold), newTotalDebt);
}
// ltv = sum(C[i] * ltv[i]) / sum(C[i]) with C[i] is colleteral of token[i] and ltv[i] is ltv of this token
// <=> oldLtv = sum(C[i] * ltv[i]) / oldTotalColleteral
// newLTV = (sum(C[i] * ltv[i]) + (new C'[i] * ltv[i] )) /(oldTotalColleteral + C'[i])
// => newLTV = (oldLTV * oldTotalColleteral + new C'[i] * ltv[i]) / newTotalColleteral
// <=> newLTV = (oldLTV * oldTotalColleteral + new amount * tokenPrice[i] / tokenDecimal[i]) / newTOtalColleteral
// if amount == 0, LTV is unchanged
export function calculateNewLTV(oldTotalColleteral, oldLTV, newTotalCollateral, tokenLTV) {
    let usd_changed = newTotalCollateral.minus(oldTotalColleteral);
    if (usd_changed.toFixed(0) == "0") {
        return oldLTV;
    }
    if (newTotalCollateral.toFixed(0) == "0") {
        return BigNumber(0);
    }
    let newLTV = oldTotalColleteral
        .multipliedBy(oldLTV)
        .plus(usd_changed.multipliedBy(tokenLTV))
        .div(newTotalCollateral);
    return newLTV;
}
//liquid threshold has a formula like LTV
export function calculateNewLiquidThreshold(oldTotalColleteral, oldLiqThres, newTotalCollateral, tokenLiqThres) {
    if (newTotalCollateral.toFixed(0) == "0") {
        return BigNumber(0);
    }
    let usd_changed = newTotalCollateral.minus(oldTotalColleteral);
    let newLiqThres = oldTotalColleteral
        .multipliedBy(oldLiqThres)
        .plus(usd_changed.multipliedBy(tokenLiqThres))
        .div(newTotalCollateral);
    return newLiqThres;
}
export function getBalanceUsdFromAmount(amount, tokenInfo) {
    //get token decimals
    const tokenDecimal = tokenInfo.tToken.decimals;
    const originTokenDecimal = BigNumber(Math.pow(10, parseInt(tokenDecimal)));
    const tokenPrice = tokenInfo.price;
    const balanceUSD = amount
        .multipliedBy(tokenPrice)
        .div(originTokenDecimal);
    return balanceUSD;
}
export function getAmountFromBalanceUsd(balanceUsd, tokenInfo) {
    //get token decimals
    const tokenDecimal = tokenInfo.tToken.decimals;
    const originTokenDecimal = BigNumber(Math.pow(10, parseInt(tokenDecimal)));
    const tokenPrice = tokenInfo.price;
    const amount = balanceUsd
        .multipliedBy(originTokenDecimal)
        .div(tokenPrice);
    return amount;
}
export function SimulationSupply(appState1, _from, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            const appState = Object.assign({}, appState1);
            _tokenAddress = _tokenAddress.toLowerCase();
            if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
                if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
                    yield updateUserTokenBalance(appState, _tokenAddress);
                }
                if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                    amount = calculateMaxAmountSupply(appState, _tokenAddress, "walletState");
                }
                // get token amount
                const tokenAmount = BigNumber(appState.walletState.tokenBalances.get(_tokenAddress));
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
                    yield updateSmartWalletTokenBalance(appState, _tokenAddress);
                }
                if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                    amount = calculateMaxAmountSupply(appState, _tokenAddress, "smartWalletState");
                }
                // get token amount
                const tokenAmount = appState.smartWalletState.tokenBalances.get(_tokenAddress);
                // check amount tokenName on appState is enough .Before check convert string to number
                // if (tokenAmount >= BigInt(amount)) {
                // update appState amount tokenName
                const newAmount = BigNumber(tokenAmount).minus(amount);
                appState.smartWalletState.tokenBalances.set(_tokenAddress, newAmount.toFixed(0));
            }
            // check tokenAddress is exist on reverseList
            if (!appState.smartWalletState.detailTokenInPool.has(_tokenAddress)) {
                yield updateLPtTokenInfo(appState, _tokenAddress, "smartWalletState");
            }
            //Update Smart Wallet Position
            let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
            let supplyUSD = getBalanceUsdFromAmount(BigNumber(amount), tokenInfo);
            let oldTotalCollateralUSD = appState.smartWalletState.travaLPState.totalCollateralUSD;
            // newTotalCollateral = oldTotalCOlletearl + amountToken * price / its decimal
            let newTotalCollateralUSD = BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD)
                .plus(supplyUSD);
            let oldLTV = appState.smartWalletState.travaLPState.ltv;
            let newLTV = calculateNewLTV(BigNumber(oldTotalCollateralUSD), BigNumber(oldLTV), newTotalCollateralUSD, BigNumber(tokenInfo.maxLTV));
            //Calculate liquid threshold
            let oldLiquidTreshold = appState.smartWalletState.travaLPState.currentLiquidationThreshold;
            let newLiquidTreshold = calculateNewLiquidThreshold(BigNumber(oldTotalCollateralUSD), BigNumber(oldLiquidTreshold), newTotalCollateralUSD, BigNumber(tokenInfo.liqThres));
            // update state of smart wallet trava lp
            // update healthFactor .((deposited + amount * asset.price) * currentLiquidationThreshold) / borrowe
            // if totalDebtUSD = 0  , not update healthFactor
            const healthFactor = calculateNewHealFactor(newTotalCollateralUSD, newLiquidTreshold, BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD));
            const availableBorrowsUSD = calculateNewAvailableBorrow(newTotalCollateralUSD, newLTV, BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD));
            appState.smartWalletState.travaLPState.totalCollateralUSD = newTotalCollateralUSD.toFixed(0);
            appState.smartWalletState.travaLPState.currentLiquidationThreshold = newLiquidTreshold.toFixed(0);
            appState.smartWalletState.travaLPState.ltv = newLTV.toFixed(0);
            appState.smartWalletState.travaLPState.healthFactor = healthFactor.toFixed(0);
            appState.smartWalletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0);
            tokenInfo.tToken = {
                address: tokenInfo.tToken.address,
                decimals: tokenInfo.tToken.decimals,
                balances: BigNumber(tokenInfo.tToken.balances).plus(amount).toFixed(0),
                totalSupply: BigNumber(tokenInfo.tToken.totalSupply).plus(supplyUSD).toFixed(0),
                originToken: {
                    balances: BigNumber(tokenInfo.tToken.originToken.balances).plus(amount).toFixed(0)
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
// need add debt token to smart wallet state
export function SimulationBorrow(appState1, _to, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log("amount", _amount)
            let amount = BigNumber(_amount);
            const appState = Object.assign({}, appState1);
            _tokenAddress = _tokenAddress.toLowerCase();
            // add debToken to smart wallet state if not exist
            let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
            if (typeof tokenInfo.dToken == undefined) {
                yield updateLPDebtTokenInfo(appState, _tokenAddress);
            }
            if (typeof tokenInfo.tToken == undefined) {
                yield updateLPDebtTokenInfo(appState, _tokenAddress);
            }
            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = calculateMaxAmountBorrow(appState, _tokenAddress);
            }
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                _to = appState.walletState.address;
                //  check tokenAddress is on tokenBalance of wallet
                if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
                    yield updateUserTokenBalance(appState, _tokenAddress);
                }
                appState.walletState.tokenBalances.set(_tokenAddress, BigNumber(appState.walletState.tokenBalances.get(_tokenAddress))
                    .plus(amount)
                    .toFixed(0));
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                _to = appState.smartWalletState.address;
                //  check tokenAddress is on tokenBalance of smartWallet
                if (!appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
                    yield updateSmartWalletTokenBalance(appState, _tokenAddress);
                }
                // add debToken to smart wallet state if not exist
                appState.smartWalletState.tokenBalances.set(_tokenAddress, BigNumber(appState.smartWalletState.tokenBalances.get(_tokenAddress))
                    .plus(amount)
                    .toFixed(0));
            }
            //Update Smart Wallet Position
            let borrowUSD = getBalanceUsdFromAmount(amount, tokenInfo);
            // update totalDebtUSD : borrowed + amount * asset.price
            let newTotalDebtUSD = BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD)
                .plus(borrowUSD);
            let newHealthFactor = calculateNewHealFactor(BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD), BigNumber(appState.smartWalletState.travaLPState.currentLiquidationThreshold), newTotalDebtUSD);
            // update availableBorrowUSD :  deposited * ltv - borrowed - amount * asset.price
            let newAvailableBorrow = calculateNewAvailableBorrow(BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD), BigNumber(appState.smartWalletState.travaLPState.ltv), newTotalDebtUSD);
            appState.smartWalletState.travaLPState.totalDebtUSD = newTotalDebtUSD.toFixed(0);
            appState.smartWalletState.travaLPState.availableBorrowsUSD = newAvailableBorrow.toFixed(0);
            appState.smartWalletState.travaLPState.healthFactor = newHealthFactor.toFixed(0);
            tokenInfo.dToken = {
                address: tokenInfo.dToken.address,
                decimals: tokenInfo.dToken.decimals,
                balances: BigNumber(tokenInfo.dToken.balances).plus(amount).toFixed(0),
                totalSupply: BigNumber(tokenInfo.dToken.totalSupply).plus(borrowUSD).toFixed(0),
                originToken: {
                    balances: BigNumber(tokenInfo.dToken.originToken.balances).minus(amount).toFixed(0)
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
// need remove debt token from smart wallet state
export function SimulationRepay(appState1, _from, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            const appState = Object.assign({}, appState1);
            _tokenAddress = _tokenAddress.toLowerCase();
            let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
            if (typeof tokenInfo.tToken == undefined) {
                yield updateLPDebtTokenInfo(appState, _tokenAddress);
            }
            if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                    amount = calculateMaxAmountRepay(appState, _tokenAddress, "walletState");
                }
                // check tokenAddress is exist on reverseList
                if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
                    yield updateUserTokenBalance(appState, _tokenAddress);
                }
                // set debt token balance to debtTokenSmartWalletBalance - amount
                appState.walletState.tokenBalances.set(_tokenAddress, BigNumber(appState.walletState.tokenBalances.get(_tokenAddress))
                    .minus(amount)
                    .toFixed(0));
            }
            else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                    amount = calculateMaxAmountRepay(appState, _tokenAddress, "smartWalletState");
                }
                // check tokenAddress is exist on reverseList
                if (!appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
                    yield updateSmartWalletTokenBalance(appState, _tokenAddress);
                }
                // set debt token balance to debtTokenSmartWalletBalance - amount
                appState.smartWalletState.tokenBalances.set(_tokenAddress, BigNumber(appState.smartWalletState.tokenBalances.get(_tokenAddress))
                    .minus(amount)
                    .toFixed(0));
            }
            // repay piece of borrowed token = amount * asset.price
            let repayUSD = getBalanceUsdFromAmount(amount, tokenInfo);
            // update totalDebtUSD : borrowed - amount * asset.price
            let newTotalDebt = BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD).minus(repayUSD);
            let healthFactor = calculateNewHealFactor(BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD), BigNumber(appState.smartWalletState.travaLPState.currentLiquidationThreshold), newTotalDebt);
            // update availableBorrowUSD :  availableBorrowsUSD + amount * asset.price
            let availableBorrowsUSD = calculateNewAvailableBorrow(BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD), BigNumber(appState.smartWalletState.travaLPState.ltv), newTotalDebt);
            appState.smartWalletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0);
            appState.smartWalletState.travaLPState.totalDebtUSD = newTotalDebt.toFixed(0);
            appState.smartWalletState.travaLPState.healthFactor = healthFactor.toFixed(0);
            tokenInfo.dToken = {
                address: tokenInfo.dToken.address,
                decimals: tokenInfo.dToken.decimals,
                balances: BigNumber(tokenInfo.dToken.balances).minus(amount).toFixed(0),
                totalSupply: BigNumber(tokenInfo.dToken.totalSupply).minus(repayUSD).toFixed(0),
                originToken: {
                    balances: BigNumber(tokenInfo.dToken.originToken.balances).plus(amount).toFixed(0)
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
// need remove tToken from smart wallet state
export function SimulationWithdraw(appState1, _to, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            const appState = Object.assign({}, appState1);
            _tokenAddress = _tokenAddress.toLowerCase();
            let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
            if (typeof tokenInfo.tToken == undefined) {
                yield updateLPDebtTokenInfo(appState, _tokenAddress);
            }
            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = calculateMaxAmountWithdraw(appState, _tokenAddress);
            }
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                _to = appState.walletState.address.toLowerCase();
                // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
                if (!appState.walletState.tokenBalances.has(_tokenAddress)) {
                    yield updateUserTokenBalance(appState, _tokenAddress);
                }
                // update token balances
                appState.walletState.tokenBalances.set(_tokenAddress, BigNumber(appState.walletState.tokenBalances.get(_tokenAddress))
                    .plus(amount)
                    .toFixed(0));
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                _to = appState.smartWalletState.address.toLowerCase();
                // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
                if (!appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
                    yield updateSmartWalletTokenBalance(appState, _tokenAddress);
                }
                // update token balances
                appState.smartWalletState.tokenBalances.set(_tokenAddress, BigNumber(appState.smartWalletState.tokenBalances.get(_tokenAddress)).plus(amount).toFixed(0));
            }
            let withdrawUSD = getBalanceUsdFromAmount(amount, tokenInfo);
            let oldTotalCollateralUSD = appState.smartWalletState.travaLPState.totalCollateralUSD;
            let newTotalCollateralUSD = BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD).minus(withdrawUSD);
            // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
            let oldLTV = appState.smartWalletState.travaLPState.ltv;
            let newLTV = calculateNewLTV(BigNumber(oldTotalCollateralUSD), BigNumber(oldLTV), newTotalCollateralUSD, BigNumber(tokenInfo.maxLTV));
            //Calculate liquid threshold
            let oldLiquidTreshold = appState.smartWalletState.travaLPState.currentLiquidationThreshold;
            let newLiquidTreshold = calculateNewLiquidThreshold(BigNumber(oldTotalCollateralUSD), BigNumber(oldLiquidTreshold), newTotalCollateralUSD, BigNumber(tokenInfo.liqThres));
            // if totalDebtUSD = 0  , not update healthFactor
            const healthFactor = calculateNewHealFactor(newTotalCollateralUSD, newLiquidTreshold, BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD));
            const availableBorrowsUSD = calculateNewAvailableBorrow(newTotalCollateralUSD, newLTV, BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD));
            appState.smartWalletState.travaLPState.totalCollateralUSD = newTotalCollateralUSD.toFixed(0);
            appState.smartWalletState.travaLPState.currentLiquidationThreshold = newLiquidTreshold.toFixed(0);
            appState.smartWalletState.travaLPState.ltv = newLTV.toFixed(0);
            appState.smartWalletState.travaLPState.healthFactor = healthFactor.toFixed(0);
            appState.smartWalletState.travaLPState.availableBorrowsUSD = availableBorrowsUSD.toFixed(0);
            tokenInfo.tToken = {
                address: tokenInfo.tToken.address,
                decimals: tokenInfo.tToken.decimals,
                balances: BigNumber(tokenInfo.tToken.balances).minus(amount).toFixed(0),
                totalSupply: BigNumber(tokenInfo.tToken.totalSupply).minus(withdrawUSD).toFixed(0),
                originToken: {
                    balances: BigNumber(tokenInfo.tToken.originToken.balances).minus(amount).toFixed(0)
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
export function SimulationClaimReward(appState1, _to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let amount = BigNumber(_amount);
            const rTravaAddress = appState.smartWalletState.travaLPState.lpReward.tokenAddress;
            let maxReward = appState.smartWalletState.travaLPState.lpReward.claimableReward;
            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = BigNumber(maxReward);
            }
            appState.smartWalletState.travaLPState.lpReward.claimableReward = (BigNumber(maxReward).minus(amount)).toFixed(0);
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                _to = appState.walletState.address;
                if (!appState.walletState.tokenBalances.has(rTravaAddress)) {
                    appState = yield updateUserTokenBalance(appState, rTravaAddress);
                }
                appState.walletState.tokenBalances.set(rTravaAddress, BigNumber(appState.walletState.tokenBalances.get(rTravaAddress)).plus(amount).toFixed(0));
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                _to = appState.smartWalletState.address;
                if (!appState.smartWalletState.tokenBalances.has(rTravaAddress)) {
                    appState = yield updateSmartWalletTokenBalance(appState, rTravaAddress);
                }
                appState.smartWalletState.tokenBalances.set(rTravaAddress, BigNumber(appState.smartWalletState.tokenBalances.get(rTravaAddress)).plus(amount).toFixed(0));
            }
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
export function SimulationConvertReward(appState1, from, to, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let amount = BigNumber(_amount);
            const rTravaAddress = appState.smartWalletState.travaLPState.lpReward.tokenAddress;
            if (from == appState.walletState.address) {
                if (!appState.walletState.tokenBalances.has(rTravaAddress)) {
                    appState = yield updateUserTokenBalance(appState, rTravaAddress);
                }
                const rTravaBalance = appState.walletState.tokenBalances.get(rTravaAddress);
                if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                    amount = BigNumber(rTravaBalance);
                }
                appState.walletState.tokenBalances.set(rTravaAddress, BigNumber(rTravaBalance).minus(amount).toFixed(0));
            }
            else if (from == appState.smartWalletState.address) {
                if (!appState.smartWalletState.tokenBalances.has(rTravaAddress)) {
                    appState = yield updateSmartWalletTokenBalance(appState, rTravaAddress);
                }
                const rTravaBalance = appState.smartWalletState.tokenBalances.get(rTravaAddress);
                if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                    amount = BigNumber(rTravaBalance);
                }
                appState.smartWalletState.tokenBalances.set(rTravaAddress, BigNumber(rTravaBalance).minus(amount).toFixed(0));
            }
            const travaAddress = getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase();
            if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                to = appState.walletState.address;
                if (!appState.walletState.tokenBalances.has(travaAddress)) {
                    appState = yield updateUserTokenBalance(appState, travaAddress);
                }
                const travaBalance = appState.walletState.tokenBalances.get(travaAddress);
                appState.walletState.tokenBalances.set(travaAddress, BigNumber(travaBalance).plus(amount).toFixed(0));
            }
            else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                to = appState.smartWalletState.address;
                if (!appState.smartWalletState.tokenBalances.has(travaAddress)) {
                    appState = yield updateSmartWalletTokenBalance(appState, travaAddress);
                }
                const travaBalance = appState.smartWalletState.tokenBalances.get(travaAddress);
                appState.smartWalletState.tokenBalances.set(travaAddress, BigNumber(travaBalance).plus(amount).toFixed(0));
            }
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
export function SimulationTransferTToken(appState1, _from, _to, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            let appState = Object.assign({}, appState1);
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = getMode(appState, _from);
            appState = yield updateTravaLPInfo(appState);
            appState = yield updateTokenInPoolInfo(appState, _from.toLowerCase());
            let tokenInfoFrom = appState[modeFrom].detailTokenInPool.get(tokenAddress);
            if (amount.toFixed(0) == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = calculateMaxAmountTransferTToken(appState, _tokenAddress, _from.toLowerCase());
            }
            // check tokenAddress is exist on reverseList
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield updateUserTokenBalance(appState, tokenAddress);
            }
            let transferUSD = getBalanceUsdFromAmount(amount, tokenInfoFrom);
            let oldTotalCollateralUSDOfFrom = appState[modeFrom].travaLPState.totalCollateralUSD;
            let newTotalCollateralUSDOfFrom = BigNumber(appState[modeFrom].travaLPState.totalCollateralUSD).minus(transferUSD);
            // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
            let oldLTVOfFrom = appState[modeFrom].travaLPState.ltv;
            let newLTVOfFrom = calculateNewLTV(BigNumber(oldTotalCollateralUSDOfFrom), BigNumber(oldLTVOfFrom), newTotalCollateralUSDOfFrom, BigNumber(tokenInfoFrom.maxLTV));
            //Calculate liquid threshold
            let oldLiquidTresholdOfFrom = appState[modeFrom].travaLPState.currentLiquidationThreshold;
            let newLiquidTresholdOfFrom = calculateNewLiquidThreshold(BigNumber(oldTotalCollateralUSDOfFrom), BigNumber(oldLiquidTresholdOfFrom), newTotalCollateralUSDOfFrom, BigNumber(tokenInfoFrom.liqThres));
            // if totalDebtUSD = 0  , not update healthFactor
            const healthFactorOfFrom = calculateNewHealFactor(newTotalCollateralUSDOfFrom, newLiquidTresholdOfFrom, BigNumber(appState[modeFrom].travaLPState.totalDebtUSD));
            const availableBorrowsUSDOfFrom = calculateNewAvailableBorrow(newTotalCollateralUSDOfFrom, newLTVOfFrom, BigNumber(appState[modeFrom].travaLPState.totalDebtUSD));
            appState[modeFrom].travaLPState.totalCollateralUSD = newTotalCollateralUSDOfFrom.toFixed(0);
            appState[modeFrom].travaLPState.currentLiquidationThreshold = newLiquidTresholdOfFrom.toFixed(0);
            appState[modeFrom].travaLPState.ltv = newLTVOfFrom.toFixed(0);
            appState[modeFrom].travaLPState.healthFactor = healthFactorOfFrom.toFixed(0);
            appState[modeFrom].travaLPState.availableBorrowsUSD = availableBorrowsUSDOfFrom.toFixed(0);
            tokenInfoFrom.tToken = {
                address: tokenInfoFrom.tToken.address,
                decimals: tokenInfoFrom.tToken.decimals,
                balances: BigNumber(tokenInfoFrom.tToken.balances).minus(amount).toFixed(0),
                totalSupply: BigNumber(tokenInfoFrom.tToken.totalSupply).minus(amount).toFixed(0),
                originToken: {
                    balances: BigNumber(tokenInfoFrom.tToken.originToken.balances).toFixed(0)
                }
            };
            appState[modeFrom].detailTokenInPool.set(tokenAddress, tokenInfoFrom);
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase() || _to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                let modeTo = getMode(appState, _to);
                appState = yield updateTokenInPoolInfo(appState, _to.toLowerCase());
                let tokenInfoTo = appState[modeTo].detailTokenInPool.get(tokenAddress);
                // check tokenAddress is exist on reverseList
                if (!appState[modeTo].tokenBalances.has(tokenAddress)) {
                    appState = yield updateUserTokenBalance(appState, tokenAddress);
                }
                let receiveUSD = getBalanceUsdFromAmount(amount, tokenInfoTo);
                let oldTotalCollateralUSDOfTo = appState[modeTo].travaLPState.totalCollateralUSD;
                let newTotalCollateralUSDOfTo = BigNumber(appState[modeTo].travaLPState.totalCollateralUSD).plus(receiveUSD);
                // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
                let oldLTVOfTo = appState[modeTo].travaLPState.ltv;
                let newLTVOfTo = calculateNewLTV(BigNumber(oldTotalCollateralUSDOfTo), BigNumber(oldLTVOfTo), newTotalCollateralUSDOfTo, BigNumber(tokenInfoTo.maxLTV));
                //Calculate liquid threshold
                let oldLiquidTresholdOfTo = appState[modeTo].travaLPState.currentLiquidationThreshold;
                let newLiquidTresholdOfTo = calculateNewLiquidThreshold(BigNumber(oldTotalCollateralUSDOfTo), BigNumber(oldLiquidTresholdOfTo), newTotalCollateralUSDOfTo, BigNumber(tokenInfoTo.liqThres));
                // if totalDebtUSD = 0  , not update healthFactor
                const healthFactorOfTo = calculateNewHealFactor(newTotalCollateralUSDOfTo, newLiquidTresholdOfTo, BigNumber(appState[modeTo].travaLPState.totalDebtUSD));
                const availableBorrowsUSDOfTo = calculateNewAvailableBorrow(newTotalCollateralUSDOfTo, newLTVOfTo, BigNumber(appState[modeTo].travaLPState.totalDebtUSD));
                appState[modeTo].travaLPState.totalCollateralUSD = newTotalCollateralUSDOfTo.toFixed(0);
                appState[modeTo].travaLPState.currentLiquidationThreshold = newLiquidTresholdOfTo.toFixed(0);
                appState[modeTo].travaLPState.ltv = newLTVOfTo.toFixed(0);
                appState[modeTo].travaLPState.healthFactor = healthFactorOfTo.toFixed(0);
                appState[modeTo].travaLPState.availableBorrowsUSD = availableBorrowsUSDOfTo.toFixed(0);
                tokenInfoTo.tToken = {
                    address: tokenInfoTo.tToken.address,
                    decimals: tokenInfoTo.tToken.decimals,
                    balances: BigNumber(tokenInfoTo.tToken.balances).plus(amount).toFixed(0),
                    totalSupply: BigNumber(tokenInfoTo.tToken.totalSupply).plus(amount).toFixed(0),
                    originToken: {
                        balances: BigNumber(tokenInfoTo.tToken.originToken.balances).toFixed(0)
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
