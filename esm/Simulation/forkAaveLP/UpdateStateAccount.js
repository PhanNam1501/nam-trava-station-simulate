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
exports.updateForkAaveLPState = updateForkAaveLPState;
exports.updateTokenDetailInOthersPools = updateTokenDetailInOthersPools;
exports.updateUserInForkAaveLPState = updateUserInForkAaveLPState;
const BEP20_json_1 = __importDefault(require("../../abis/BEP20.json"));
const helper_1 = require("../../utils/helper");
const axios_1 = __importDefault(require("axios"));
const forkAaveLPConfig_1 = require("./forkAaveLPConfig");
const utils_1 = require("../../utils");
function updateForkAaveLPState(appState1, entity_id, force) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (appState.forkAaveLPState.forkAaveLP.get(entity_id) == undefined || force == true) {
                if (forkAaveLPConfig_1.entity_ids_aave.some(x => x === entity_id)) {
                    let dataLendingPool = yield getDataLendingByAxios(entity_id, "0x" + appState.chainId.toString(16));
                    let data = {
                        id: dataLendingPool["id"],
                        totalSupplyInUSD: dataLendingPool["totalSupplyInUSD"],
                        numberOfLenders: dataLendingPool["numberOfLenders"],
                        totalBorrowInUSD: dataLendingPool["totalBorrowInUSD"],
                        markets: dataLendingPool["markets"],
                        totalTVL: dataLendingPool["totalTVL"],
                    };
                    appState.forkAaveLPState.forkAaveLP.set(entity_id, data);
                }
                appState = yield updateUserInForkAaveLPState(appState, appState.smartWalletState.address, entity_id);
            }
        }
        catch (error) {
            console.error(error);
        }
        return appState;
    });
}
function updateTokenDetailInOthersPools(appState1, _from, entity_id) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let from = _from.toLowerCase();
            let mode = (0, helper_1.getMode)(appState, from);
            let dataLendingByAxiosTramline = yield getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId.toString(16), from);
            let dataLendingByAxiosTramlineOverview = yield getDataLendingByAxiosTramlineOverview(entity_id, "0x" + appState.chainId.toString(16));
            let listToken = dataLendingByAxiosTramlineOverview["listToken"];
            let listTokenAddress = [];
            for (let i = 0; i < listToken.length; i++) {
                if (listToken[i]["address"]) {
                    listTokenAddress.push(listToken[i]["address"]);
                }
            }
            let token = dataLendingByAxiosTramline["poolDataSlice"]["pools"][dataLendingByAxiosTramlineOverview["address"]]["token"];
            let tTokenAddress;
            let dTokenAddress;
            let tTokenList = [];
            let dTokenList = [];
            for (let i = 0; i < listTokenAddress.length; i++) {
                tTokenAddress = token[listTokenAddress[i]]["tTokenAddress"].toString();
                dTokenAddress = token[listTokenAddress[i]]["debtTokenAddress"].toString();
                tTokenList.push(tTokenAddress);
                dTokenList.push(dTokenAddress);
            }
            let [tTokenBalance, tTokenDecimal, tTokenTotalSupply, originInTTokenBalance, dTokenBalance, dTokenDecimal, dTokenTotalSupply, originInDTokenBalance] = yield Promise.all([
                (0, helper_1.multiCall)(BEP20_json_1.default, tTokenList.map((address, _) => ({
                    address: address,
                    name: "balanceOf",
                    params: [from],
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
                (0, helper_1.multiCall)(BEP20_json_1.default, listTokenAddress.map((address, index) => ({
                    address: address,
                    name: "balanceOf",
                    params: [tTokenList[index]],
                })), appState.web3, appState.chainId),
                (0, helper_1.multiCall)(BEP20_json_1.default, dTokenList.map((address, _) => ({
                    address: address,
                    name: "balanceOf",
                    params: [from],
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
                (0, helper_1.multiCall)(BEP20_json_1.default, listTokenAddress.map((address, index) => ({
                    address: address,
                    name: "balanceOf",
                    params: [dTokenList[index]],
                })), appState.web3, appState.chainId),
            ]);
            let walletForkedAaveLPState = appState[mode].forkedAaveLPState.get(entity_id);
            if (!walletForkedAaveLPState) {
                throw new Error("WalletForkedAaveLPState is not initialized");
            }
            for (let i = 0; i < listTokenAddress.length; i++) {
                let tTokenData = {
                    address: tTokenList[i].toString().toLowerCase(),
                    balances: tTokenBalance[i].toString(),
                    decimals: tTokenDecimal[i].toString(),
                    totalSupply: tTokenTotalSupply[i].toString(),
                    exchangeRate: "1",
                    originToken: {
                        balances: originInTTokenBalance[i].toString(),
                    }
                };
                let dTokenData = {
                    address: dTokenList[i].toString().toLowerCase(),
                    balances: dTokenBalance[i].toString(),
                    decimals: dTokenDecimal[i].toString(),
                    totalSupply: dTokenTotalSupply[i].toString(),
                    exchangeRate: "1",
                    originToken: {
                        balances: originInDTokenBalance[i].toString(),
                    }
                };
                walletForkedAaveLPState.detailTokenInPool.set(listTokenAddress[i], {
                    decimals: token[listTokenAddress[i]]["decimal"].toString(),
                    tToken: tTokenData,
                    dToken: dTokenData,
                    maxLTV: token[listTokenAddress[i]]["risk"]["maxLTV"].toString(),
                    liqThres: token[listTokenAddress[i]]["risk"]["liqThres"].toString(),
                    price: token[listTokenAddress[i]]["price"].toString(),
                });
            }
            appState[mode].forkedAaveLPState.set(entity_id, walletForkedAaveLPState);
            return appState;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
function updateUserInForkAaveLPState(appState1, _from, entity_id, force) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let mode = (0, helper_1.getMode)(appState, _from);
            if (forkAaveLPConfig_1.entity_ids_aave.some(x => x === entity_id)) {
                let from = _from;
                let dataLendingByAxiosTramline = yield getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId.toString(16), from);
                let dataLendingPool = yield getDataUserByAxios(_from, entity_id, "0x" + appState.chainId.toString(16));
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
                                }
                            ]
                        }
                    ];
                }
                appState[mode].forkedAaveLPState.set(entity_id, data);
                appState = yield updateTokenDetailInOthersPools(appState, _from, entity_id);
            }
            return appState;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
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
        console.log(url);
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
