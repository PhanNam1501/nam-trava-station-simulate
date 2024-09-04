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
exports.getTokenBalance = getTokenBalance;
exports.updateLPtTokenInfo = updateLPtTokenInfo;
exports.updateLPDebtTokenInfo = updateLPDebtTokenInfo;
exports.updateTokenInPoolInfo = updateTokenInPoolInfo;
exports.updateTravaLPInfo = updateTravaLPInfo;
exports.updateMaxRewardCanClaims = updateMaxRewardCanClaims;
exports.updateRTravaAndTravaForReward = updateRTravaAndTravaForReward;
const ethers_1 = require("ethers");
const TravaLendingPool_json_1 = __importDefault(require("../../../abis/TravaLendingPool.json"));
const IncentiveContract_json_1 = __importDefault(require("../../../abis/IncentiveContract.json"));
const BEP20_json_1 = __importDefault(require("../../../abis/BEP20.json"));
const AaveOracle_json_1 = __importDefault(require("../../../abis/AaveOracle.json"));
const address_1 = require("../../../utils/address");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const oraclePrice_1 = __importDefault(require("../../../utils/oraclePrice"));
const UpdateStateAccount_1 = require("../../basic/UpdateStateAccount");
const SimulationWalletTravaLP_1 = require("./SimulationWalletTravaLP");
const helper_1 = require("../../../utils/helper");
function getTokenBalance(appState, tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenContract = new ethers_1.Contract(tokenAddress, BEP20_json_1.default, appState.web3);
        const tokenBalance = yield tokenContract.balanceOf(appState.smartWalletState.address);
        const tokenDecimal = yield tokenContract.decimals();
        return {
            address: String(tokenAddress).toLowerCase(),
            balance: String(tokenBalance),
            decimal: String(tokenDecimal)
        };
    });
}
function updateLPtTokenInfo(appState1, _tokenAddress, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const appState = Object.assign({}, appState1);
            let tokenAddress = (0, address_1.convertHexStringToAddress)(_tokenAddress);
            let tokenAddressState = tokenAddress.toLowerCase();
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (!appState[modeFrom].detailTokenInPool.has(tokenAddressState)
                && ((_b = (_a = appState[modeFrom].detailTokenInPool) === null || _a === void 0 ? void 0 : _a.get(tokenAddressState)) === null || _b === void 0 ? void 0 : _b.tToken) == undefined) {
                let tokenPrice = (_c = appState[modeFrom].detailTokenInPool.get(tokenAddressState)) === null || _c === void 0 ? void 0 : _c.price;
                if (tokenPrice == undefined) {
                    const oraclePrice = new oraclePrice_1.default((0, address_1.getAddr)("ORACLE_ADDRESS", appState.chainId), appState.web3);
                    tokenPrice = String(yield oraclePrice.getAssetPrice(tokenAddress));
                }
                const travaLP = new ethers_1.Contract((0, address_1.getAddr)("TRAVA_LENDING_POOL_MARKET", appState.chainId), TravaLendingPool_json_1.default, appState.web3);
                let reverseList = yield travaLP.getReservesList();
                if (reverseList.includes(tokenAddress)) {
                    // get reserve data
                    const reserveData = yield travaLP.getReserveData(tokenAddress);
                    // token address
                    const tTokenAddress = String(reserveData[6]).toLowerCase();
                    const originTokenContract = new ethers_1.Contract(tokenAddress, BEP20_json_1.default, appState.web3);
                    const originTokenDecimal = yield originTokenContract.decimals();
                    const originBalanceInTToken = yield originTokenContract.balanceOf(tTokenAddress);
                    // get amount
                    const tTokenContract = new ethers_1.Contract(tTokenAddress, BEP20_json_1.default, appState.web3);
                    const tTokenBalance = yield tTokenContract.balanceOf(appState[modeFrom].address);
                    const tokenDecimal = yield tTokenContract.decimals();
                    const tTokenTotalSupply = yield tTokenContract.totalSupply();
                    let binaryAssetConfig = (0, bignumber_js_1.default)(reserveData[0]).toString(2);
                    if (binaryAssetConfig.length < 80) {
                        binaryAssetConfig = "0".repeat(80 - binaryAssetConfig.length) + binaryAssetConfig;
                    }
                    const maxLTV = parseInt(binaryAssetConfig.slice(-15), 2);
                    const liqThres = parseInt(binaryAssetConfig.slice(-31, -16), 2);
                    appState[modeFrom].detailTokenInPool =
                        appState[modeFrom].detailTokenInPool.set(tokenAddressState, {
                            decimals: originTokenDecimal,
                            tToken: {
                                address: tTokenAddress.toLowerCase(),
                                balances: tTokenBalance.toString(),
                                decimals: tokenDecimal.toString(),
                                totalSupply: tTokenTotalSupply.toString(),
                                exchangeRate: "1",
                                originToken: {
                                    balances: originBalanceInTToken.toString()
                                }
                            },
                            dToken: {
                                address: "",
                                balances: "",
                                decimals: "",
                                totalSupply: "",
                                exchangeRate: "1",
                                originToken: {
                                    balances: "",
                                }
                            },
                            maxLTV: maxLTV.toFixed(0),
                            liqThres: liqThres.toFixed(0),
                            price: tokenPrice
                        });
                }
                else {
                    throw new Error(`Can't update info of LP tToken ${tokenAddress}`);
                }
            }
            return appState;
        }
        catch (error) {
            throw new Error("Can't update LP tToken info !");
        }
    });
}
function updateLPDebtTokenInfo(appState1, _tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const appState = Object.assign({}, appState1);
            let tokenAddress = (0, address_1.convertHexStringToAddress)(_tokenAddress);
            let tokenAddressState = tokenAddress.toLowerCase();
            if (!appState.smartWalletState.detailTokenInPool.has(tokenAddressState)
                && appState.smartWalletState.detailTokenInPool.get(tokenAddressState).dToken == undefined) {
                let tokenPrice = (_a = appState.smartWalletState.detailTokenInPool.get(tokenAddressState)) === null || _a === void 0 ? void 0 : _a.price;
                if (tokenPrice == undefined) {
                    const oraclePrice = new oraclePrice_1.default((0, address_1.getAddr)("ORACLE_ADDRESS", appState.chainId), appState.web3);
                    tokenPrice = String(yield oraclePrice.getAssetPrice(tokenAddress));
                }
                const travaLP = new ethers_1.Contract((0, address_1.getAddr)("TRAVA_LENDING_POOL_MARKET", appState.chainId), TravaLendingPool_json_1.default, appState.web3);
                let reverseList = yield travaLP.getReservesList();
                if (reverseList.includes(tokenAddress)) {
                    // get reserve data
                    const reserveData = yield travaLP.getReserveData(tokenAddress);
                    // token address
                    const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();
                    const originTokenContract = new ethers_1.Contract(tokenAddress, BEP20_json_1.default, appState.web3);
                    const originTokenDecimal = yield originTokenContract.decimals();
                    const originBalanceInDToken = yield originTokenContract.balanceOf(variableDebtTokenAddress);
                    // get amount
                    const debtTokenContract = new ethers_1.Contract(variableDebtTokenAddress, BEP20_json_1.default, appState.web3);
                    const debtTokenBalance = yield debtTokenContract.balanceOf(appState.smartWalletState.address);
                    const tokenDecimal = yield debtTokenContract.decimals();
                    const dTokenTotalSupply = yield debtTokenContract.totalSupply();
                    let binaryAssetConfig = (0, bignumber_js_1.default)(reserveData[0]).toString(2);
                    if (binaryAssetConfig.length < 80) {
                        binaryAssetConfig = "0".repeat(80 - binaryAssetConfig.length) + binaryAssetConfig;
                    }
                    const maxLTV = parseInt(binaryAssetConfig.slice(-15), 2);
                    let liqThres = parseInt(binaryAssetConfig.slice(-31, -16), 2);
                    appState.smartWalletState.detailTokenInPool =
                        appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
                            decimals: originTokenDecimal,
                            dToken: {
                                address: variableDebtTokenAddress.toLowerCase(),
                                balances: debtTokenBalance.toString(),
                                decimals: tokenDecimal.toString(),
                                totalSupply: dTokenTotalSupply.toString(),
                                exchangeRate: "1",
                                originToken: {
                                    balances: originBalanceInDToken.toString(),
                                }
                            },
                            tToken: {
                                address: "",
                                balances: "",
                                decimals: "",
                                totalSupply: "",
                                exchangeRate: "1",
                                originToken: {
                                    balances: ""
                                }
                            },
                            maxLTV: maxLTV.toFixed(0),
                            liqThres: liqThres.toFixed(0),
                            price: tokenPrice
                        });
                }
                else {
                    throw new Error(`Can't update info of LP Debt Token ${tokenAddress}`);
                }
            }
            return appState;
        }
        catch (error) {
            throw new Error("Can't update LP Debt Token info !");
        }
    });
}
function updateTokenInPoolInfo(appState, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log("???? ")
        // const appState = { ...appState1 };
        const travaLP = new ethers_1.Contract((0, address_1.getAddr)("TRAVA_LENDING_POOL_MARKET", appState.chainId), TravaLendingPool_json_1.default, appState.web3);
        let reverseList = yield travaLP.getReservesList();
        reverseList = reverseList.map((e) => e.toLowerCase());
        let [reserveData, tokenPriceData, tokenDecimal] = yield Promise.all([
            (0, helper_1.multiCall)(TravaLendingPool_json_1.default, reverseList.map((address, _) => ({
                address: (0, address_1.getAddr)("TRAVA_LENDING_POOL_MARKET", appState.chainId),
                name: "getReserveData",
                params: [address],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(AaveOracle_json_1.default, reverseList.map((address, _) => ({
                address: (0, address_1.getAddr)("ORACLE_ADDRESS", appState.chainId),
                name: "getAssetPrice",
                params: [address],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, reverseList.map((address, _) => ({
                address: address,
                name: "decimals",
                params: [],
            })), appState.web3, appState.chainId),
        ]);
        reserveData = reserveData.flat();
        let tTokenList = [];
        let dTokenList = [];
        for (const r of reserveData) {
            tTokenList.push(r[6]);
            dTokenList.push(r[7]);
        }
        let modeFrom = (0, helper_1.getMode)(appState, _from);
        let [tTokenBalance, tTokenDecimal, tTokenTotalSupply, originInTTokenBalance, dTokenBalance, dTokenDecimal, dTokenTotalSupply, originInDTokenBalance] = yield Promise.all([
            (0, helper_1.multiCall)(BEP20_json_1.default, tTokenList.map((address, _) => ({
                address: address,
                name: "balanceOf",
                params: [appState[modeFrom].address],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, tTokenList.map((address, _) => ({
                address: address,
                name: "decimals",
                params: [],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, tTokenList.map((address, _) => ({
                address: address,
                name: "totalSupply",
                params: [],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, reverseList.map((address, index) => ({
                address: address,
                name: "balanceOf",
                params: [tTokenList[index]],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, dTokenList.map((address, _) => ({
                address: address,
                name: "balanceOf",
                params: [appState[modeFrom].address],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, dTokenList.map((address, _) => ({
                address: address,
                name: "decimals",
                params: [],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, dTokenList.map((address, _) => ({
                address: address,
                name: "totalSupply",
                params: [],
            })), appState.web3, appState.chainId),
            (0, helper_1.multiCall)(BEP20_json_1.default, reverseList.map((address, index) => ({
                address: address,
                name: "balanceOf",
                params: [dTokenList[index]],
            })), appState.web3, appState.chainId),
        ]);
        let binaryAssetConfig;
        let maxLTV;
        let liqThres;
        let tToken;
        let dToken;
        for (let i = 0; i < reverseList.length; i++) {
            if (!appState[modeFrom].detailTokenInPool.has(reverseList[i].toString().toLowerCase())) {
                let tokenInPool = appState[modeFrom].detailTokenInPool.get(reverseList[i].toString().toLowerCase());
                binaryAssetConfig = (0, bignumber_js_1.default)(reserveData[i][0]).toString(2);
                if (binaryAssetConfig.length < 80) {
                    binaryAssetConfig = "0".repeat(80 - binaryAssetConfig.length) + binaryAssetConfig;
                }
                maxLTV = parseInt(binaryAssetConfig.slice(-15), 2);
                liqThres = parseInt(binaryAssetConfig.slice(-31, -16), 2);
                tToken = {
                    address: tTokenList[i].toString().toLowerCase(),
                    balances: tTokenBalance[i].toString(),
                    decimals: tTokenDecimal[i].toString(),
                    totalSupply: tTokenTotalSupply[i].toString(),
                    exchangeRate: "1",
                    originToken: {
                        balances: originInTTokenBalance[i].toString(),
                    }
                };
                dToken = {
                    address: dTokenList[i].toString().toLowerCase(),
                    balances: dTokenBalance[i].toString(),
                    decimals: dTokenDecimal[i].toString(),
                    totalSupply: dTokenTotalSupply[i].toString(),
                    exchangeRate: "1",
                    originToken: {
                        balances: originInDTokenBalance[i].toString(),
                    }
                };
                if (tokenInPool === null || tokenInPool === void 0 ? void 0 : tokenInPool.tToken) {
                    tToken = tokenInPool.tToken;
                }
                if (tokenInPool === null || tokenInPool === void 0 ? void 0 : tokenInPool.dToken) {
                    dToken = tokenInPool.dToken;
                }
                appState[modeFrom].detailTokenInPool.set(reverseList[i].toString().toLowerCase(), {
                    decimals: tokenDecimal[i].toString(),
                    tToken: tToken,
                    dToken: dToken,
                    maxLTV: maxLTV.toFixed(0),
                    liqThres: liqThres.toFixed(0),
                    price: tokenPriceData[i].toString()
                });
            }
        }
        if (appState[modeFrom].travaLPState.lpReward.claimableReward == "") {
            const travaIncentiveContract = new ethers_1.Contract((0, address_1.getAddr)("INCENTIVE_CONTRACT", appState.chainId), IncentiveContract_json_1.default, appState.web3);
            let maxRewardCanGet = yield (0, SimulationWalletTravaLP_1.calculateMaxRewards)(appState);
            const rTravaAddress = yield travaIncentiveContract.REWARD_TOKEN();
            appState[modeFrom].travaLPState.lpReward.claimableReward = maxRewardCanGet.toString();
            appState[modeFrom].travaLPState.lpReward.tokenAddress = String(rTravaAddress).toLowerCase();
        }
        return appState;
    });
}
// call this before all actions
function updateTravaLPInfo(appState1, market) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            // first update token in pool balances
            if (market == undefined) {
                market = (0, address_1.getAddr)("TRAVA_LENDING_POOL_MARKET", appState.chainId);
            }
            const TravaLendingPool = new ethers_1.Contract(market, TravaLendingPool_json_1.default, appState.web3);
            const reserveAddressList = yield TravaLendingPool.getReservesList(); //danh sách địa chỉ tài sản dự trữ trong LP
            let [userTokenInPoolBalance, smartWalletTokenInPoolBalance,] = yield Promise.all([
                // gọi cùng 1 phương thức 'balanceOf' trên tất cả địa chỉ tài sản dự trữ
                (0, helper_1.multiCall)(//lấy số dư của người dùng
                BEP20_json_1.default, reserveAddressList.map((address, _) => ({
                    address: address,
                    name: "balanceOf",
                    params: [appState.walletState.address],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(//lấy số dư smart wallet
                BEP20_json_1.default, reserveAddressList.map((address, _) => ({
                    address: address,
                    name: "balanceOf",
                    params: [appState.smartWalletState.address],
                })), appState.web3, appState.chainId)
            ]);
            if (reserveAddressList.length == 0) {
                throw new Error("No reserve in TravaLP");
            }
            // update balance for wallet
            for (let i = 0; i < reserveAddressList.length; i++) {
                // update token balance for wallet
                let reserveAddress = reserveAddressList[i].toString().toLowerCase();
                // const reserve = new Contract(reserveAddress, BEP20ABI, appState.web3);
                // reserveAddress = String(reserveAddress).toLowerCase();
                if (String(appState.walletState.tokenBalances.get(reserveAddress)) ==
                    "undefined") {
                    appState.walletState.tokenBalances.set(reserveAddress, userTokenInPoolBalance[i].toString());
                }
                if (String(appState.smartWalletState.tokenBalances.get(reserveAddress)) ==
                    "undefined") {
                    appState.smartWalletState.tokenBalances.set(reserveAddress, smartWalletTokenInPoolBalance[i].toString());
                }
            }
            // second update TravaLP state for wallet
            const userData = yield TravaLendingPool.getUserAccountData(appState.walletState.address);
            // update appState for wallet
            appState.walletState.travaLPState.totalCollateralUSD =
                String(userData.totalCollateralUSD);
            appState.walletState.travaLPState.totalDebtUSD = String(userData.totalDebtUSD);
            appState.walletState.travaLPState.availableBorrowsUSD =
                String(userData.availableBorrowsUSD);
            appState.walletState.travaLPState.currentLiquidationThreshold =
                String(userData.currentLiquidationThreshold);
            appState.walletState.travaLPState.healthFactor = String(userData.healthFactor);
            appState.walletState.travaLPState.ltv = String(userData.ltv);
            // third update TravaLP state for smart wallet
            const smartWalletData = yield TravaLendingPool.getUserAccountData(appState.smartWalletState.address);
            // update appState for smart wallet
            appState.smartWalletState.travaLPState.totalCollateralUSD =
                String(smartWalletData.totalCollateralUSD);
            appState.smartWalletState.travaLPState.totalDebtUSD =
                String(smartWalletData.totalDebtUSD);
            appState.smartWalletState.travaLPState.availableBorrowsUSD =
                String(smartWalletData.availableBorrowsUSD);
            appState.smartWalletState.travaLPState.currentLiquidationThreshold =
                String(smartWalletData.currentLiquidationThreshold);
            appState.smartWalletState.travaLPState.healthFactor =
                String(smartWalletData.healthFactor);
            appState.smartWalletState.travaLPState.ltv = String(smartWalletData.ltv);
            yield updateTokenInPoolInfo(appState, appState.walletState.address);
            yield updateTokenInPoolInfo(appState, appState.smartWalletState.address);
            return appState;
        }
        catch (e) {
            console.log(e);
            return appState1;
        }
    });
}
function updateMaxRewardCanClaims(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            if (appState.smartWalletState.travaLPState.lpReward.claimableReward == "") {
                const travaLP = new ethers_1.Contract((0, address_1.getAddr)("TRAVA_LENDING_POOL_MARKET", appState.chainId), TravaLendingPool_json_1.default, appState.web3);
                let reverseList = yield travaLP.getReservesList();
                reverseList = reverseList.map((e) => e.toLowerCase());
                let [reserveData] = yield Promise.all([
                    (0, helper_1.multiCall)(TravaLendingPool_json_1.default, reverseList.map((address, _) => ({
                        address: (0, address_1.getAddr)("TRAVA_LENDING_POOL_MARKET", appState.chainId),
                        name: "getReserveData",
                        params: [address],
                    })), appState.web3, appState.chainId),
                ]);
                reserveData = reserveData.flat();
                // console.log("reserveData", reserveData);
                let tTokenList = [];
                let dTokenList = [];
                for (const r of reserveData) {
                    tTokenList.push(r[6]);
                    dTokenList.push(r[7]);
                }
                const travaIncentiveContract = new ethers_1.Contract((0, address_1.getAddr)("INCENTIVE_CONTRACT", appState.chainId), IncentiveContract_json_1.default, appState.web3);
                let maxRewardCanGet = yield travaIncentiveContract.getRewardsBalance(tTokenList.concat(dTokenList), appState.smartWalletState.address);
                appState.smartWalletState.travaLPState.lpReward.claimableReward = maxRewardCanGet.toString();
            }
            return appState;
        }
        catch (error) {
            throw new Error("Can't update LP tToken info !");
        }
    });
}
function updateRTravaAndTravaForReward(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let appState = Object.assign({}, appState1);
            const incentiveContract = new ethers_1.Contract((0, address_1.getAddr)("INCENTIVE_CONTRACT", appState.chainId), IncentiveContract_json_1.default, appState.web3);
            const rTravaAddress = yield incentiveContract.REWARD_TOKEN();
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, rTravaAddress);
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, rTravaAddress);
            appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, (0, address_1.getAddr)("TRAVA_TOKEN_IN_MARKET", appState.chainId));
            appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, (0, address_1.getAddr)("TRAVA_TOKEN_IN_MARKET", appState.chainId));
            appState.smartWalletState.travaLPState.lpReward.tokenAddress = String(rTravaAddress).toLowerCase();
            return appState;
        }
        catch (error) {
            throw new Error("Can't update LP tToken info !");
        }
    });
}
