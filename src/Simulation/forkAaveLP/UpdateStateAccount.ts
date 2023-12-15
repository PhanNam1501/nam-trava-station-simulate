
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress } from "../../utils/address";
import { getMode } from "../../utils/helper";
import axios from "axios";
import { ForkedAave, TokenInPoolData, WalletForkedAaveLPState } from "../../State";


export async function updateForkAaveLPState(appState1: ApplicationState, entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {

        if (appState.forkAaveLPState.isFetch == false || force == true) {
        let entity_ids: Array<string> = ["valas-finance", "radiant-v2", "granary-finance"];
        if (entity_ids.some(x => x === entity_id)){
            let dataLendingPool = await getDataLendingByAxios(entity_id, "0x" + appState.chainId);
            let data: ForkedAave = {
                id: dataLendingPool["id"],
                totalSupplyInUSD: dataLendingPool["totalSupplyInUSD"],
                numberOfLenders: dataLendingPool["numberOfLenders"],
                totalBorrowInUSD: dataLendingPool["totalBorrowInUSD"],
                markets: dataLendingPool["markets"],
                totalTVL: dataLendingPool["totalTVL"],
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
// export async function getListTokenAddress(appState1: ApplicationState, entity_id: string){
//     let appState = { ...appState1 };
//     let data = await getDataLendingByAxiosTramlineOverview(entity_id, "0x" + appState.chainId);
//     let listToken = data["listToken"];
//     let list: string[] = [];
//     for (let i = 0; i < listToken.length; i++){
//         if (listToken[i]["address"]){
//             list.push(listToken[i]["address"] as string);
//         }
//     }
//     return list;
// }

export async function UpdateTokenDetail(appState1: ApplicationState, entity_id: string){
    let appState = { ...appState1 };
    let dataLendingByAxiosTramline = await getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId);
    let data = await getDataLendingByAxiosTramlineOverview(entity_id, "0x" + appState.chainId);
    let listToken = data["listToken"];
    let list: string[] = [];
    for (let i = 0; i < listToken.length; i++){
        if (listToken[i]["address"]){
            list.push(listToken[i]["address"] as string);
        }
    }
    let token = dataLendingByAxiosTramline["poolDataSlice"]["pools"][data["address"]]["token"];
    let tTokenAddress: string;
    let dTokenAddress: string;
    for (let i = 0; i < list.length; i++){
        tTokenAddress = token[list[i]]["tTokenAddress"].toString()
        dTokenAddress = token[list[i]]["debtTokenAddress"].toString()
        let tTokenData: TokenInPoolData = {
            address: "",
            balances: "",
            decimals: "",
            totalSupply: "",
            originToken: {
                balances: "",
            },
        }
        let dTokenData: TokenInPoolData = {
            address: "",
            balances: "",
            decimals: "",
            totalSupply: "",
            originToken: {
                balances: "",
            },
        }
        appState.smartWalletState.detailTokenInPool.set(list[i], {tToken: tTokenData, dToken: dTokenData});
    }
    return appState;
}


export async function updateUserInForkAaveLPState(appState1: ApplicationState, _from: EthAddress , entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        let mode = getMode(appState, _from);
        let entity_ids: Array<string> = ["valas-finance", "radiant-v2", "granary-finance"];
        if (entity_ids.some(x => x === entity_id)){
            let dataLendingPool = await getDataUserByAxios(_from, entity_id, "0x" + appState.chainId);
            let data: WalletForkedAaveLPState = {
                id: dataLendingPool["id"],
                address: dataLendingPool["address"],
                totalAssets: dataLendingPool["totalAssets"],
                totalClaimable: dataLendingPool["totalClaimable"],
                totalDebts: dataLendingPool["totalDebts"],
                dapps: dataLendingPool["dapps"]
            }
            appState[mode].forkedAaveLPState.set(entity_id, data);
            const dataDapps = dataLendingPool["dapps"]
            const addressInAaveLP = dataDapps.map((item: any) => item["address"])
            console.log(addressInAaveLP)

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