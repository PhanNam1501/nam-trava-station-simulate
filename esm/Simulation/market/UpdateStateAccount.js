var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Contract } from "ethers";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import BEP20ABI from "../../abis/BEP20.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
export function updateLPtTokenInfo(appState1, _tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            const travaLP = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            let reverseList = yield travaLP.getReservesList();
            let tokenAddress = convertHexStringToAddress(_tokenAddress);
            let tokenAddressState = tokenAddress.toLowerCase();
            if (reverseList.includes(tokenAddress) &&
                !appState.smartWalletState.detailTokenInPool.has(tokenAddressState)) {
                // get reserve data
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                const tTokenAddress = String(reserveData[6]).toLowerCase();
                // get amount
                const tTokenContract = new Contract(tTokenAddress, BEP20ABI, appState.web3);
                const tTokenBalance = yield tTokenContract.balanceOf(appState.smartWalletState.address);
                appState.smartWalletState.detailTokenInPool =
                    appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
                        tToken: {
                            address: tTokenAddress.toLowerCase(),
                            balances: tTokenBalance.toString(),
                        },
                        dToken: {
                            address: "",
                            balances: "",
                        },
                    });
            }
            else if (reverseList.includes(tokenAddress) &&
                appState.smartWalletState.detailTokenInPool.has(tokenAddressState)) {
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                const tTokenAddress = String(reserveData[6]).toLowerCase();
                // get amount
                const tTokenContract = new Contract(tTokenAddress, BEP20ABI, appState.web3);
                const tTokenBalance = yield tTokenContract.balanceOf(appState.smartWalletState.address);
                let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddressState);
                tokenInfo.tToken = {
                    address: tTokenAddress.toLowerCase(),
                    balances: tTokenBalance.toString(),
                };
                appState.smartWalletState.detailTokenInPool.set(tokenAddressState, tokenInfo);
            }
            else {
                throw new Error(`Can't update info of LP tToken ${tokenAddress}`);
            }
            return appState;
        }
        catch (error) {
            throw new Error("Can't update LP tToken info !");
        }
    });
}
export function updateLPDebtTokenInfo(appState1, _tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            const travaLP = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            let reverseList = yield travaLP.getReservesList();
            let tokenAddress = convertHexStringToAddress(_tokenAddress);
            let tokenAddressState = tokenAddress.toLowerCase();
            if (reverseList.includes(tokenAddress) &&
                !appState.smartWalletState.detailTokenInPool.has(tokenAddressState)) {
                // get reserve data
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();
                // get amount
                const debtTokenContract = new Contract(variableDebtTokenAddress, BEP20ABI, appState.web3);
                const debtTokenBalance = yield debtTokenContract.balanceOf(appState.smartWalletState.address);
                appState.smartWalletState.detailTokenInPool =
                    appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
                        dToken: {
                            address: variableDebtTokenAddress.toLowerCase(),
                            balances: debtTokenBalance.toString(),
                        },
                        tToken: {
                            address: "",
                            balances: "",
                        },
                    });
            }
            else if (reverseList.includes(tokenAddress) &&
                appState.smartWalletState.detailTokenInPool.has(tokenAddressState)) {
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();
                // get amount
                const debtTokenContract = new Contract(variableDebtTokenAddress, BEP20ABI, appState.web3);
                const debtTokenBalance = yield debtTokenContract.balanceOf(appState.smartWalletState.address);
                let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddressState);
                tokenInfo.dToken = {
                    address: variableDebtTokenAddress.toLowerCase(),
                    balances: debtTokenBalance.toString(),
                };
                appState.smartWalletState.detailTokenInPool.set(tokenAddressState, tokenInfo);
            }
            else {
                throw new Error(`Can't update info of LP Debt Token ${tokenAddress}`);
            }
            return appState;
        }
        catch (error) {
            throw new Error("Can't update LP Debt Token info !");
        }
    });
}
// call this before all actions
export function updateTravaLPInfo(appState1, userAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            // first update token in pool balances
            const TravaLendingPool = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            const reserveAddressList = yield TravaLendingPool.getReservesList();
            if (reserveAddressList.length == 0) {
                throw new Error("No reserve in TravaLP");
            }
            // update balance for wallet
            for (let i = 0; i < reserveAddressList.length; i++) {
                // update token balance for wallet
                let reserveAddress = reserveAddressList[i];
                const reserve = new Contract(reserveAddress, BEP20ABI, appState.web3);
                reserveAddress = String(reserveAddress).toLowerCase();
                if (String(appState.walletState.tokenBalances.get(reserveAddress)) ==
                    "undefined") {
                    const balance = yield reserve.balanceOf(userAddress);
                    appState.walletState.tokenBalances.set(reserveAddress, balance);
                }
                if (String(appState.smartWalletState.tokenBalances.get(reserveAddress)) ==
                    "undefined") {
                    // update token balance for smart wallet
                    const smartWalletBalance = yield reserve.balanceOf(appState.smartWalletState.address);
                    appState.smartWalletState.tokenBalances.set(reserveAddress, smartWalletBalance);
                }
            }
            // second update TravaLP state for wallet
            const userData = yield TravaLendingPool.getUserAccountData(userAddress);
            // update appState for wallet
            appState.walletState.travaLPState.totalCollateralUSD =
                userData.totalCollateralUSD;
            appState.walletState.travaLPState.totalDebtUSD = userData.totalDebtUSD;
            appState.walletState.travaLPState.availableBorrowsUSD =
                userData.availableBorrowsUSD;
            appState.walletState.travaLPState.currentLiquidationThreshold =
                userData.currentLiquidationThreshold;
            appState.walletState.travaLPState.healthFactor = userData.healthFactor;
            appState.walletState.travaLPState.ltv = userData.ltv;
            // third update TravaLP state for smart wallet
            const smartWalletData = yield TravaLendingPool.getUserAccountData(appState.smartWalletState.address);
            // update appState for smart wallet
            appState.smartWalletState.travaLPState.totalCollateralUSD =
                smartWalletData.totalCollateralUSD;
            appState.smartWalletState.travaLPState.totalDebtUSD =
                smartWalletData.totalDebtUSD;
            appState.smartWalletState.travaLPState.availableBorrowsUSD =
                smartWalletData.availableBorrowsUSD;
            appState.smartWalletState.travaLPState.currentLiquidationThreshold =
                smartWalletData.currentLiquidationThreshold;
            appState.smartWalletState.travaLPState.healthFactor =
                smartWalletData.healthFactor;
            appState.smartWalletState.travaLPState.ltv = smartWalletData.ltv;
            return appState;
        }
        catch (e) {
            console.log(e);
            return appState1;
        }
    });
}
