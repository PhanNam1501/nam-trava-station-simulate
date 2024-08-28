var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getMode, multiCall } from "../../utils/helper";
import axios from "axios";
import { entity_ids_compound } from "./forkCompoundLPConfig";
import { ZERO_ADDRESS, centic_api, centic_api_key, getAddr, tramline_api } from "../../utils";
import { Contract } from "ethers";
import ForkCompoundController from "../../abis/ForkCompoundController.json";
import { compoundConfig } from "./forkCompoundLPConfig";
import BEP20ABI from "../../abis/BEP20.json";
import BigNumber from "bignumber.js";
import CTokenABI from "../../abis/ICToken.json";
export function updateForkCompoundLPState(appState1, entity_id, force) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (appState.forkCompoundLPState.isFetch == false || force == true) {
                if (entity_ids_compound.some(x => x === entity_id)) {
                    let dataLendingPool = yield getDataLendingByAxios(entity_id, "0x" + appState.chainId.toString(16));
                    let markets = dataLendingPool["markets"];
                    if (markets[0].assets.find((x) => x.name == "BNB")) {
                        markets[0].assets.find((x) => x.name == "BNB").address = getAddr("BNB_ADDRESS").toLowerCase();
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
export function updateTokenDetailInOthersPoolsCompound(appState1, _from, entity_id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let from = _from.toLowerCase();
            let mode = getMode(appState, from);
            let dataLendingByAxiosTramline = yield getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId.toString(16), from);
            let dataLendingByAxiosTramlineOverview = yield getDataLendingByAxiosTramlineOverview(entity_id, "0x" + appState.chainId.toString(16));
            let listToken = dataLendingByAxiosTramlineOverview["listToken"];
            let listTokenAddress = [];
            let haveBNB = false;
            for (let i = 0; i < listToken.length; i++) {
                if (listToken[i]["address"]) {
                    if (listToken[i]["address"] == ZERO_ADDRESS) {
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
                cTokenList.push(token[ZERO_ADDRESS]["cToken"].toString());
            }
            let [cTokenBalance, cTokenDecimal, cTokenTotalSupply, originIncTokenBalance, exchangeRates] = yield Promise.all([
                multiCall(BEP20ABI, cTokenList.map((address, _) => ({
                    address: address,
                    name: "balanceOf",
                    params: [from],
                })), appState.web3, appState.chainId),
                multiCall(BEP20ABI, cTokenList.map((address, _) => ({
                    address: address,
                    name: "decimals",
                    params: [],
                })), appState.web3, appState.chainId),
                multiCall(BEP20ABI, cTokenList.map((address, _) => ({
                    address: address,
                    name: "totalSupply",
                    params: [],
                })), appState.web3, appState.chainId),
                multiCall(BEP20ABI, listTokenAddress.map((address, index) => ({
                    address: address,
                    name: "balanceOf",
                    params: [cTokenList[index]],
                })), appState.web3, appState.chainId),
                multiCall(CTokenABI, cTokenList.map((address, _) => ({
                    address: address,
                    name: "exchangeRateStored",
                    params: [],
                })), appState.web3, appState.chainId),
            ]);
            if (haveBNB) {
                const balance = String(yield ((_a = appState.web3) === null || _a === void 0 ? void 0 : _a.getBalance(token[ZERO_ADDRESS]["cToken"].toString())));
                originIncTokenBalance.push(balance);
                listTokenAddress.push(ZERO_ADDRESS);
            }
            let walletForkedCompoundLPState = appState[mode].forkedCompoundLPState.get(entity_id);
            if (!walletForkedCompoundLPState) {
                throw new Error("WalletForkedCompoundLPState is not initialized");
            }
            for (let i = 0; i < listTokenAddress.length; i++) {
                const exchangeRate = BigNumber(exchangeRates[i].toString()).div(BigNumber(10).pow(10 + Number(token[listTokenAddress[i]]["decimal"].toString()))).toFixed();
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
                if (listTokenAddress[i] == ZERO_ADDRESS) {
                    walletForkedCompoundLPState.detailTokenInPool.set(getAddr("BNB_ADDRESS").toLowerCase(), data);
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
export function updateUserInForkCompoundLPState(appState1, _from, entity_id, force) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let mode = getMode(appState, _from);
            if (entity_ids_compound.some(x => x === entity_id)) {
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
                        dataLendingPool["dapps"][0].reserves[0].deposit.find((x) => x.name == "BNB").address = getAddr("BNB_ADDRESS").toLowerCase();
                    }
                    if (dataLendingPool["dapps"][0].reserves[0].borrow.find((x) => x.name == "BNB")) {
                        dataLendingPool["dapps"][0].reserves[0].borrow.find((x) => x.name == "BNB").address = getAddr("BNB_ADDRESS").toLowerCase();
                    }
                }
                let unitrollerAddress = (_a = compoundConfig.find(config => config.entity_id === entity_id)) === null || _a === void 0 ? void 0 : _a.controller;
                if (unitrollerAddress == undefined) {
                    throw new Error("unitrollerAddress is undefined");
                }
                let unitrollerContract = new Contract(unitrollerAddress, ForkCompoundController, appState.web3);
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
function getDataLendingByAxios(entity_id, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${centic_api}/v3/projects/lending/${entity_id}/overview?chain=${chain}`;
        try {
            const response = yield axios.request({
                method: "get",
                url: url,
                headers: {
                    "x-apikey": centic_api_key
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
        let url = `${centic_api}/v3/wallets/${address}/lendings/${entity_id}?chain=${chain}`;
        try {
            const response = yield axios.request({
                method: "get",
                url: url,
                headers: {
                    "x-apikey": centic_api_key
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
        let url = `${tramline_api}/trava-station/lending-pool/detail?entity=${entity_id}&chainId=${chain}&userAddress=${userAddress}`;
        try {
            const response = yield axios.request({
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
        let url = `${tramline_api}/trava-station/lending-pool/overview?entity=${entity_id}&chainId=${chain}`;
        try {
            const response = yield axios.request({
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
