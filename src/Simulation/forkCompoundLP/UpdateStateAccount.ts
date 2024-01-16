
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { getMode } from "../../utils/helper";
import axios from "axios";
import { ForkedCompound, WalletForkedCompoundLPState } from "../../State";
import { entity_ids_compound } from "./forkCompoundLPConfig";
import { centic_api, centic_api_key, tramline_api } from "../../utils";
import { Contract } from "ethers";
import ForkCompoundController from "../../abis/ForkCompoundController.json";
import { compoundConfig } from "./forkCompoundLPConfig";
export async function updateForkCompoundLPState(appState1: ApplicationState, entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        if (appState.forkCompoundLPState.isFetch == false || force == true) {
            if (entity_ids_compound.some(x => x === entity_id)) {
                let dataLendingPool = await getDataLendingByAxios(entity_id, "0x" + appState.chainId.toString(16));
                console.log("dataLendingPoolNoFrom", dataLendingPool)
                let data: ForkedCompound = {
                    id: dataLendingPool["id"],
                    totalSupplyInUSD: dataLendingPool["totalSupplyInUSD"],
                    numberOfLenders: dataLendingPool["numberOfLenders"],
                    totalBorrowInUSD: dataLendingPool["totalBorrowInUSD"],
                    markets: dataLendingPool["markets"],
                    totalTVL: dataLendingPool["totalTVL"],
                }
                appState.forkCompoundLPState.forkCompoundLP.set(entity_id, data);
            }
            appState.forkCompoundLPState.isFetch = true;
            appState = await updateUserInForkCompoundLPState(appState, appState.smartWalletState.address, entity_id);
        }
    } catch (error) {
        console.error(error);
    }
    return appState;
}

export async function updateUserInForkCompoundLPState(appState1: ApplicationState, _from: EthAddress, entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        let mode = getMode(appState, _from);
        if (entity_ids_compound.some(x => x === entity_id)) {
            let dataLendingPool = await getDataUserByAxios(_from, entity_id, "0x" + appState.chainId.toString(16));
            let from = _from;
            let dataLendingByAxiosTramline = await getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId.toString(16), from);
            let data: WalletForkedCompoundLPState = {
                id: dataLendingPool["id"],
                address: dataLendingPool["address"],
                totalAssets: dataLendingPool["totalAssets"],
                totalClaimable: dataLendingPool["totalClaimable"],
                totalDebts: dataLendingPool["totalDebts"],
                dapps: dataLendingPool["dapps"],
                healthFactor: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["healthFactor"],
                ltv: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["ltv"],
                currentLiquidationThreshold: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["currentLiquidationThreshold"],
            }
            if (dataLendingPool["dapps"].length == 0){
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
              }]
            }

            let unitrollerAddress = compoundConfig.find(config => config.entity_id === entity_id)?.controller;
            if (unitrollerAddress == undefined) {
                throw new Error("unitrollerAddress is undefined");
            }
            let unitrollerContract = new Contract(unitrollerAddress, ForkCompoundController, appState.web3)
            let assetsIn = await unitrollerContract.getAssetsIn(from);
            data.dapps[0].reserves[0].assetsIn = assetsIn;
            appState[mode].forkedCompoundLPState.set(entity_id, data);
        }
    } catch (error) {
        console.error(error);
    }
    return appState;
}

async function getDataLendingByAxios(entity_id: string, chain: string) {
    let url = `${centic_api}/v3/projects/lending/${entity_id}/overview?chain=${chain}`
    try {
        const response = await axios.request({
          method: "get",
          url: url,
          headers: {
            "x-apikey": centic_api_key
          }
        })
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function getDataUserByAxios(address: EthAddress, entity_id: string, chain: string) {
    let url = `${centic_api}/v3/wallets/${address}/lendings/${entity_id}?chain=${chain}`
    try {
        const response = await axios.request({
          method: "get",
          url: url,
          headers: {
            "x-apikey": centic_api_key
          }
        })
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function getDataLendingByAxiosTramline(entity_id: string, chain: string, userAddress: EthAddress) {
    let url = `${tramline_api}/trava-station/lending-pool/detail?entity=${entity_id}&chainId=${chain}&userAddress=${userAddress}`
    try {
        const response = await axios.request({
          method: "get",
          url: url
        })
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function getDataLendingByAxiosTramlineOverview(entity_id: string, chain: string) {
    let url = `${tramline_api}/trava-station/lending-pool/overview?entity=${entity_id}&chainId=${chain}`
    try {
        const response = await axios.request({
          method: "get",
          url: url,

        })
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}