
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { getMode, multiCall } from "../../utils/helper";
import axios from "axios";
import { DetailTokenInPoolCompound, ForkedCompound, WalletForkedCompoundLPState } from "../../State";
import { entity_ids_compound } from "./forkCompoundLPConfig";
import { centic_api, centic_api_key, tramline_api } from "../../utils";
import { Contract } from "ethers";
import ForkCompoundController from "../../abis/ForkCompoundController.json";
import { compoundConfig } from "./forkCompoundLPConfig";
import BEP20ABI from "../../abis/BEP20.json";
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

export async function updateTokenDetailInOthersPoolsCompound(appState1: ApplicationState, _from: EthAddress, entity_id: string): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try{
        let from = _from.toLowerCase();
        let mode = getMode(appState, from);
        let dataLendingByAxiosTramline = await getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId.toString(16), from);
        let dataLendingByAxiosTramlineOverview = await getDataLendingByAxiosTramlineOverview(entity_id, "0x" + appState.chainId.toString(16));
        let listToken = dataLendingByAxiosTramlineOverview["listToken"];
        let listTokenAddress: string[] = [];
        for (let i = 0; i < listToken.length; i++){
            if (listToken[i]["address"]){
                listTokenAddress.push(listToken[i]["address"] as string);
            }
        }
        let token = dataLendingByAxiosTramline["poolDataSlice"]["pools"][dataLendingByAxiosTramlineOverview["address"]]["token"];
        let cTokenAddress: string;
        let cTokenList = [] as Array<string>;      
        for (let i = 0; i < listTokenAddress.length; i++){
            cTokenAddress = token[listTokenAddress[i]]["cToken"].toString()
            cTokenList.push(cTokenAddress)
        }
        console.log(listTokenAddress)
        console.log(cTokenList)
        let [cTokenBalance,
            cTokenDecimal,
            cTokenTotalSupply, 
            originIncTokenBalance
        ] = await Promise.all([
            multiCall(
              BEP20ABI,
              cTokenList.map((address: string, _: number) => ({
                address: address,
                name: "balanceOf",
                params: [from],
              })),
              appState.web3,
              appState.chainId
            ),
            multiCall(
              BEP20ABI,
              cTokenList.map((address: string, _: number) => ({
                address: address,
                name: "decimals",
                params: [],
              })),
              appState.web3,
              appState.chainId
            ),
            multiCall(
              BEP20ABI,
              cTokenList.map((address: string, _: number) => ({
                address: address,
                name: "totalSupply",
                params: [],
              })),
              appState.web3,
              appState.chainId
            ),
            multiCall(
              BEP20ABI,
              listTokenAddress.map((address: string, index: number) => ({
                address: address,
                name: "balanceOf",
                params: [cTokenList[index]],
              })),
              appState.web3,
              appState.chainId
            ),
          ]);
        let walletForkedCompoundLPState = appState[mode].forkedCompoundLPState.get(entity_id);
        if (!walletForkedCompoundLPState) {
            throw new Error("WalletForkedCompoundLPState is not initialized");
        }

        for (let i = 0; i < listTokenAddress.length; i++){
            let cTokenData = {
                address: cTokenList[i].toString().toLowerCase(),
                balances: cTokenBalance[i].toString(),
                decimals: cTokenDecimal[i].toString(),
                totalSupply: cTokenTotalSupply[i].toString(),
                originToken: {
                    balances: originIncTokenBalance[i].toString(),
                }
            }
            walletForkedCompoundLPState.detailTokenInPool.set(listTokenAddress[i], {
                decimals: token[listTokenAddress[i]]["decimal"].toString(),
                cToken: cTokenData,
                maxLTV: token[listTokenAddress[i]]["risk"]["maxLTV"].toString(),
                liqThres: token[listTokenAddress[i]]["risk"]["liqThres"].toString(),
                price: token[listTokenAddress[i]]["price"].toString(),
            });
            console.log(cTokenData)
        }
        appState[mode].forkedCompoundLPState.set(entity_id, walletForkedCompoundLPState);
    return appState;
    } catch (err) {
        console.log(err);
        throw err;
    }
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
                detailTokenInPool: new Map<string, DetailTokenInPoolCompound>(),
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
            appState = await updateTokenDetailInOthersPoolsCompound(appState, from, entity_id);
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