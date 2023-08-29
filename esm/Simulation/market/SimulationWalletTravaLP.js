var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import OraclePrice from "../../utils/oraclePrice";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import BEP20ABI from "../../abis/BEP20.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Contract } from "ethers";
import { MAX_UINT256 } from "../../utils/config";
export function SimulationSupply(appState1, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = _amount;
            const appState = Object.assign({}, appState1);
            const oraclePrice = new OraclePrice(getAddr("ORACLE_ADDRESS", appState.chainId), appState.web3);
            const travaLP = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            const tokenAddress = convertHexStringToAddress(_tokenAddress);
            _tokenAddress = _tokenAddress.toLowerCase();
            let reverseList = yield travaLP.getReservesList();
            // check tokenAddress is exist on reverseList
            if (reverseList.includes(tokenAddress) &&
                appState.walletState.tokenBalances.has(_tokenAddress)) {
                // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
                // get tToken address
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                const tToken = String(reserveData[6]).toLowerCase();
                // get token amount
                const tokenAmount = BigInt(appState.walletState.tokenBalances.get(_tokenAddress));
                if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
                    amount = appState.walletState.tokenBalances.get(_tokenAddress);
                }
                // check amount tokenName on appState is enough .Before check convert string to number
                if (BigInt(tokenAmount) >= BigInt(amount)) {
                    // update appState amount tokenName
                    const newAmount = String(tokenAmount - BigInt(amount));
                    appState.walletState.tokenBalances.set(_tokenAddress, newAmount);
                    // update state of smart wallet trava lp
                    // update availableBorrowUSD . (deposited + amount * asset.price) * ltv - borrowed
                    appState.smartWalletState.travaLPState.availableBorrowsUSD = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
                        BigInt(Math.pow(10, 18)) +
                        BigInt(amount) *
                            BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) *
                        BigInt(appState.smartWalletState.travaLPState.ltv) -
                        BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                            BigInt(Math.pow(10, 24))) /
                        BigInt(Math.pow(10, 22)));
                    // update healthFactor .((deposited + amount * asset.price) * currentLiquidationThreshold) / borrowe
                    // if totalDebtUSD = 0  , not update healthFactor
                    if (appState.smartWalletState.travaLPState.totalDebtUSD != "0") {
                        appState.smartWalletState.travaLPState.healthFactor = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
                            BigInt(Math.pow(10, 18)) +
                            BigInt(amount) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) *
                            BigInt(appState.smartWalletState.travaLPState
                                .currentLiquidationThreshold)) /
                            BigInt(appState.smartWalletState.travaLPState.totalDebtUSD));
                    }
                    else {
                        // healthFactor = MaxUint256
                        appState.smartWalletState.travaLPState.healthFactor =
                            MAX_UINT256;
                    }
                    // update totalCollateralUSD. deposited + amount * asset.price
                    appState.smartWalletState.travaLPState.totalCollateralUSD = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) +
                        (BigInt(amount) *
                            BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                            BigInt(Math.pow(10, 18)));
                }
                // else {
                //   throw new Error(`Amount ${tokenAddress} on appState is not enough.`);
                // }
                // add tToken to smart wallet state if not exist
                if (!appState.smartWalletState.tokenBalances.has(tToken)) {
                    appState.smartWalletState.tokenBalances.set(tToken, String(amount));
                    console.log("added tToken to smart wallet state", appState.smartWalletState.tokenBalances.get(tToken));
                }
                else {
                    // update tToken balance of smart wallet
                    appState.smartWalletState.tokenBalances.set(tToken, String(BigInt(appState.smartWalletState.tokenBalances.get(tToken)) +
                        BigInt(amount)));
                }
                return appState;
            }
            else {
                throw new Error(`Account or LP does not have ${tokenAddress} token.`);
            }
        }
        catch (err) {
            throw err;
        }
    });
}
// need add debt token to smart wallet state
export function SimulationBorrow(appState1, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = _amount;
            const appState = Object.assign({}, appState1);
            const oraclePrice = new OraclePrice(getAddr("ORACLE_ADDRESS", appState.chainId), appState.web3);
            const travaLP = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            const tokenAddress = convertHexStringToAddress(_tokenAddress);
            _tokenAddress = _tokenAddress.toLowerCase();
            let reverseList = yield travaLP.getReservesList();
            // check tokenAddress is exist on reverseList
            if (reverseList.includes(tokenAddress) &&
                appState.walletState.tokenBalances.has(_tokenAddress)) {
                // get tToken address
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                const debToken = String(reserveData[7]).toLowerCase();
                // get token amount
                const tokenAmount = BigInt(appState.walletState.tokenBalances.get(_tokenAddress));
                // get token price
                const tokenPrice = BigInt(yield oraclePrice.getAssetPrice(tokenAddress));
                let borrowUSD;
                if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
                    borrowUSD = BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD);
                    amount = (borrowUSD * BigInt(Math.pow(10, 18)) / BigInt(tokenPrice)).toString();
                }
                else {
                    borrowUSD = (BigInt(amount) * BigInt(tokenPrice)) / BigInt(Math.pow(10, 18));
                }
                // check availableBorrowUSD on appState is enough .Before check convert string to number
                if (BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) >=
                    borrowUSD) {
                    // when borrowUSD is enough , update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
                    // update availableBorrowUSD :  deposited * ltv - borrowed - amount * asset.price
                    appState.smartWalletState.travaLPState.availableBorrowsUSD = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
                        BigInt(appState.smartWalletState.travaLPState.ltv) -
                        BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                            BigInt(Math.pow(10, 4))) *
                        BigInt(Math.pow(10, 14)) -
                        borrowUSD * BigInt(Math.pow(10, 18))) /
                        BigInt(Math.pow(10, 18)));
                    // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed + amount * asset.price)
                    appState.smartWalletState.travaLPState.healthFactor = String((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
                        BigInt(appState.smartWalletState.travaLPState.currentLiquidationThreshold) *
                        BigInt(Math.pow(10, 32))) /
                        (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                            BigInt(Math.pow(10, 18)) +
                            borrowUSD * BigInt(Math.pow(10, 18))));
                    // update totalDebtUSD : borrowed + amount * asset.price
                    appState.smartWalletState.travaLPState.totalDebtUSD = String(BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) +
                        borrowUSD);
                }
                // else {
                //   throw new Error(
                //     `Amount borrow USD volume for token ${tokenAddress} is too much.`
                //   );
                // }
                // add debToken to smart wallet state if not exist
                if (!appState.smartWalletState.tokenBalances.has(debToken)) {
                    appState.smartWalletState.tokenBalances.set(debToken, String(amount));
                }
                else {
                    // update tToken balance of smart wallet
                    appState.smartWalletState.tokenBalances.set(debToken, String(BigInt(appState.smartWalletState.tokenBalances.get(debToken)) +
                        BigInt(amount)));
                }
                return appState;
            }
            else {
                throw new Error(`Account or LP does not have ${tokenAddress} token or token is not exist in reverseList.`);
            }
        }
        catch (err) {
            throw err;
        }
    });
}
// need remove debt token from smart wallet state
export function SimulationRepay(appState1, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = _amount;
            const appState = Object.assign({}, appState1);
            const oraclePrice = new OraclePrice(getAddr("ORACLE_ADDRESS", appState.chainId), appState.web3);
            const travaLP = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            const tokenAddress = convertHexStringToAddress(_tokenAddress);
            _tokenAddress = _tokenAddress.toLowerCase();
            let reverseList = yield travaLP.getReservesList();
            // check tokenAddress is exist on reverseList
            if (reverseList.includes(tokenAddress) &&
                appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
                // get reserve data
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                // const tTokenAddress = reserveData[6];
                const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();
                // check balance debt token on smart wallet
                const debtTokenBalance = new Contract(variableDebtTokenAddress, BEP20ABI, appState.web3);
                const debtTokenBalanceOfSmartWallet = yield debtTokenBalance.balanceOf(appState.smartWalletState.address);
                const debtTokenBalanceOfWallet = yield debtTokenBalance.balanceOf(appState.walletState.address);
                // get balance debt token of smart wallet in state
                let debtTokenSmartWalletBalance = appState.smartWalletState.tokenBalances.get(variableDebtTokenAddress);
                if (debtTokenSmartWalletBalance == "undefined") {
                    appState.smartWalletState.tokenBalances.set(variableDebtTokenAddress, debtTokenBalanceOfSmartWallet);
                    appState.walletState.tokenBalances.set(variableDebtTokenAddress, debtTokenBalanceOfWallet);
                    debtTokenSmartWalletBalance = debtTokenBalanceOfSmartWallet;
                }
                if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
                    amount = debtTokenSmartWalletBalance;
                }
                if (debtTokenSmartWalletBalance == "0") {
                    throw new Error(`Smart wallet does not borrow ${tokenAddress} token.`);
                }
                else {
                    if (BigInt(debtTokenSmartWalletBalance) > BigInt(amount)) {
                        // repay piece of borrowed token
                        // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
                        // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed - amount * asset.price)
                        appState.smartWalletState.travaLPState.healthFactor = String((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
                            BigInt(appState.smartWalletState.travaLPState
                                .currentLiquidationThreshold) *
                            BigInt(Math.pow(10, 32))) /
                            (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                                BigInt(Math.pow(10, 18)) -
                                BigInt(amount) *
                                    BigInt(yield oraclePrice.getAssetPrice(tokenAddress))));
                        // update availableBorrowUSD :  availableBorrowsUSD + amount * asset.price
                        appState.smartWalletState.travaLPState.availableBorrowsUSD = String((BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) *
                            BigInt(Math.pow(10, 18)) +
                            BigInt(amount) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                            BigInt(Math.pow(10, 18)));
                        // update totalDebtUSD : borrowed - amount * asset.price
                        appState.smartWalletState.travaLPState.totalDebtUSD = String((BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                            BigInt(Math.pow(10, 18)) -
                            BigInt(amount) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                            BigInt(Math.pow(10, 18)));
                        // set debt token balance to debtTokenSmartWalletBalance - amount
                        appState.smartWalletState.tokenBalances.set(variableDebtTokenAddress, String(BigInt(debtTokenSmartWalletBalance) - BigInt(amount)));
                    }
                    else if (BigInt(amount) >= BigInt(debtTokenSmartWalletBalance)) {
                        // repay all borrowed token
                        // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
                        // update availableBorrowUSD :  availableBorrowsUSD + debtTokenBalance * asset.price
                        appState.smartWalletState.travaLPState.availableBorrowsUSD = String((BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) *
                            BigInt(Math.pow(10, 18)) +
                            BigInt(debtTokenSmartWalletBalance) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                            BigInt(Math.pow(10, 18)));
                        // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed - debtTokenBalance * asset.price)
                        appState.smartWalletState.travaLPState.healthFactor = String(MAX_UINT256);
                        // update totalDebtUSD : borrowed - debtTokenBalance * asset.price
                        appState.smartWalletState.travaLPState.totalDebtUSD = String((BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                            BigInt(Math.pow(10, 18)) -
                            BigInt(debtTokenSmartWalletBalance) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                            BigInt(Math.pow(10, 18)));
                        // set debt token balance to 0
                        appState.smartWalletState.tokenBalances.set(variableDebtTokenAddress, "0");
                    }
                }
                return appState;
            }
            else {
                throw new Error(`Token ${tokenAddress} is not exist in reverseList or smart wallet does not have ${tokenAddress} token.`);
            }
        }
        catch (err) {
            throw err;
        }
    });
}
// need remove tToken from smart wallet state
export function SimulationWithdraw(appState1, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = _amount;
            const appState = Object.assign({}, appState1);
            const oraclePrice = new OraclePrice(getAddr("ORACLE_ADDRESS", appState.chainId), appState.web3);
            const travaLP = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            const tokenAddress = convertHexStringToAddress(_tokenAddress);
            _tokenAddress = _tokenAddress.toLowerCase();
            let reverseList = yield travaLP.getReservesList();
            // check tokenAddress is exist on reverseList
            if (1
            // reverseList.includes(tokenAddress) &&
            // appState.smartWalletState.tokenBalances.has(_tokenAddress)
            ) {
                // get reserve data
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                const tTokenAddress = String(reserveData[6]).toLowerCase();
                // const variableDebtTokenAddress = reserveData[7];
                // check balance tToken on smart wallet
                const tTokenContract = new Contract(reserveData[6], BEP20ABI, appState.web3);
                const tTokenWalletBalance = yield tTokenContract.balanceOf(appState.walletState.address);
                const tTokenSmartWalletBalance = yield tTokenContract.balanceOf(appState.smartWalletState.address);
                let tTokenBalanceOfSmartWallet = String(appState.smartWalletState.tokenBalances.get(tTokenAddress));
                if (tTokenBalanceOfSmartWallet == "undefined") {
                    appState.smartWalletState.tokenBalances.set(tTokenAddress, tTokenSmartWalletBalance);
                    appState.walletState.tokenBalances.set(tTokenAddress, tTokenWalletBalance);
                    tTokenBalanceOfSmartWallet = tTokenSmartWalletBalance;
                }
                if (amount.toString() == MAX_UINT256 || BigInt(amount) == BigInt(MAX_UINT256)) {
                    amount = tTokenBalanceOfSmartWallet;
                }
                if (tTokenBalanceOfSmartWallet == "0") {
                    throw new Error(`Smart wallet does not supply ${tokenAddress} token.`);
                }
                else {
                    if (BigInt(tTokenBalanceOfSmartWallet) > BigInt(amount)) {
                        console.log("Withdraw piece of supplied token");
                        // withdraw piece of supplied token
                        // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
                        // update availableBorrowUSD : (deposited - amount * asset.price) * ltv - borrowed
                        appState.smartWalletState.travaLPState.availableBorrowsUSD = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
                            BigInt(Math.pow(10, 18)) -
                            BigInt(amount) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) *
                            BigInt(appState.smartWalletState.travaLPState.ltv) -
                            BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                                BigInt(Math.pow(10, 24))) /
                            BigInt(Math.pow(10, 22)));
                        // update healthFactor :((deposited - amount * asset.price) * currentLiquidationThreshold) / borrowed
                        if (appState.smartWalletState.travaLPState.totalDebtUSD != "0") {
                            appState.smartWalletState.travaLPState.healthFactor = String((appState.smartWalletState.travaLPState.healthFactor = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
                                BigInt(Math.pow(10, 18)) -
                                BigInt(tTokenBalanceOfSmartWallet) *
                                    BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) *
                                BigInt(appState.smartWalletState.travaLPState
                                    .currentLiquidationThreshold)) /
                                BigInt(appState.smartWalletState.travaLPState.totalDebtUSD))));
                        }
                        else {
                            // healthFactor = MaxUint256
                            // need check this
                            appState.smartWalletState.travaLPState.healthFactor =
                                MAX_UINT256;
                        }
                        // update totalCollateralUSD. deposited - amount * asset.price
                        appState.smartWalletState.travaLPState.totalCollateralUSD = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
                            (BigInt(amount) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                                BigInt(Math.pow(10, 18)));
                        // set tToken balance to tTokenBalanceOfSmartWallet - amount
                        appState.smartWalletState.tokenBalances.set(tTokenAddress, String(BigInt(tTokenBalanceOfSmartWallet) - BigInt(amount)));
                    }
                    else if (BigInt(amount) >= BigInt(tTokenBalanceOfSmartWallet)) {
                        console.log("withdraw all supplied token");
                        // withdraw all supplied token
                        // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)
                        // update availableBorrowUSD : (deposited - amount * asset.price) * ltv - borrowed
                        appState.smartWalletState.travaLPState.availableBorrowsUSD = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
                            BigInt(Math.pow(10, 18)) -
                            BigInt(amount) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) *
                            BigInt(appState.smartWalletState.travaLPState.ltv) -
                            BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                                BigInt(Math.pow(10, 24))) /
                            BigInt(Math.pow(10, 22)));
                        // update healthFactor :((deposited - amount * asset.price) * currentLiquidationThreshold) / borrowed
                        if (appState.smartWalletState.travaLPState.totalDebtUSD != "0") {
                            appState.smartWalletState.travaLPState.healthFactor = String((appState.smartWalletState.travaLPState.healthFactor = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) *
                                BigInt(Math.pow(10, 18)) -
                                BigInt(tTokenBalanceOfSmartWallet) *
                                    BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) *
                                BigInt(appState.smartWalletState.travaLPState
                                    .currentLiquidationThreshold)) /
                                BigInt(appState.smartWalletState.travaLPState.totalDebtUSD))));
                        }
                        else {
                            // healthFactor = MaxUint256
                            // need check this
                            appState.smartWalletState.travaLPState.healthFactor =
                                MAX_UINT256;
                        }
                        // update totalCollateralUSD. deposited - amount * asset.price
                        appState.smartWalletState.travaLPState.totalCollateralUSD = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
                            (BigInt(tTokenBalanceOfSmartWallet) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                                BigInt(Math.pow(10, 18)));
                        // set tToken balance to 0
                        appState.smartWalletState.tokenBalances.set(tTokenAddress, "0");
                    }
                }
                return appState;
            }
            else {
                throw new Error(`Token ${tokenAddress} is not exist in reverseList or smart wallet does not have ${tokenAddress} token.`);
            }
        }
        catch (err) {
            throw err;
        }
    });
}
