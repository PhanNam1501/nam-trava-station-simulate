
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
            let data1 = await getDataLendingByAxios(entity_id, "0x" + appState.chainId);
            let data2 = await getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId);
            let dataToken = data2.get("poolDataSlice")?.get("pools").get("tolen");
            console.log(dataToken)
            let data: ForkedAave = {
                id: data1.id,
                totalSupplyInUSD: data1.totalSupplyInUSD,
                numberOfLenders: data1.numberOfLenders,
                totalBorrowInUSD: data1.totalBorrowInUSD,
                markets: data1.markets,
                totalTVL: data1.totalTVL,
                tTokenAddress: data1.tTokenAddress,
                debtTokenAddress: data1.debtTokenAddress,
            }
            
            appState.forkAaveLPState.forkAaveLP.set(entity_id, data);
        }
        appState.forkAaveLPState.isFetch = true;
    }
    } catch (error) {
        console.error(error);
    }
    return appState;
}

export async function updateUserInForkAaveLPState(appState1: ApplicationState, _from: EthAddress , entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        let mode = getMode(appState, _from);
        let entity_ids: Array<string> = ["valas-finance", "radiant-v2", "granary-finance"];
        if (entity_ids.some(x => x === entity_id)){
            let data1 = await getDataUserByAxios(_from, entity_id, "0x" + appState.chainId);
            let data: WalletForkedAaveLPState = {...data1}
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