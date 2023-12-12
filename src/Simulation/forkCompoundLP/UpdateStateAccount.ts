
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress } from "../../utils/address";
import { getMode } from "../../utils/helper";
import axios from "axios";
import { WalletForkedCompoundLPState } from "../../State";


export async function updateForkCompoundLPState(appState1: ApplicationState, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        let entity_ids: Array<string> = ["venus", "liqee", "cream-lending", "apeswap-lending", "wepiggy"];
        for (let entity_id of entity_ids) {
            let data = await getDataLendingByAxios(entity_id, "0x38");
            appState.forkCompoundLPState.forkCompoundLP.set(entity_id, data);
        }
    } catch (error) {
        console.error(error);
    }
    return appState;
}

export async function updateUserInForkCompoundLPState(appState1: ApplicationState, _from: EthAddress ,force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    let mode = getMode(appState, _from);
    try {
        let entity_ids: Array<string> = ["venus", "liqee", "cream-lending", "apeswap-lending", "wepiggy"];
        for (let entity_id of entity_ids) {
            let data: WalletForkedCompoundLPState = await getDataUserByAxios(_from, entity_id, "0x38");
            appState[mode].forkedCompoundLPState.set(entity_id, data);
        }
    } catch (error) {
        console.error(error);
    }
    return appState;
}

async function getDataLendingByAxios(entity_id: string, chain: string) {
    let url = `https://api.centic.io/dev/v3/projects/lending/${entity_id}/overview?chain=${chain}`
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
    let url = `https://api.centic.io/dev/v3/wallets/${address}/lendings/${entity_id}?chain=${chain}`
    try {
        const response = await axios.get(url)
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
