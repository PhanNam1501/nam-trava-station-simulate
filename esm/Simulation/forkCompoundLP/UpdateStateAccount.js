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
exports.updateUserInForkCompoundLPState = exports.updateTokenDetailInOthersPoolsCompound = exports.updateForkCompoundLPState = void 0;
const helper_1 = require("../../utils/helper");
const axios_1 = __importDefault(require("axios"));
const forkCompoundLPConfig_1 = require("./forkCompoundLPConfig");
const utils_1 = require("../../utils");
const ethers_1 = require("ethers");
const ForkCompoundController_json_1 = __importDefault(require("../../abis/ForkCompoundController.json"));
const forkCompoundLPConfig_2 = require("./forkCompoundLPConfig");
const BEP20_json_1 = __importDefault(require("../../abis/BEP20.json"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ICToken_json_1 = __importDefault(require("../../abis/ICToken.json"));
function updateForkCompoundLPState(appState1, entity_id, force) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (appState.forkCompoundLPState.isFetch == false || force == true) {
                if (forkCompoundLPConfig_1.entity_ids_compound.some(x => x === entity_id)) {
                    let dataLendingPool = yield getDataLendingByAxios(entity_id, "0x" + appState.chainId.toString(16));
                    let markets = dataLendingPool["markets"];
                    if (markets[0].assets.find((x) => x.name == "BNB")) {
                        markets[0].assets.find((x) => x.name == "BNB").address = (0, utils_1.getAddr)("BNB_ADDRESS").toLowerCase();
                    }
                    let data = {
                        id: dataLendingPool["id"],
                        totalSupplyInUSD: dataLendingPool["totalSupplyInUSD"],
                        numberOfLenders: dataLendingPool["numberOfLenders"],
                        totalBorrowInUSD: dataLendingPool["totalBorrowInUSD"],
                        markets: markets,
                        totalTVL: dataLendingPool["totalTVL"],
                    };
                    appState.forkCompoundLPState.forkCompoundLP.set(entity_id, data);
                }
                appState.forkCompoundLPState.isFetch = true;
                appState = yield updateUserInForkCompoundLPState(appState, appState.smartWalletState.address, entity_id);
            }
        }
        catch (error) {
            console.error(error);
        }
        return appState;
    });
}
exports.updateForkCompoundLPState = updateForkCompoundLPState;
function updateTokenDetailInOthersPoolsCompound(appState1, _from, entity_id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let from = _from.toLowerCase();
            let mode = (0, helper_1.getMode)(appState, from);
            let dataLendingByAxiosTramline = yield getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId.toString(16), from);
            let dataLendingByAxiosTramlineOverview = yield getDataLendingByAxiosTramlineOverview(entity_id, "0x" + appState.chainId.toString(16));
            let listToken = dataLendingByAxiosTramlineOverview["listToken"];
            let listTokenAddress = [];
            let haveBNB = false;
            for (let i = 0; i < listToken.length; i++) {
                if (listToken[i]["address"]) {
                    if (listToken[i]["address"] == utils_1.ZERO_ADDRESS) {
                        haveBNB = true;
                        continue;
                    }
                    listTokenAddress.push(listToken[i]["address"]);
                }
            }
            let token = dataLendingByAxiosTramline["poolDataSlice"]["pools"][dataLendingByAxiosTramlineOverview["address"]]["token"];
            let cTokenAddress;
            let cTokenList = [];
            for (let i = 0; i < listTokenAddress.length; i++) {
                cTokenAddress = token[listTokenAddress[i]]["cToken"].toString();
                cTokenList.push(cTokenAddress);
            }
            if (haveBNB) {
                cTokenList.push(token[utils_1.ZERO_ADDRESS]["cToken"].toString());
            }
            let [cTokenBalance, cTokenDecimal, cTokenTotalSupply, originIncTokenBalance, exchangeRates] = yield Promise.all([
                (0, helper_1.multiCall)(BEP20_json_1.default, cTokenList.map((address, _) => ({
                    address: address,
                    name: "balanceOf",
                    params: [from],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, cTokenList.map((address, _) => ({
                    address: address,
                    name: "decimals",
                    params: [],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, cTokenList.map((address, _) => ({
                    address: address,
                    name: "totalSupply",
                    params: [],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, listTokenAddress.map((address, index) => ({
                    address: address,
                    name: "balanceOf",
                    params: [cTokenList[index]],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(ICToken_json_1.default, cTokenList.map((address, _) => ({
                    address: address,
                    name: "exchangeRateStored",
                    params: [],
                })), appState.web3, appState.chainId),
            ]);
            if (haveBNB) {
                const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(token[utils_1.ZERO_ADDRESS]["cToken"].toString())));
                originIncTokenBalance.push(balance);
                listTokenAddress.push(utils_1.ZERO_ADDRESS);
            }
            let walletForkedCompoundLPState = appState[mode].forkedCompoundLPState.get(entity_id);
            if (!walletForkedCompoundLPState) {
                throw new Error("WalletForkedCompoundLPState is not initialized");
            }
            for (let i = 0; i < listTokenAddress.length; i++) {
                const exchangeRate = (0, bignumber_js_1.default)(exchangeRates[i].toString()).div((0, bignumber_js_1.default)(10).pow(10 + Number(token[listTokenAddress[i]]["decimal"].toString()))).toFixed();
                let cTokenData = {
                    address: cTokenList[i].toString().toLowerCase(),
                    balances: cTokenBalance[i].toString(),
                    decimals: cTokenDecimal[i].toString(),
                    totalSupply: cTokenTotalSupply[i].toString(),
                    originToken: {
                        balances: originIncTokenBalance[i].toString(),
                    },
                    exchangeRate: exchangeRate
                };
                let data = {
                    decimals: token[listTokenAddress[i]]["decimal"].toString(),
                    cToken: cTokenData,
                    maxLTV: token[listTokenAddress[i]]["risk"]["maxLTV"].toString(),
                    liqThres: token[listTokenAddress[i]]["risk"]["liqThres"].toString(),
                    price: token[listTokenAddress[i]]["price"].toString()
                };
                if (listTokenAddress[i] == utils_1.ZERO_ADDRESS) {
                    walletForkedCompoundLPState.detailTokenInPool.set((0, utils_1.getAddr)("BNB_ADDRESS").toLowerCase(), data);
                }
                else {
                    walletForkedCompoundLPState.detailTokenInPool.set(listTokenAddress[i], data);
                }
            }
            appState[mode].forkedCompoundLPState.set(entity_id, walletForkedCompoundLPState);
            return appState;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.updateTokenDetailInOthersPoolsCompound = updateTokenDetailInOthersPoolsCompound;
function updateUserInForkCompoundLPState(appState1, _from, entity_id, force) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let mode = (0, helper_1.getMode)(appState, _from);
            if (forkCompoundLPConfig_1.entity_ids_compound.some(x => x === entity_id)) {
                let dataLendingPool = yield getDataUserByAxios(_from, entity_id, "0x" + appState.chainId.toString(16));
                let from = _from;
                let dataLendingByAxiosTramline = yield getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId.toString(16), from);
                let data = {
                    id: dataLendingPool["id"],
                    address: dataLendingPool["address"],
                    totalAssets: dataLendingPool["totalAssets"],
                    totalClaimable: dataLendingPool["totalClaimable"],
                    totalDebts: dataLendingPool["totalDebts"],
                    dapps: dataLendingPool["dapps"],
                    detailTokenInPool: new Map(),
                    healthFactor: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["healthFactor"],
                    ltv: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["ltv"],
                    currentLiquidationThreshold: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["currentLiquidationThreshold"],
                };
                if (dataLendingPool["dapps"].length == 0) {
                    data.dapps = [
                        {
                            id: dataLendingPool["id"],
                            type: "project",
                            value: 0,
                            depositInUSD: 0,
                            borrowInUSD: 0,
                            claimable: 0,
                            reserves: [
                                {
                                    category: "Lending",
                                    healthFactor: 0,
                                    deposit: [],
                                    borrow: [],
                                    assetsIn: [],
                                }
                            ]
                        }
                    ];
                }
                else {
                    if (dataLendingPool["dapps"][0].reserves[0].deposit.find((x) => x.name == "BNB")) {
                        dataLendingPool["dapps"][0].reserves[0].deposit.find((x) => x.name == "BNB").address = (0, utils_1.getAddr)("BNB_ADDRESS").toLowerCase();
                    }
                    if (dataLendingPool["dapps"][0].reserves[0].borrow.find((x) => x.name == "BNB")) {
                        dataLendingPool["dapps"][0].reserves[0].borrow.find((x) => x.name == "BNB").address = (0, utils_1.getAddr)("BNB_ADDRESS").toLowerCase();
                    }
                }
                let unitrollerAddress = (_a = forkCompoundLPConfig_2.compoundConfig.find(config => config.entity_id === entity_id)) === null || _a === void 0 ? void 0 : _a.controller;
                if (unitrollerAddress == undefined) {
                    throw new Error("unitrollerAddress is undefined");
                }
                let unitrollerContract = new ethers_1.Contract(unitrollerAddress, ForkCompoundController_json_1.default, appState.web3);
                let assetsIn = yield unitrollerContract.getAssetsIn(from);
                let assetsInList = [];
                for (let i = 0; i < assetsIn.length; i++) {
                    assetsInList.push(assetsIn[i].toLowerCase());
                }
                data.dapps[0].reserves[0].assetsIn = assetsInList;
                appState[mode].forkedCompoundLPState.set(entity_id, data);
                appState = yield updateTokenDetailInOthersPoolsCompound(appState, from, entity_id);
            }
        }
        catch (error) {
            console.error(error);
        }
        return appState;
    });
}
exports.updateUserInForkCompoundLPState = updateUserInForkCompoundLPState;
function getDataLendingByAxios(entity_id, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${utils_1.centic_api}/v3/projects/lending/${entity_id}/overview?chain=${chain}`;
        try {
            const response = yield axios_1.default.request({
                method: "get",
                url: url,
                headers: {
                    "x-apikey": utils_1.centic_api_key
                }
            });
            const data = response.data;
            return data;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
function getDataUserByAxios(address, entity_id, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${utils_1.centic_api}/v3/wallets/${address}/lendings/${entity_id}?chain=${chain}`;
        try {
            const response = yield axios_1.default.request({
                method: "get",
                url: url,
                headers: {
                    "x-apikey": utils_1.centic_api_key
                }
            });
            const data = response.data;
            return data;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
function getDataLendingByAxiosTramline(entity_id, chain, userAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${utils_1.tramline_api}/trava-station/lending-pool/detail?entity=${entity_id}&chainId=${chain}&userAddress=${userAddress}`;
        try {
            const response = yield axios_1.default.request({
                method: "get",
                url: url
            });
            const data = response.data;
            return data;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
function getDataLendingByAxiosTramlineOverview(entity_id, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${utils_1.tramline_api}/trava-station/lending-pool/overview?entity=${entity_id}&chainId=${chain}`;
        try {
            const response = yield axios_1.default.request({
                method: "get",
                url: url,
            });
            const data = response.data;
            return data;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
