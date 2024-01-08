var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getMode } from "../../utils/helper";
import axios from "axios";
import { entity_ids_compound } from "./forkCompoundLPConfig";
export function updateForkCompoundLPState(appState1, entity_id, force) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (appState.forkCompoundLPState.isFetch == false || force == true) {
                if (entity_ids_compound.some(x => x === entity_id)) {
                    let data1 = yield getDataLendingByAxios(entity_id, "0x" + appState.chainId.toString(16));
                    let data = {
                        id: data1["id"],
                        totalSupplyInUSD: data1["totalSupplyInUSD"],
                        numberOfLenders: data1["numberOfLenders"],
                        totalBorrowInUSD: data1["totalBorrowInUSD"],
                        markets: data1["markets"],
                        totalTVL: data1["totalTVL"],
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
export function updateUserInForkCompoundLPState(appState1, _from, entity_id, force) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let mode = getMode(appState, _from);
            if (entity_ids_compound.some(x => x === entity_id)) {
                let data1 = yield getDataUserByAxios(_from, entity_id, "0x" + appState.chainId.toString(16));
                let from = _from;
                let dataLendingByAxiosTramline = yield getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId.toString(16), from);
                let data = {
                    id: data1["id"],
                    address: data1["address"],
                    totalAssets: data1["totalAssets"],
                    totalClaimable: data1["totalClaimable"],
                    totalDebts: data1["totalDebts"],
                    dapps: data1["dapps"],
                    healthFactor: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["healthFactor"],
                    ltv: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["ltv"],
                    currentLiquidationThreshold: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["currentLiquidationThreshold"],
                };
                appState[mode].forkedCompoundLPState.set(entity_id, data);
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
        let url = `https://develop.centic.io/dev/v3/projects/lending/${entity_id}/overview?chain=${chain}`;
        try {
            const response = yield axios.get(url);
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
        let url = `https://develop.centic.io/dev/v3/wallets/${address}/lendings/${entity_id}?chain=${chain}`;
        try {
            const response = yield axios.get(url);
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
        let url = `https://tramlines-backend.trava.finance/api/trava-station/lending-pool/detail?entity=${entity_id}&chainId=${chain}&userAddress=${userAddress}`;
        try {
            const response = yield axios.get(url);
            const data = response.data;
            return data;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
