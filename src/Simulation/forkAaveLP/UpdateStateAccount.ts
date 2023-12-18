import BEP20ABI from "../../abis/BEP20.json";
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress } from "../../utils/address";
import { getMode, multiCall } from "../../utils/helper";
import axios from "axios";
import { DetailTokenInPool, ForkedAave, TokenInPoolData, WalletForkedAaveLPState } from "../../State";
import { entity_ids_aave } from "./forkAaveLPConfig";


export async function updateForkAaveLPState(appState1: ApplicationState, entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {

        if (appState.forkAaveLPState.isFetch == false || force == true) {
        if (entity_ids_aave.some(x => x === entity_id)){
            let dataLendingPool = await getDataLendingByAxios(entity_id, "0x" + appState.chainId.toString(16));
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

async function updateTokenDetailInOthersPools(appState1: ApplicationState, _from: EthAddress, entity_id: string): Promise<ApplicationState> {
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
        let tTokenAddress: string;
        let dTokenAddress: string;
        let tTokenList = [] as Array<string>;
        let dTokenList = [] as Array<string>;      
        for (let i = 0; i < listTokenAddress.length; i++){
            tTokenAddress = token[listTokenAddress[i]]["tTokenAddress"].toString()
            dTokenAddress = token[listTokenAddress[i]]["debtTokenAddress"].toString()
            tTokenList.push(tTokenAddress)
            dTokenList.push(dTokenAddress)
        }
        let [tTokenBalance, tTokenDecimal, tTokenTotalSupply, originInTTokenBalance, dTokenBalance, dTokenDecimal, dTokenTotalSupply, originInDTokenBalance] = await Promise.all([
            multiCall(
              BEP20ABI,
              tTokenList.map((address: string, _: number) => ({
                address: address,
                name: "balanceOf",
                params: [from],
              })),
              appState.web3,
              appState.chainId
            ),
            multiCall(
              BEP20ABI,
              tTokenList.map((address: string, _: number) => ({
                address: address,
                name: "decimals",
                params: [],
              })),
              appState.web3,
              appState.chainId
            ),
            multiCall(
              BEP20ABI,
              tTokenList.map((address: string, _: number) => ({
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
                params: [tTokenList[index]],
              })),
              appState.web3,
              appState.chainId
            ),
            multiCall(
              BEP20ABI,
              dTokenList.map((address: string, _: number) => ({
                address: address,
                name: "balanceOf",
                params: [from],
              })),
              appState.web3,
              appState.chainId
            ),
            multiCall(
              BEP20ABI,
              dTokenList.map((address: string, _: number) => ({
                address: address,
                name: "decimals",
                params: [],
              })),
              appState.web3,
              appState.chainId
            ),
            multiCall(
              BEP20ABI,
              dTokenList.map((address: string, _: number) => ({
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
                params: [dTokenList[index]],
              })),
              appState.web3,
              appState.chainId
            ),
          ]);

        let walletForkedAaveLPState = appState[mode].forkedAaveLPState.get(entity_id);
        if (!walletForkedAaveLPState) {
            throw new Error("WalletForkedAaveLPState is not initialized");
        }

        for (let i = 0; i < listTokenAddress.length; i++){
            let tTokenData = {
                address: tTokenList[i].toString().toLowerCase(),
                balances: tTokenBalance[i].toString(),
                decimals: tTokenDecimal[i].toString(),
                totalSupply: tTokenTotalSupply[i].toString(),
                originToken: {
                  balances: originInTTokenBalance[i].toString(),
                }
              }
        
            let dTokenData = {
                address: dTokenList[i].toString().toLowerCase(),
                balances: dTokenBalance[i].toString(),
                decimals: dTokenDecimal[i].toString(),
                totalSupply: dTokenTotalSupply[i].toString(),
                originToken: {
                    balances: originInDTokenBalance[i].toString(),
                }
            }
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
    } catch (err) {
        console.log(err);
        throw err;
    }
}


export async function updateUserInForkAaveLPState(appState1: ApplicationState, _from: EthAddress , entity_id: string, force?: boolean): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        let mode = getMode(appState, _from);
        if (entity_ids_aave.some(x => x === entity_id)){
            let from = _from;
            let dataLendingByAxiosTramline = await getDataLendingByAxiosTramline(entity_id, "0x" + appState.chainId.toString(16), from);
            let dataLendingPool = await getDataUserByAxios(_from, entity_id, "0x" + appState.chainId.toString(16));
            let data: WalletForkedAaveLPState = {
                id: dataLendingPool["id"],
                address: dataLendingPool["address"],
                totalAssets: dataLendingPool["totalAssets"],
                totalClaimable: dataLendingPool["totalClaimable"],
                totalDebts: dataLendingPool["totalDebts"],
                dapps: dataLendingPool["dapps"],
                detailTokenInPool: new Map<string, DetailTokenInPool>(),
                healthFactor: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["healthFactor"],
                ltv: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["ltv"],
                currentLiquidationThreshold: dataLendingByAxiosTramline["accountPoolDataSlice"]["params"]["currentLiquidationThreshold"],
            }
            appState[mode].forkedAaveLPState.set(entity_id, data);
            appState = await updateTokenDetailInOthersPools(appState, _from, entity_id);
        }
    return appState;
    } catch (err) {
        console.log(err);
        throw err;
    }
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

async function getDataLendingByAxiosTramline(entity_id: string, chain: string, userAddress: EthAddress) {
    let url = `https://tramlines-backend.trava.finance/api/trava-station/lending-pool/detail?entity=${entity_id}&chainId=${chain}&userAddress=${userAddress}`
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