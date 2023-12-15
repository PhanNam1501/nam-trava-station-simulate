
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress } from "../../utils/address";
import { getMode } from "../../utils/helper";
import axios from "axios";
import { ForkedAave, WalletForkedAaveLPState } from "../../State";


export async function updateForkAaveLPState(appState1: ApplicationState, entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {

        if (appState.forkAaveLPState.isFetch == false || force == true) {
        let entity_ids: Array<string> = ["valas-finance", "radiant-v2", "granary-finance"];
        if (entity_ids.some(x => x === entity_id)){
            let dataLendingPool = await getDataLendingByAxios(entity_id, "0x" + appState.chainId);
            let data: ForkedAave = {...dataLendingPool}
            appState.forkAaveLPState.forkAaveLP.set(entity_id, data);
        }
        appState.forkAaveLPState.isFetch = true;
    }
    } catch (error) {
        console.error(error);
    }
    return appState;
}

export async function getTTokenAddress(appState1: ApplicationState, entity_id: string, tokenAddress: EthAddress){
    let appState = { ...appState1 };
    let dataLendingByAxiosTramline = await getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId);
    let data = await getDataLendingByAxiosTramlineOverview(entity_id, "0x" + appState.chainId);
    let token = dataLendingByAxiosTramline["poolDataSlice"]["pools"][data["address"]]["token"];
    let tTokenAddress: string;
    tTokenAddress = token[tokenAddress]["tTokenAddress"].toString()
    return tTokenAddress;
}

export async function getDTokenAddress(appState1: ApplicationState, entity_id: string, tokenAddress: EthAddress){
    let appState = { ...appState1 };
    let dataLendingByAxiosTramline = await getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId);
    let data = await getDataLendingByAxiosTramlineOverview(entity_id, "0x" + appState.chainId);
    let token = dataLendingByAxiosTramline["poolDataSlice"]["pools"][data["address"]]["token"];
    let tTokenAddress: string;
    tTokenAddress = token[tokenAddress]["debtTokenAddress"].toString()
    return tTokenAddress;
}

export async function updateUserInForkAaveLPState(appState1: ApplicationState, _from: EthAddress , entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        let mode = getMode(appState, _from);
        let entity_ids: Array<string> = ["valas-finance", "radiant-v2", "granary-finance"];
        if (entity_ids.some(x => x === entity_id)){
            let dataLendingPool = await getDataUserByAxios(_from, entity_id, "0x" + appState.chainId);
            let data: WalletForkedAaveLPState = {...dataLendingPool}
            appState[mode].forkedCompoundLPState.set(entity_id, data);
    }
    } catch (error) {
        console.error(error);
    }
    return appState;
}

async function getDataLendingByAxios(entity_id: string, chain: string) {
    let url = `https://develop.centic.io/dev/v3/projects/lending/${entity_id}/overview?chain=${chain}`
    try {
        const response = await axios.get(url)
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function getDataUserByAxios(address: EthAddress, entity_id: string, chain: string) {
    let url = `https://develop.centic.io/dev/v3/wallets/${address}/lendings/${entity_id}?chain=${chain}`
    try {
        const response = await axios.get(url)
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function getDataLendingByAxiosTramline(entity_id: string, chain: string) {
    let url = `https://tramlines-backend.trava.finance/api/trava-station/lending-pool/detail?entity=${entity_id}&chainId=${chain}`
    try {
        const response = await axios.get(url)
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function getDataLendingByAxiosTramlineOverview(entity_id: string, chain: string) {
    let url = `https://tramlines-backend.trava.finance/api/trava-station/lending-pool/overview?entity=${entity_id}&chainId=${chain}`
    try {
        const response = await axios.get(url)
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}