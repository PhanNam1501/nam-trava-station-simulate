
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress } from "../../utils/address";
import { getMode } from "../../utils/helper";
import axios from "axios";
import { ForkedCompound, WalletForkedCompoundLPState } from "../../State";


export async function updateForkCompoundLPState(appState1: ApplicationState, entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        if (appState.forkCompoundLPState.isFetch == false || force == true){
        let entity_ids: Array<string> = ["venus", "liqee", "cream-lending", "apeswap-lending", "wepiggy"];
        if (entity_ids.some(x => x === entity_id)){
            let data1 = await getDataLendingByAxios(entity_id, "0x" + appState.chainId);
            let data: ForkedCompound = {
                id: data1["id"],
                totalSupplyInUSD: data1["totalSupplyInUSD"],
                numberOfLenders: data1["numberOfLenders"],
                totalBorrowInUSD: data1["totalBorrowInUSD"],
                markets: data1["markets"],
                totalTVL: data1["totalTVL"],
            }
            appState.forkCompoundLPState.forkCompoundLP.set(entity_id, data);
        }
        appState.forkCompoundLPState.isFetch = true;
    }
    } catch (error) {
        console.error(error);
    }
    return appState;
}

export async function updateUserInForkCompoundLPState(appState1: ApplicationState, _from: EthAddress , entity_id: string ,force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        let mode = getMode(appState, _from);
        let entity_ids: Array<string> = ["venus", "liqee", "cream-lending", "apeswap-lending", "wepiggy"];
        if (entity_ids.some(x => x === entity_id)){
            let data1 = await getDataUserByAxios(_from, entity_id, "0x" + appState.chainId);
            let data: WalletForkedCompoundLPState = {
                id: data1["id"],
                address: data1["address"],
                totalAssets: data1["totalAssets"],
                totalClaimable: data1["totalClaimable"],
                totalDebts: data1["totalDebts"],
                dapps: data1["dapps"],
            }
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
