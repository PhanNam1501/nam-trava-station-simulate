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
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Contract } from "ethers";
import { MAX_UINT256 } from "../../utils/config";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
export function SimulationSupply(appState1, _tokenAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let amount = _amount;
            const appState = Object.assign({}, appState1);
            const oraclePrice = new OraclePrice(getAddr("ORACLE_ADDRESS", appState.chainId), appState.web3);
            const tokenAddress = convertHexStringToAddress(_tokenAddress);
            _tokenAddress = _tokenAddress.toLowerCase();
            // check tokenAddress is exist on reverseList
            if (appState.smartWalletState.detailTokenInPool.has(_tokenAddress) &&
                appState.walletState.tokenBalances.has(_tokenAddress)) {
                // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
                // get token amount
                const tokenAmount = BigInt(appState.walletState.tokenBalances.get(_tokenAddress));
                if (amount.toString() == MAX_UINT256 ||
                    BigInt(amount) == BigInt(MAX_UINT256)) {
                    amount = appState.walletState.tokenBalances.get(_tokenAddress);
                }
                // check amount tokenName on appState is enough .Before check convert string to number
                if (tokenAmount >= BigInt(amount)) {
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
                        appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
                    }
                    // update totalCollateralUSD. deposited + amount * asset.price
                    appState.smartWalletState.travaLPState.totalCollateralUSD = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) +
                        (BigInt(amount) *
                            BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                            BigInt(Math.pow(10, 18)));
                }
                // add tToken to smart wallet state if not exist
                const tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
                tokenInfo.tToken = Object.assign(Object.assign({}, tokenInfo.tToken), { balances: String(BigInt(tokenInfo.tToken.balances) + BigInt(amount)) });
                appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
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
            const tokenAddress = convertHexStringToAddress(_tokenAddress);
            _tokenAddress = _tokenAddress.toLowerCase();
            // check tokenAddress is exist on reverseList
            if (appState.smartWalletState.tokenBalances.has(_tokenAddress) &&
                appState.smartWalletState.detailTokenInPool.has(_tokenAddress)) {
                // get tToken address
                // get token price
                const tokenPrice = BigInt(yield oraclePrice.getAssetPrice(tokenAddress));
                let borrowUSD;
                if (amount.toString() == MAX_UINT256 ||
                    BigInt(amount) == BigInt(MAX_UINT256)) {
                    borrowUSD = BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD);
                    amount = ((borrowUSD * BigInt(Math.pow(10, 18))) /
                        BigInt(tokenPrice)).toString();
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
                // add debToken to smart wallet state if not exist
                appState.smartWalletState.tokenBalances.set(_tokenAddress, String(BigInt(appState.smartWalletState.tokenBalances.get(_tokenAddress)) +
                    BigInt(amount)));
                let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
                tokenInfo.dToken = Object.assign(Object.assign({}, tokenInfo.dToken), { balances: String(BigInt(tokenInfo.dToken.balances) + BigInt(amount)) });
                appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
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
            const tokenAddress = convertHexStringToAddress(_tokenAddress);
            _tokenAddress = _tokenAddress.toLowerCase();
            // check tokenAddress is exist on reverseList
            if (appState.smartWalletState.tokenBalances.has(_tokenAddress) &&
                appState.smartWalletState.detailTokenInPool.has(_tokenAddress)) {
                if (amount.toString() == MAX_UINT256 ||
                    BigInt(amount) == BigInt(MAX_UINT256)) {
                    amount =
                        appState.smartWalletState.detailTokenInPool.get(_tokenAddress).dToken
                            .balances;
                }
                const debtTokenSmartWalletBalance = appState.smartWalletState.detailTokenInPool.get(_tokenAddress).dToken
                    .balances;
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
                        appState.smartWalletState.tokenBalances.set(_tokenAddress, String(BigInt(appState.smartWalletState.tokenBalances.get(_tokenAddress)) - BigInt(amount)));
                        let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
                        tokenInfo.dToken.balances = String(BigInt(tokenInfo.dToken.balances) - BigInt(amount));
                        appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
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
                        appState.smartWalletState.travaLPState.healthFactor =
                            String(MAX_UINT256);
                        // update totalDebtUSD : borrowed - debtTokenBalance * asset.price
                        appState.smartWalletState.travaLPState.totalDebtUSD = String((BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) *
                            BigInt(Math.pow(10, 18)) -
                            BigInt(debtTokenSmartWalletBalance) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                            BigInt(Math.pow(10, 18)));
                        // set debt token balance to 0
                        appState.smartWalletState.tokenBalances.set(_tokenAddress, String(BigInt(appState.smartWalletState.tokenBalances.get(_tokenAddress)) - BigInt(amount)));
                        let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
                        tokenInfo.dToken = Object.assign(Object.assign({}, tokenInfo.dToken), { balances: "0" });
                        appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
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
            const tokenAddress = convertHexStringToAddress(_tokenAddress);
            _tokenAddress = _tokenAddress.toLowerCase();
            // check tokenAddress is exist on reverseList
            if (appState.smartWalletState.detailTokenInPool.has(_tokenAddress) &&
                appState.smartWalletState.tokenBalances.has(_tokenAddress)) {
                if (amount.toString() == MAX_UINT256 ||
                    BigInt(amount) == BigInt(MAX_UINT256)) {
                    amount =
                        appState.smartWalletState.detailTokenInPool.get(_tokenAddress).tToken
                            .balances;
                }
                if (appState.smartWalletState.detailTokenInPool.get(_tokenAddress).tToken
                    .balances == "0") {
                    throw new Error(`Smart wallet does not supply ${tokenAddress} token.`);
                }
                else {
                    if (BigInt(appState.smartWalletState.detailTokenInPool.get(_tokenAddress)
                        .tToken.balances) > BigInt(amount)) {
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
                                BigInt(amount) *
                                    BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) *
                                BigInt(appState.smartWalletState.travaLPState
                                    .currentLiquidationThreshold)) /
                                BigInt(appState.smartWalletState.travaLPState.totalDebtUSD))));
                        }
                        else {
                            // healthFactor = MaxUint256
                            // need check this
                            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
                        }
                        // update totalCollateralUSD. deposited - amount * asset.price
                        appState.smartWalletState.travaLPState.totalCollateralUSD = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
                            (BigInt(amount) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                                BigInt(Math.pow(10, 18)));
                        // update token balances
                        appState.smartWalletState.tokenBalances.set(_tokenAddress, String(BigInt(appState.smartWalletState.tokenBalances.get(_tokenAddress)) + BigInt(amount)));
                        let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
                        tokenInfo.tToken = Object.assign(Object.assign({}, tokenInfo.tToken), { balances: String(BigInt(tokenInfo.tToken.balances) - BigInt(amount)) });
                        appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
                    }
                    else if (BigInt(amount) >=
                        BigInt(appState.smartWalletState.detailTokenInPool.get(_tokenAddress)
                            .tToken.balances)) {
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
                                BigInt(amount) *
                                    BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) *
                                BigInt(appState.smartWalletState.travaLPState
                                    .currentLiquidationThreshold)) /
                                BigInt(appState.smartWalletState.travaLPState.totalDebtUSD))));
                        }
                        else {
                            // healthFactor = MaxUint256
                            // need check this
                            appState.smartWalletState.travaLPState.healthFactor = MAX_UINT256;
                        }
                        // update totalCollateralUSD. deposited - amount * asset.price
                        appState.smartWalletState.travaLPState.totalCollateralUSD = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) -
                            (BigInt(amount) *
                                BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) /
                                BigInt(Math.pow(10, 18)));
                        // set tToken balance to 0
                        appState.smartWalletState.tokenBalances.set(_tokenAddress, String(BigInt(appState.smartWalletState.tokenBalances.get(_tokenAddress)) + BigInt(amount)));
                        let tokenInfo = appState.smartWalletState.detailTokenInPool.get(_tokenAddress);
                        tokenInfo.tToken = Object.assign(Object.assign({}, tokenInfo.tToken), { balances: "0" });
                        appState.smartWalletState.detailTokenInPool.set(_tokenAddress, tokenInfo);
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
export function SimulationClaimReward(appState1, token, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            const incentiveContract = new Contract(getAddr("INCENTIVE_CONTRACT", appState.chainId), IncentiveContractABI, appState.web3);
            const rTravaAddress = yield incentiveContract.REWARD_TOKEN();
            const currentTokenData = appState.smartWalletState.detailTokenInPool.get(token);
            if (currentTokenData) {
                let realAmount = amount;
                if (BigInt(amount) > BigInt(currentTokenData.maxRewardCanGet)) {
                    realAmount = currentTokenData.maxRewardCanGet;
                }
                appState.smartWalletState.detailTokenInPool.set(token, Object.assign(Object.assign({}, currentTokenData), { maxRewardCanGet: (BigInt(currentTokenData.maxRewardCanGet) - BigInt(amount)).toString() }));
                const currentRTrava = appState.smartWalletState.tokenBalances.get(rTravaAddress);
                if (currentRTrava) {
                    appState.smartWalletState.tokenBalances.set(rTravaAddress, (BigInt(currentRTrava) + BigInt(amount)).toString());
                }
                else {
                    appState.smartWalletState.tokenBalances.set(rTravaAddress, BigInt(amount).toString());
                }
            }
            else {
                throw new Error(`Token ${token} is not exist in reverseList or smart wallet does not have ${token} token.`);
            }
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function SimulationConvertReward(appState1, to, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            const incentiveContract = new Contract(getAddr("INCENTIVE_CONTRACT", appState.chainId), IncentiveContractABI, appState.web3);
            const rTravaAddress = yield incentiveContract.REWARD_TOKEN();
            const rTravaBalance = appState.smartWalletState.tokenBalances.get(rTravaAddress);
            if (rTravaBalance) {
                let realAmount = amount;
                if (BigInt(amount) > BigInt(rTravaBalance)) {
                    realAmount = rTravaBalance;
                }
                appState.smartWalletState.tokenBalances.set(rTravaAddress, (BigInt(rTravaBalance) - BigInt(realAmount)).toString());
                const travaAddress = getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId);
                if (to == appState.smartWalletState.address) {
                    const travaBalance = appState.smartWalletState.tokenBalances.get(travaAddress);
                    if (travaBalance) {
                        appState.smartWalletState.tokenBalances.set(travaAddress, (BigInt(travaBalance) + BigInt(amount)).toString());
                    }
                    else {
                        appState.smartWalletState.tokenBalances.set(rTravaAddress, BigInt(amount).toString());
                    }
                }
                else if (to == appState.walletState.address) {
                    const travaBalance = appState.walletState.tokenBalances.get(travaAddress);
                    if (travaBalance) {
                        appState.walletState.tokenBalances.set(travaAddress, (BigInt(travaBalance) + BigInt(amount)).toString());
                    }
                    else {
                        appState.walletState.tokenBalances.set(rTravaAddress, BigInt(amount).toString());
                    }
                }
            }
            else {
                throw new Error(`Token rTrava is not exist in reverseList or smart wallet does not have token rTrava.`);
            }
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
