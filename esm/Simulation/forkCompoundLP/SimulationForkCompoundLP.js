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
import { updateAllTokensBalance, updateTokenBalance } from "../basic";
import { convertApyToApr, getMode, isUserAddress } from "../../utils/helper";
import { updateForkCompoundLPState } from "./UpdateStateAccount";
import { MAX_UINT256, percentMul, wadDiv } from "../../utils";
import { calculateNewLiquidThreshold } from "../trava";
// export async function checkEnterMarket(_userAddress: EthAddress, _tokenAddress: EthAddress, _entity_id: string, _chainId: number | string) {
//     let appState = new ApplicationState("", _userAddress, listChain[_chainId].rpcUrl, _chainId)
//     appState = await updateForkCompoundLPState(appState, _entity_id)
//     let userLpState = appState.smartWalletState.forkedCompoundLPState.get(_entity_id)!
//     if(userLpState) {
//         return false
//     }
//     // if(u)
//     // return res
// }
export function getForkCompoundState(appState1, _entity_id) {
    return __awaiter(this, void 0, void 0, function* () {
        appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        let appState = Object.assign({}, appState1);
        const lpState = (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id));
        return lpState.markets[0].assets;
    });
}
export function getSupplyAndBorrowAPY(appState1, _entity_id, _listTokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        let appState = Object.assign({}, appState1);
        const lpState = (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id));
        const res = new Array;
        for (let i = 0; i < _listTokenAddress.length; i++) {
            let tokenInfo = lpState.markets[0].assets.find(e => _listTokenAddress[i].toLowerCase() == e.address.toLocaleLowerCase());
            let apy = {
                supplyAPY: tokenInfo.supplyAPY,
                borrowAPY: tokenInfo.borrowAPY
            };
            res.push(apy);
        }
        return res;
    });
}
export function getSupplyAPY(appState1, _entity_id, _listTokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        let appState = Object.assign({}, appState1);
        const lpState = (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id));
        const res = new Array;
        for (let i = 0; i < _listTokenAddress.length; i++) {
            let tokenInfo = lpState.markets[0].assets.find(e => _listTokenAddress[i].toLowerCase() == e.address.toLocaleLowerCase());
            let apy = tokenInfo.supplyAPY;
            let apr = convertApyToApr(apy);
            res.push(apr);
        }
        return res;
    });
}
export function getBorrowAPY(appState1, _entity_id, _listTokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        const appState = Object.assign({}, appState1);
        const lpState = (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id));
        const res = new Array;
        for (let i = 0; i < _listTokenAddress.length; i++) {
            let tokenInfo = lpState.markets[0].assets.find(e => _listTokenAddress[i].toLowerCase() == e.address.toLocaleLowerCase());
            let apy = tokenInfo.borrowAPY;
            res.push(apy);
        }
        return res;
    });
}
export function getBorrowingAmount(appState1, _entity_id, _listTokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        const appState = Object.assign({}, appState1);
        const dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_entity_id);
        let res = new Array(_listTokenAddress.length);
        if (dataWallet.dapps.length == 0) {
            res = res.fill(0);
        }
        else {
            for (let i = 0; i < _listTokenAddress.length; i++) {
                let borrow = (dataWallet.dapps[0].reserves[0].borrow.find(e => e.address.toLowerCase() == _listTokenAddress[i].toLowerCase()));
                if (borrow) {
                    res[i] = borrow.amount;
                }
                else {
                    res[i] = 0;
                }
            }
        }
        return res;
    });
}
export function getSupplyingAmount(appState1, _entity_id, _listTokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        const appState = Object.assign({}, appState1);
        const dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_entity_id);
        let res = new Array(_listTokenAddress.length);
        if (dataWallet.dapps.length == 0) {
            res = res.fill(0);
        }
        else {
            for (let i = 0; i < _listTokenAddress.length; i++) {
                let deposit = (dataWallet.dapps[0].reserves[0].deposit.find(e => e.address.toLowerCase() == _listTokenAddress[i].toLowerCase()));
                if (deposit) {
                    res[i] = deposit.amount;
                }
                else {
                    res[i] = 0;
                }
            }
        }
        return res;
    });
}
export function getUserDebt(appState1, _entity_id) {
    return __awaiter(this, void 0, void 0, function* () {
        appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        let appState = Object.assign({}, appState1);
        const lpState = (appState.smartWalletState.forkedCompoundLPState.get(_entity_id));
        return lpState.dapps[0].reserves[0].borrow;
    });
}
export function calculateRiskValue(newTotalCollateral, newLiquidationThreshold, newTotalDebt) {
    if (newTotalDebt.toFixed(0) == "0") {
        return BigNumber(MAX_UINT256);
    }
    return wadDiv(percentMul(newTotalCollateral, newLiquidationThreshold), newTotalDebt);
}
export function getRiskValue(appState1, _entity_id) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        appState = yield updateForkCompoundLPState(appState, _entity_id);
        const lpState = (appState.smartWalletState.forkedCompoundLPState.get(_entity_id));
        if (lpState.dapps.length == 0) {
            return BigNumber(MAX_UINT256);
        }
        else {
            return calculateRiskValue(BigNumber(lpState.dapps[0].depositInUSD), BigNumber(lpState.currentLiquidationThreshold), BigNumber(lpState.dapps[0].borrowInUSD));
        }
    });
}
export function getUserTotalCollateral(appState1, _entity_id, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        if (appState1.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
            appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        }
        let appState = Object.assign({}, appState1);
        const mode = getMode(appState, _from);
        let dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
        if (!dataWallet) {
            return BigNumber(0);
        }
        let assetsIn = dataWallet.dapps[0].reserves[0].assetsIn;
        let sumCollateralByUSD = BigNumber(0);
        for (let asset of assetsIn) {
            let assetTokenDetail = cTokenToDetailTokenAddress(appState, _from, _entity_id, asset);
            if (!assetTokenDetail || assetTokenDetail == "") {
                throw new Error("assetTokenDetail not found");
            }
            let dataAssetDeposit = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == assetTokenDetail);
            if (dataAssetDeposit) {
                sumCollateralByUSD = sumCollateralByUSD.plus(BigNumber(dataAssetDeposit.valueInUSD));
            }
        }
        return sumCollateralByUSD;
    });
}
export function getUserAvailableBorrow(appState1, _entity_id, _from) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (appState1.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
            appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        }
        let appState = Object.assign({}, appState1);
        const mode = getMode(appState, _from);
        let dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
        if (!dataWallet) {
            return BigNumber(0);
        }
        let sumSupplyByUSD = BigNumber(0);
        let sumBorrowedByUSD = BigNumber(0);
        for (let dataAssetDeposit of dataWallet.dapps[0].reserves[0].deposit) {
            // let dataAssetBorrow = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == assetTokenDetail);
            let maxLTV = (_a = dataWallet.detailTokenInPool.get(dataAssetDeposit.address.toLowerCase())) === null || _a === void 0 ? void 0 : _a.maxLTV;
            if (dataAssetDeposit && maxLTV) {
                sumSupplyByUSD = sumSupplyByUSD.plus(BigNumber(dataAssetDeposit.valueInUSD).multipliedBy(maxLTV));
            }
        }
        for (let dataAssetBorrow of dataWallet.dapps[0].reserves[0].borrow) {
            sumBorrowedByUSD = sumBorrowedByUSD.plus(BigNumber(dataAssetBorrow.valueInUSD));
        }
        return sumSupplyByUSD.minus(sumBorrowedByUSD);
    });
}
export function calculateMaxAmountForkCompoundSupply(appState1, _entity_id, _tokenAddress, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        const tokenAddress = _tokenAddress.toLowerCase();
        const mode = getMode(appState, _from);
        if (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
            appState = yield updateForkCompoundLPState(appState, _entity_id);
        }
        if (!appState[mode].tokenBalances.has(tokenAddress)) {
            appState = yield updateTokenBalance(appState, appState[mode].address, tokenAddress);
        }
        const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
        if (typeof walletBalance == undefined) {
            throw new Error("Token is not init in " + mode + " state!");
        }
        return BigNumber(appState[mode].tokenBalances.get(tokenAddress));
    });
}
export function calculateMaxAmountForkCompoundBorrow(appState1, _entity_id, _tokenAddress, _from) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (appState1.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
            appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
        }
        let appState = Object.assign({}, appState1);
        let mode = getMode(appState, _from);
        let tokenAddress = _tokenAddress.toLowerCase();
        let dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
        if (!dataWallet) {
            return BigNumber(0);
        }
        let available_borrow = yield getUserAvailableBorrow(appState, _entity_id, _from);
        let tokenInfo = (_a = appState[mode].forkedCompoundLPState.get(_entity_id)) === null || _a === void 0 ? void 0 : _a.detailTokenInPool.get(tokenAddress);
        if (!tokenInfo) {
            throw new Error("tokenInfo not found");
        }
        let tokenPrice = tokenInfo.price;
        return available_borrow.dividedBy(tokenPrice).multipliedBy(BigNumber(10).pow(tokenInfo.decimals));
    });
}
export function calculateMaxAmountForkCompoundWithdraw(appState1, _entity_id, _tokenAddress, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        const tokenAddress = _tokenAddress.toLowerCase();
        const mode = getMode(appState, _from);
        if (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
            appState = yield updateForkCompoundLPState(appState, _entity_id);
        }
        let cTokenAddress = detailTokenAddressToCToken(appState1, _from, _entity_id, tokenAddress);
        const dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
        let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
        if (!dataToken) {
            throw new Error("dataToken not found");
        }
        appState = yield updateAllTokensBalance(appState, _from, [cTokenAddress]);
        const cTokenAmount = BigNumber(appState.smartWalletState.tokenBalances.get(cTokenAddress));
        // amount = exchangeRate  cTokenAmount *   / 10^(decimalCtoken - decimals token)
        const amount = cTokenAmount.div(BigNumber(10).pow(dataToken.cToken.decimals)).multipliedBy(dataToken.cToken.exchangeRate).multipliedBy(BigNumber(10).pow(dataToken.decimals));
        return amount;
    });
}
export function calculateMaxAmountForkCompoundRepay(appState1, _entity_id, _tokenAddress, _from) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        const tokenAddress = _tokenAddress.toLowerCase();
        const mode = getMode(appState, _from);
        if (appState.forkCompoundLPState.forkCompoundLP.get(_entity_id) == undefined) {
            appState = yield updateForkCompoundLPState(appState, _entity_id);
        }
        if (!appState[mode].tokenBalances.has(tokenAddress)) {
            appState = yield updateTokenBalance(appState, appState[mode].address, tokenAddress);
        }
        const walletBalance = appState[mode].tokenBalances.get(tokenAddress);
        if (typeof walletBalance == undefined) {
            throw new Error("Token is not init in " + mode + " state!");
        }
        const dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
        const borrowed = (_a = dataWallet === null || dataWallet === void 0 ? void 0 : dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress)) === null || _a === void 0 ? void 0 : _a.amount;
        if (!borrowed) {
            return BigNumber(0);
        }
        return BigNumber.max(BigNumber.min(walletBalance, borrowed), 0);
    });
}
export function SimulationSupplyForkCompoundLP(appState1, _from, _entity_id, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            if (appState1.forkCompoundLPState.isFetch == false) {
                appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeFrom = getMode(appState1, _from);
            if (amount.toFixed() == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = yield calculateMaxAmountForkCompoundSupply(appState1, _entity_id, tokenAddress, _from);
            }
            if (!appState1[modeFrom].tokenBalances.has(tokenAddress)) {
                appState1 = yield updateAllTokensBalance(appState1, appState1[modeFrom].address, [tokenAddress]);
            }
            let cTokenAddress = detailTokenAddressToCToken(appState1, _from, _entity_id, tokenAddress);
            if (!appState1.smartWalletState.tokenBalances.has(cTokenAddress.toLowerCase())) {
                appState1 = yield updateAllTokensBalance(appState1, appState1.smartWalletState.address, [cTokenAddress]);
            }
            let appState = Object.assign({}, appState1);
            const tokenAmount = BigNumber(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkCompoundLPState.forkCompoundLP.get(_entity_id);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                price = 0;
            }
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_entity_id);
            let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
            if (!dataToken) {
                throw new Error("dataToken not found");
            }
            const amountToUSD = amount.multipliedBy(price).div(BigNumber(10).pow(dataToken.decimals));
            data.totalSupplyInUSD = BigNumber(data.totalSupplyInUSD || 0).plus(amountToUSD).toNumber();
            if (dataWallet.dapps.length == 0) {
                let reserve = {
                    category: "Lending",
                    healthFactor: Number(MAX_UINT256),
                    deposit: new Array(),
                    borrow: new Array(),
                    assetsIn: new Array()
                };
                let reserves = new Array();
                reserves.push(reserve);
                let dapp = {
                    id: _entity_id,
                    type: "token",
                    value: amount.multipliedBy(price).toNumber(),
                    depositInUSD: amountToUSD.toNumber(),
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
                    valueInUSD: amountToUSD.toNumber(),
                    totalValue: amountToUSD.toNumber(),
                    isCollateral: false
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
                    valueInUSD: BigNumber(dataInWallet.valueInUSD).plus(amountToUSD).toNumber(),
                    totalValue: BigNumber(dataInWallet.totalValue).plus(amountToUSD).toNumber(),
                    isCollateral: dataInWallet.isCollateral
                };
                dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                    if (reserve.address == tokenAddress) {
                        return newData;
                    }
                    return reserve;
                });
            }
            // let assetsIn = dataWallet.dapps[0].reserves[0].assetsIn;
            // if (!assetsIn.find((asset) => asset == cTokenAddress)) {
            //     dataWallet.dapps[0].reserves[0].assetsIn.push(cTokenAddress);
            // }
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toNumber();
            dataWallet.dapps[0].depositInUSD = BigNumber(dataWallet.dapps[0].depositInUSD || 0).plus(amountToUSD).toNumber();
            const cTokenAmount = BigNumber(appState.smartWalletState.tokenBalances.get(cTokenAddress));
            const amountCToken = BigNumber(amount).div(BigNumber(10).pow(dataToken.decimals)).multipliedBy(BigNumber(10).pow(dataToken.cToken.decimals)).div(dataToken.cToken.exchangeRate).toFixed(0);
            const newcTokenAmount = cTokenAmount.plus(amountCToken).toFixed(0);
            dataToken.cToken.originToken.balances = newcTokenAmount;
            dataWallet.detailTokenInPool.set(tokenAddress, dataToken);
            appState.smartWalletState.tokenBalances.set(cTokenAddress, newcTokenAmount);
            const newAmount = tokenAmount.minus(amount).toFixed();
            const oldLiqThres = dataWallet.currentLiquidationThreshold;
            const oldTotalColleteral = BigNumber(dataWallet.dapps[0].depositInUSD);
            const newTotalCollateral = oldTotalColleteral.plus(amountToUSD);
            dataWallet.currentLiquidationThreshold = calculateNewLiquidThreshold(oldTotalColleteral, BigNumber(oldLiqThres), newTotalCollateral, BigNumber(dataAssets.liquidationThreshold)).toNumber();
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedCompoundLPState.set(_entity_id, dataWallet);
            appState.forkCompoundLPState.forkCompoundLP.set(_entity_id, data);
            appState = yield SimulationCollateral(appState, appState.smartWalletState.address, _entity_id, [{ tokenAddress: tokenAddress, enableAsColl: 1 }]);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationWithdrawForkCompoundLP(appState1, _from, _to, _entity_id, _tokenAddress, _amountToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // let amountCToken = BigNumber(_amountCToken);
            if (appState1.forkCompoundLPState.isFetch == false) {
                appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            let modeTo = getMode(appState1, _to);
            let amount = BigNumber(_amountToken);
            if (amount.isEqualTo(MAX_UINT256)) {
                amount = yield calculateMaxAmountForkCompoundWithdraw(appState1, _entity_id, tokenAddress, _from);
            }
            if (!appState1[modeTo].tokenBalances.has(tokenAddress)) {
                appState1 = yield updateTokenBalance(appState1, appState1[modeTo].address, tokenAddress);
            }
            let cTokenAddress = detailTokenAddressToCToken(appState1, _from, _entity_id, tokenAddress);
            appState1 = yield updateTokenBalance(appState1, _from, cTokenAddress);
            let appState = Object.assign({}, appState1);
            const tokenAmount = BigNumber(appState[modeTo].tokenBalances.get(tokenAddress));
            let data = appState.forkCompoundLPState.forkCompoundLP.get(_entity_id);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_entity_id);
            if (!dataWallet) {
                throw new Error("You haven't deposited this asset!");
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
            let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
            if (!dataToken) {
                throw new Error("dataToken not found");
            }
            const amountCToken = amount.div(BigNumber(10).pow(dataToken.decimals)).div(dataToken.cToken.exchangeRate).multipliedBy(BigNumber(10).pow(dataToken.cToken.decimals));
            // const amount = BigNumber(amountCToken).div(BigNumber(10).pow(dataToken.cToken.decimals)).multipliedBy(BigNumber(10).pow(dataToken.decimals)).multipliedBy(dataToken.cToken.exchangeRate)
            const amountToUSD = amount.multipliedBy(dataToken.price).div(BigNumber(10).pow(dataToken.decimals));
            data.totalSupplyInUSD = BigNumber(data.totalSupplyInUSD || 0).minus(amountToUSD).toNumber();
            if (!dataInWallet) {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber(),
                    valueInUSD: -amountToUSD,
                    totalValue: -amountToUSD,
                    isCollateral: false
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
                    valueInUSD: BigNumber(dataInWallet.valueInUSD).minus(amountToUSD).toNumber(),
                    totalValue: BigNumber(dataInWallet.totalValue).minus(amountToUSD).toNumber(),
                    isCollateral: dataInWallet.isCollateral
                };
                dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                    if (reserve.address == tokenAddress) {
                        return newData;
                    }
                    return reserve;
                });
            }
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toNumber();
            dataWallet.dapps[0].depositInUSD = BigNumber(dataWallet.dapps[0].depositInUSD || 0).minus(amountToUSD).toNumber();
            dataToken.cToken.originToken.balances = (Number(dataToken.cToken.originToken.balances) - amount.toNumber()).toString();
            dataToken.cToken.balances = (Number(dataToken.cToken.balances) + amount.toNumber()).toString();
            dataWallet.detailTokenInPool.set(tokenAddress, dataToken);
            const cTokenAmount = BigNumber(appState.smartWalletState.tokenBalances.get(cTokenAddress));
            const newcTokenAmount = cTokenAmount.minus(amountCToken).toFixed(0);
            appState.smartWalletState.tokenBalances.set(cTokenAddress, newcTokenAmount);
            const oldLiqThres = dataWallet.currentLiquidationThreshold;
            const oldTotalColleteral = BigNumber(dataWallet.dapps[0].depositInUSD);
            const newTotalCollateral = oldTotalColleteral.minus(amountToUSD);
            dataWallet.currentLiquidationThreshold = calculateNewLiquidThreshold(oldTotalColleteral, BigNumber(oldLiqThres), newTotalCollateral, BigNumber(dataAssets.liquidationThreshold)).toNumber();
            dataWallet.currentLiquidationThreshold = calculateNewLiquidThreshold(BigNumber(oldTotalColleteral), BigNumber(oldLiqThres), BigNumber(dataWallet.dapps[0].depositInUSD), BigNumber(dataAssets.liquidationThreshold)).toNumber();
            if (isUserAddress(appState, _to)) {
                const newAmount = tokenAmount.plus(amount).toFixed(0);
                const modeTo = getMode(appState, _to);
                appState[modeTo].tokenBalances.set(tokenAddress, newAmount);
            }
            appState.smartWalletState.forkedCompoundLPState.set(_entity_id, dataWallet);
            appState.forkCompoundLPState.forkCompoundLP.set(_entity_id, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationBorrowForkCompoundLP(appState1, _from, _to, _entity_id, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            const tokenAddress = _tokenAddress.toLowerCase();
            const maxBorrow = yield calculateMaxAmountForkCompoundBorrow(appState1, _entity_id, tokenAddress, _from);
            appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
            if (amount.isEqualTo(MAX_UINT256)) {
                amount = maxBorrow;
            }
            const cTokenAddress = detailTokenAddressToCToken(appState1, _to, _entity_id, tokenAddress);
            appState1 = yield updateTokenBalance(appState1, appState1.smartWalletState.address, cTokenAddress);
            let appState = Object.assign({}, appState1);
            let data = appState.forkCompoundLPState.forkCompoundLP.get(_entity_id);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalBorrowInUSD = BigNumber(data.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_entity_id);
            if (!dataWallet) {
                throw new Error("You don't have collateral asset!");
            }
            let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
            if (!dataToken) {
                throw new Error("dataToken not found");
            }
            let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
            const amountToUSD = BigNumber(amount).multipliedBy(dataToken.price).div(BigNumber(10).pow(dataToken.decimals));
            if (!dataInWallet) {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: amount.toNumber(),
                    valueInUSD: amountToUSD.toNumber(),
                    totalValue: amountToUSD.toNumber(),
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
                    valueInUSD: BigNumber(dataInWallet.valueInUSD).plus(amountToUSD).toNumber(),
                    totalValue: BigNumber(dataInWallet.totalValue).plus(amountToUSD).toNumber(),
                    isCollateral: true
                };
                dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                    if (reserve.address == tokenAddress) {
                        return newData;
                    }
                    return reserve;
                });
            }
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toNumber();
            dataWallet.dapps[0].borrowInUSD = BigNumber(dataWallet.dapps[0].borrowInUSD || 0).plus(amountToUSD).toNumber();
            dataWallet.detailTokenInPool.set(tokenAddress, dataToken);
            let assetsIn = dataWallet.dapps[0].reserves[0].assetsIn;
            if (!assetsIn.find((asset) => asset == cTokenAddress)) {
                dataWallet.dapps[0].reserves[0].assetsIn.push(cTokenAddress);
            }
            const oldLiqThres = dataWallet.currentLiquidationThreshold;
            dataWallet.currentLiquidationThreshold = calculateNewLiquidThreshold(BigNumber(data.totalSupplyInUSD), BigNumber(oldLiqThres), BigNumber(dataWallet.dapps[0].depositInUSD), BigNumber(dataAssets.liquidationThreshold)).toNumber();
            if (isUserAddress(appState, _to)) {
                let modeTo = getMode(appState, _to);
                appState = yield updateTokenBalance(appState, appState[modeTo].address, tokenAddress);
                let tokenAmount = BigNumber(appState[modeTo].tokenBalances.get(tokenAddress));
                let newAmount = tokenAmount.plus(amount).toFixed();
                appState[modeTo].tokenBalances.set(tokenAddress, newAmount);
            }
            appState.smartWalletState.forkedCompoundLPState.set(_entity_id, dataWallet);
            appState.forkCompoundLPState.forkCompoundLP.set(_entity_id, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationRepayForkCompoundLP(appState1, _from, _entity_id, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = BigNumber(_amount);
            if (appState1.forkCompoundLPState.isFetch == false) {
                appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
            }
            const tokenAddress = _tokenAddress.toLowerCase();
            if (amount.toFixed() == MAX_UINT256 || amount.isEqualTo(MAX_UINT256)) {
                amount = yield calculateMaxAmountForkCompoundRepay(appState1, _entity_id, tokenAddress, _from);
            }
            let modeFrom = getMode(appState1, _from);
            if (!appState1[modeFrom].tokenBalances.has(tokenAddress)) {
                appState1 = yield updateTokenBalance(appState1, appState1[modeFrom].address, tokenAddress);
            }
            let appState = Object.assign({}, appState1);
            const tokenAmount = BigNumber(appState[modeFrom].tokenBalances.get(tokenAddress));
            let data = appState.forkCompoundLPState.forkCompoundLP.get(_entity_id);
            if (!data) {
                throw new Error("data not found");
            }
            let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
            let price = dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.price;
            if (!price) {
                throw new Error("price not found");
            }
            data.totalBorrowInUSD = BigNumber(data.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_entity_id);
            if (!dataWallet) {
                throw new Error("You haven't participated LP");
            }
            let dataToken = dataWallet.detailTokenInPool.get(tokenAddress);
            if (!dataToken) {
                throw new Error("dataToken not found");
            }
            const amountToUSD = amount.multipliedBy(dataToken.price).div(BigNumber(10).pow(dataToken.decimals));
            let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
            if (!dataInWallet) {
                let newData = {
                    id: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.id) || "",
                    type: "token",
                    address: tokenAddress,
                    symbol: (dataAssets === null || dataAssets === void 0 ? void 0 : dataAssets.symbol) || "",
                    amount: -amount.toNumber(),
                    valueInUSD: -amountToUSD.toNumber(),
                    totalValue: -amountToUSD.toNumber(),
                    isCollateral: false
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
                    valueInUSD: BigNumber(dataInWallet.valueInUSD).minus(amountToUSD).toNumber(),
                    totalValue: BigNumber(dataInWallet.totalValue).minus(amountToUSD).toNumber(),
                    isCollateral: dataInWallet.isCollateral
                };
                dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                    if (reserve.address == tokenAddress) {
                        return newData;
                    }
                    return reserve;
                });
            }
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toNumber();
            dataWallet.dapps[0].borrowInUSD = BigNumber(dataWallet.dapps[0].borrowInUSD || 0).minus(amountToUSD).toNumber();
            dataWallet.detailTokenInPool.set(tokenAddress, dataToken);
            const newAmount = tokenAmount.minus(amount).toFixed();
            const oldLiqThres = dataWallet.currentLiquidationThreshold;
            dataWallet.currentLiquidationThreshold = calculateNewLiquidThreshold(BigNumber(data.totalSupplyInUSD), BigNumber(oldLiqThres), BigNumber(dataWallet.dapps[0].depositInUSD), BigNumber(dataAssets.liquidationThreshold)).toNumber();
            appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
            appState.smartWalletState.forkedCompoundLPState.set(_entity_id, dataWallet);
            appState.forkCompoundLPState.forkCompoundLP.set(_entity_id, data);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationCollateral(appState1, _from, _entity_id, _collateralList) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (appState1.forkCompoundLPState.isFetch == false) {
                appState1 = yield updateForkCompoundLPState(appState1, _entity_id);
            }
            let appState = Object.assign({}, appState1);
            let mode = getMode(appState, _from);
            let data = appState.forkCompoundLPState.forkCompoundLP.get(_entity_id);
            if (!data) {
                throw new Error("data not found");
            }
            let dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
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
            let totalCollateral = BigNumber(0);
            let sumBorrowByUSD = BigNumber(0);
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
                        totalCollateral = totalCollateral.plus(BigNumber(dataAssetDeposit.valueInUSD).multipliedBy(maxLTV));
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
            const oldLiqThres = dataWallet.currentLiquidationThreshold;
            let currentLiquidationThreshold;
            let dataAssets;
            for (let i = 0; i < _collateralList.length; i++) {
                dataAssets = data.markets[0].assets.find((asset) => asset.address == _collateralList[i].tokenAddress);
                currentLiquidationThreshold = calculateNewLiquidThreshold(BigNumber(data.totalSupplyInUSD), BigNumber(oldLiqThres), BigNumber(dataWallet.dapps[0].depositInUSD), BigNumber(dataAssets.liquidationThreshold)).toNumber();
            }
            appState[mode].forkedCompoundLPState.set(_entity_id, dataWallet);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function cTokenToDetailTokenAddress(appState1, _from, _entity_id, cTokenAddress) {
    try {
        let appState = Object.assign({}, appState1);
        let mode = getMode(appState, _from);
        let dataWallet = appState[mode].forkedCompoundLPState.get(_entity_id);
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
export function detailTokenAddressToCToken(appState1, _from, _entity_id, detailTokenAddress) {
    try {
        let appState = Object.assign({}, appState1);
        let dataWallet = appState.smartWalletState.forkedCompoundLPState.get(_entity_id);
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
        return cTokenAddress.toLowerCase();
    }
    catch (err) {
        throw err;
    }
}
export function SimulationClaimRewardsForkCompoundLP(appState1, _idLP) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let appState = Object.assign({}, appState1);
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
        }
        catch (err) {
            throw err;
        }
    });
}
