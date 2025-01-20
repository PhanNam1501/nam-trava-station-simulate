import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import ERC20Mock from "../../abis/ERC20Mock.json";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Address } from "ethereumjs-util";
import { uint256 } from "trava-station-sdk";
import NFTManager from "../../abis/NFTManager.json";
import AlgebraPool from "../../abis/AlgebraPool.json";
import { camelotv3statechange, globalstatechange, poolstatechange, ticklowerstatechange, tickupperstatechange } from "../../State/camelot_v3";
import tokenIds from "./tokenIds.json";
import { multiCall } from "../../utils/helper";
import * as fs from 'fs';
import { time } from "console";



export async function compute(owner: string, bottomTick: number, topTick: number): Promise<string> {
    const ownerBigInt = BigInt(owner);
    const key = (ownerBigInt << BigInt(24) | (BigInt(bottomTick) & BigInt(0xFFFFFF))) | (BigInt(topTick) & BigInt(0xFFFFFF));
    return key.toString(16).padStart(64, '0'); 
}

export async function updateCamelotV3State(appState1: ApplicationState , account: EthAddress,force?: boolean): Promise<ApplicationState> {
    const appState = {...appState1};
    
    let TokenIDs : string[][] = [];
    let Pools : string[][] = [];
    let TickLower : number[][] = [];
    let TickUpper : number[][] = [];
    for (let tokenId of tokenIds) {
        TokenIDs.push([tokenId.tokenId, tokenId.nftmanager]);
        Pools.push([tokenId.algebra_pool, tokenId.dataStorageOperator]);
    }

    const [positions, globalstate, totalfee0, totalfee1, liquidity] = await Promise.all([
        multiCall(
            NFTManager,
            TokenIDs.map((id: string[], index: number) => ({
                address: id[1],
                name: "positions",
                params: [id[0]],
            })),
            appState.web3,
            appState.chainId
        ), 
        multiCall(
            AlgebraPool,
            Pools.map((pools: string[], index: number) => ({
                address: pools[0],
                name: "globalState",
                params: [],
            })),
            appState.web3,
            appState.chainId
        ),
        multiCall(
            AlgebraPool,
            Pools.map((pools: string[], index: number) => ({
                address: pools[0],
                name: "totalFeeGrowth0Token",
                params: [],
            })),
            appState.web3,
            appState.chainId
        ),
        multiCall(
            AlgebraPool,
            Pools.map((pools: string[], index: number) => ({
                address: pools[0],
                name: "totalFeeGrowth1Token",
                params: [],
            })),
            appState.web3,
            appState.chainId
        ),
        multiCall(
            AlgebraPool,
            Pools.map((pools: string[], index: number) => ({
                address: pools[0],
                name: "liquidity",
                params: [],
            })),
            appState.web3,
            appState.chainId
        ),


    ]);

    const [tickLowers, tickUppers] = await Promise.all([
        multiCall(
            AlgebraPool,
            Pools.map((pools: string[], index: number) => ({
                address: pools[0],
                name: "ticks",
                params: [tokenIds[index].tickLower],
            })),
            appState.web3,
            appState.chainId
        ),

        multiCall(
            AlgebraPool,
            Pools.map((pools: string[], index: number) => ({
                address: pools[0],
                name: "ticks",
                params: [tokenIds[index].tickUpper],
            })),
            appState.web3,
            appState.chainId
        )
    ]);

    
    
    
    for (let i = 0; i < tokenIds.length; i++) {
        let nftaddress = tokenIds[i].nftmanager;
        if(!appState.camelotv3state.camelotv3state.has(nftaddress) || force) {
            let camelotv3State: camelotv3statechange = {
                nonce: positions[i].nonce,
                operator: positions[i].operator,
                token0: positions[i].token0,
                token1: positions[i].token1,
                tickLower: Number(positions[i].tickLower),
                tickUpper: Number(positions[i].tickUpper),
                liquidity: Number(positions[i].liquidity),
                feeGrowthInside0LastX128: Number(positions[i].feeGrowthInside0LastX128),
                feeGrowthInside1LastX128: Number(positions[i].feeGrowthInside1LastX128),
                tokensOwed0: Number(positions[i].tokensOwed0),
                tokensOwed1: Number(positions[i].tokensOwed1)
                
            }
            appState.camelotv3state.camelotv3state.set(nftaddress, camelotv3State);
            const positionKey = compute(tokenIds[i].owner, Number(positions[i].tickLower), Number(positions[i].tickUpper));
            console.log("position_Key", positionKey);
            
        }
    }

    for (let i = 0; i < Pools.length; i++) {
        let pooladdress = tokenIds[i].algebra_pool;
        if(!appState.camelotv3state.poolstate.has(pooladdress) || force) {
            let poolState: poolstatechange = {
                totalFeeGrowth0Token: Number(totalfee0[i]),
                totalFeeGrowth1Token: Number(totalfee1[i]),
                liquidity: Number(liquidity[i])                   
            }
            appState.camelotv3state.poolstate.set(pooladdress, poolState)
        }
    }

    for (let i = 0; i < tokenIds.length; i++) {
        let pooladdress = tokenIds[i].algebra_pool;
        if(!appState.camelotv3state.ticklowerstate.has(pooladdress) || force) {
            let tickLowerState: ticklowerstatechange = {
                liquidityTotal: Number(tickLowers[i].liquidityTotal),
                liquidityDelta: Number(tickLowers[i].liquidityDelta),
                outerFeeGrowth0Token: Number(tickLowers[i].outerFeeGrowth0Token),
                outerFeeGrowth1Token: Number(tickLowers[i].outerFeeGrowth1Token)         
            }
            appState.camelotv3state.ticklowerstate.set(pooladdress, tickLowerState);
        }
    }

    for (let i = 0; i < tokenIds.length; i++) {
        let pooladdress = tokenIds[i].algebra_pool;
        if(!appState.camelotv3state.tickupperstate.has(pooladdress) || force) {
            let tickUpperState: tickupperstatechange = {
                liquidityTotal: Number(tickUppers[i].liquidityTotal),
                liquidityDelta: Number(tickUppers[i].liquidityDelta),
                outerFeeGrowth0Token: Number(tickUppers[i].outerFeeGrowth0Token),
                outerFeeGrowth1Token: Number(tickUppers[i].outerFeeGrowth1Token)
            }
            appState.camelotv3state.tickupperstate.set(pooladdress, tickUpperState);
        }
    }

    for (let i = 0; i < Pools.length; i++) {
        let pooladdress = tokenIds[i].algebra_pool;
        if(!appState.camelotv3state.globalstate.has(pooladdress) || force) {
            let globalState: globalstatechange = {
                price: Number(globalstate[i].price),
                tick: Number(globalstate[i].tick),
                fee: Number(globalstate[i].fee),
                timepointIndex: Number(globalstate[i].timepointIndex),
                communityFeeToken0: Number(globalstate[i].communityFeeToken0),
                communityFeeToken1: Number(globalstate[i].communityFeeToken1),                        
            }
            appState.camelotv3state.globalstate.set(pooladdress, globalState);
            let countIndex = Number(globalstate[i].timepointIndex);
            const indexArray : number[] = [];
            for (let i = 0; i <= countIndex; i++) {
                indexArray.push(i);
            }
            const [timepoints] = await Promise.all([
                multiCall(
                    AlgebraPool,
                    indexArray.map((index: number) => ({
                        address: pooladdress,
                        name: "timepoints",
                        params: [indexArray[index]],
                    })),
                    appState.web3,
                    appState.chainId
                )
            ]);

            let timepointsArray: any[] = []; 
            for (let i = 0 ; i < timepoints.length; i++) {
                let hasError = false;
                let data = {
                    initialized: timepoints[i][0],
                    blockTimestamp: Number(timepoints[i][1]).toString(),
                    tickCumulative: Number(timepoints[i][2]).toString(),
                    secondsPerLiquidityCumulative: Number(timepoints[i][3]).toString(),
                    volatilityCumulative: Number(timepoints[i][4]).toString(),
                    averageTick: Number(timepoints[i][5]).toString(),
                    volumePerLiquidityCumulative: Number(timepoints[i][6]).toString()
                };
                timepointsArray.push(data); 
            }
            

            try {
                fs.writeFileSync('./src/Simulation/camelot_v3/timepoints.json', JSON.stringify(timepointsArray, null, 2)); // Ghi đồng bộ
                console.log('File has been written successfully');
            } catch (err) {
                console.error('Error writing to file', err);
            }

            // fs.readFile('src/Simulation/camelot_v3/timepoints.json', 'utf8', (err, data) => {
            //     if (err) {
            //         console.error('Error reading file:', err);
            //         return;
            //     }
            //     let jsonData: any[] = JSON.parse(data);
            //     const updatedJsonData: string = JSON.stringify(jsonData, null, 2); 

            //     fs.writeFile('src/Simulation/camelot_v3/timepoints.json', updatedJsonData, 'utf8', (err) => {
            //         if (err) {
            //             console.error('Error writing file:', err);
            //             return;
            //         }
            //         console.log('File has been updated successfully.');
            //     });
            // });

            let tickTable : any[] = [];
            // for (let i = 0 ; i < timepoints.length; i++) {
            //     let tickValue = Number(timepoints[i][5]) >> 8;
            //     if (!tickTable.includes(tickValue)) { 
            //         tickTable.push(tickValue);
            //     }
            // }
            for (let i = -2000 ; i < 0; i++) {
                tickTable.push(i);
            }

            

            let counter: any[] = [];
            for (let i = 0; i < tickTable.length; i++) {
                counter.push(i);
            }

            const [ticktable] = await Promise.all([
                multiCall(
                    AlgebraPool,
                    counter.map((index: number) => ({
                        address: pooladdress,
                        name: "tickTable",
                        params: [tickTable[index]],
                    })),
                    appState.web3,
                    appState.chainId
                )
            ]);

            const indexs : number[] = [];
            for (let i = 0; i <= 1999; i++) {
                indexs.push(i);
            }

            const tick_arr : any[] = [];
            let count = Number(timepoints[timepoints.length-1][5]);
            console.log(count);
            for (let i = count - 1000; i < count + 1000; i++) {
                tick_arr.push(i.toString());
            }

            const [tickarray] = await Promise.all([
                multiCall(
                    AlgebraPool,
                    indexs.map((index: number) => ({
                        address: pooladdress,
                        name: "ticks",
                        params: [tick_arr[index]],
                    })),
                    appState.web3,
                    appState.chainId
                )
            ]);

            let tickArrays : any[] = [];
            for (let i = 0; i < tickarray.length; i++) {
                let data1 = {
                    id : Number(tick_arr[i]).toString(),
                    liquidityTotal: Number(tickarray[i][0]).toString(),
                    liquidityDelta: Number(tickarray[i][1]).toString(),
                    outerFeeGrowth0Token: Number(tickarray[i][2]).toString(),
                    outerFeeGrowth1Token: Number(tickarray[i][3]).toString(),
                    outerTickCumulative: Number(tickarray[i][4]).toString(),
                    outerSecondsPerLiquidity: Number(tickarray[i][5]).toString(),
                    outerSecondsSpent: Number(tickarray[i][6]).toString(),
                    initialized: tickarray[i][7]
                };
                tickArrays.push(data1); 
            }
            
            try {
                fs.writeFileSync('./src/Simulation/camelot_v3/ticks.json', JSON.stringify(tickArrays, null, 2)); // Ghi đồng bộ
                console.log('File has been written successfully');
            } catch (err) {
                console.error('Error writing to file', err);
            }

            
            
            let tickTableArrays : any[] = [];
            for (let i = 0; i < ticktable.length; i++) {
                let data = {
                    wordPosition: Number(tickTable[i]).toString(),
                    value: Number(ticktable[i]).toString(),
                    
                };
                tickTableArrays.push(data); 
            }

            
            try {
                fs.writeFileSync('./src/Simulation/camelot_v3/tickTable.json', JSON.stringify(tickTableArrays, null, 2)); // Ghi đồng bộ
                console.log('File has been written successfully');
            } catch (err) {
                console.error('Error writing to file', err);
            }

            
            
        }
    }

    
    return appState;
}
