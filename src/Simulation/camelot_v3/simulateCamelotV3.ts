import { BigNumber } from "bignumber.js";
import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState} from "../../State/ApplicationState";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Contract, FeeDataNetworkPlugin } from "ethers";
import _, { at, lte, min, Primitive } from "lodash";
import { bnb, MAX_UINT256, percentMul, wadDiv } from "../../utils/config";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
import { updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserEthBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import { DetailTokenInPool } from "../../State/SmartWalletState";
import { getMode} from "../../utils/helper";
import { updateCamelotV3State } from "./update";
import { camelotv3state, camelotv3statechange, globalstatechange, poolstatechange, ticklowerstatechange, tickupperstatechange } from "../../State/camelot_v3";
import { updateTokenDetailInOthersPoolsCompound } from "../forkCompoundLP";
import ERC20Mock from "../../abis/ERC20Mock.json"; // Ensure ERC20Mock ABI is imported
import tokenIds from "./tokenIds.json";
import * as fs from 'fs';
import { json } from "stream/consumers";
import { aaveAsset } from "@zennomi/tokens";
import { log, timeEnd } from "console";
import { promisify } from 'util';
const writeFileAsync = promisify(fs.writeFile);
// import timepoints from "./timepoints.json";
const Window = BigNumber(86400);
const UINT16_MODULO = 65536;
const BASE_FEE = BigNumber(100);
const MIN_TICK = BigNumber(-887272);
const MAX_TICK = BigNumber(887272);
const COMMUNITY_FEE_DENOMINATOR = BigNumber(1000);
const Configuration : any[] = [
    BigNumber(3000).minus(BASE_FEE), // alpha1
    BigNumber(12000), // alpha2
    BigNumber(360), // beta1
    BigNumber(60000), // beta2
    BigNumber(59), // gamma1
    BigNumber(8500), // gamma2
    BigNumber(0), //volumeBeta
    BigNumber(10), //volumeGamma
    BASE_FEE //baseFee
];


export function roundUpBigNumber(value: BigNumber): BigNumber {
    return value.integerValue(BigNumber.ROUND_CEIL); 
}

export async function getSqriRatioAtTick (tick : number): Promise <number> {
   return Math.sqrt(1.0001 ** tick) * 2**96;
}

export async function getLiquidityForAmount(
    sqrtPriceX96: number,
    sqrtRatioAX96: number,
    sqrtRatioBX96: number,
    amount0Desired: BigNumber,
    amount1Desired: BigNumber
): Promise <BigNumber> { 
    let liquidity, liquidity0, liquidity1;
    if (sqrtRatioAX96 > sqrtRatioBX96) {
        const temp = sqrtRatioAX96;
        sqrtRatioAX96 = sqrtRatioBX96;
        sqrtRatioBX96 = temp;
    }
    if (sqrtPriceX96 <= sqrtRatioAX96) {
        liquidity = await getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0Desired);
    } else if (sqrtPriceX96 < sqrtRatioBX96) {
        liquidity0 = await getLiquidityForAmount0(sqrtPriceX96, sqrtRatioBX96, amount0Desired);
        liquidity1 = await getLiquidityForAmount1(sqrtRatioAX96, sqrtPriceX96, amount1Desired);
        if(liquidity0.isLessThan(liquidity1)) {
            liquidity = liquidity0;
        } else {
            liquidity = liquidity1;
        }
    } else {
        liquidity = await getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1Desired);
    }

    return liquidity;
}

export async function getLiquidityForAmount0(
    sqrtRatioAX96: number,
    sqrtRatioBX96: number,
    amount0: BigNumber
): Promise<BigNumber> {
    const Q96 = BigNumber(2).pow(96);
    const intermediate = BigNumber(sqrtRatioAX96).multipliedBy(BigNumber(sqrtRatioBX96)).dividedBy(Q96);
    const liquidity = BigNumber(amount0).multipliedBy(intermediate).dividedBy(BigNumber(sqrtRatioBX96).minus(BigNumber(sqrtRatioAX96)));
    return liquidity;
}

export async function getLiquidityForAmount1(
    sqrtRatioAX96: number,
    sqrtRatioBX96: number,
    amount1: BigNumber
): Promise<BigNumber> {
    const Q96 = BigNumber(2).pow(96);
    const liquidity = BigNumber(amount1).multipliedBy(Q96).dividedBy(BigNumber(sqrtRatioBX96).minus(BigNumber(sqrtRatioAX96)));
    return liquidity;
}

export async function _getAmountsForLiquidity(
    bottomTick: number,
    topTick: number,
    liquidityDelta: BigNumber,
    currentTick: number,
    currentPrice: number
): Promise<[BigNumber, BigNumber, BigNumber]> {
    let amount0, amount1, globalLiquidityDelta;
    if (currentTick < bottomTick) {
        let sqrtRatioAX96 = await getSqriRatioAtTick(bottomTick);
        let sqrtRatioBX96 = await getSqriRatioAtTick(topTick);
        amount0 = await getToken0Delta(sqrtRatioAX96, sqrtRatioBX96, liquidityDelta);
        amount1 = BigNumber(0);
        globalLiquidityDelta = BigNumber(0);
    } else if (currentTick < topTick) {
        let sqrtRatioAX96 = await getSqriRatioAtTick(bottomTick);
        let sqrtRatioBX96 = await getSqriRatioAtTick(topTick);
        amount0 = await getToken0Delta(currentPrice, sqrtRatioBX96, liquidityDelta);
        amount1 = await getToken1Delta(sqrtRatioAX96, currentPrice, liquidityDelta);
        globalLiquidityDelta = liquidityDelta;
    } else {
        let sqrtRatioAX96 = await getSqriRatioAtTick(bottomTick);
        let sqrtRatioBX96 = await getSqriRatioAtTick(topTick);
        amount1 = await getToken1Delta(sqrtRatioAX96, sqrtRatioBX96, liquidityDelta);
        amount0 = BigNumber(0);
        globalLiquidityDelta = BigNumber(0);
    }
    return [amount0, amount1, globalLiquidityDelta] ;
}

export async function _getToken0Delta(
    priceLower: number,
    priceUpper: number,
    liquidity: BigNumber,
    roundup: boolean
): Promise<BigNumber> {
    const priceDelta = BigNumber(priceUpper - priceLower);
    const liquidityShifted = liquidity.multipliedBy(BigNumber(2).pow(96));
    let tokenDelta;
    if (roundup) {
        let parameter = await roundUpBigNumber(priceDelta.multipliedBy(liquidityShifted).dividedBy(BigNumber(priceUpper)));
        tokenDelta = await roundUpBigNumber(parameter.dividedBy(priceLower));
    } else {
        let parameter = priceDelta.multipliedBy(liquidityShifted).dividedBy(BigNumber(priceUpper));
        tokenDelta = parameter.dividedBy(priceLower);
    }
    return tokenDelta;
}

export async function _getToken1Delta(
    priceLower: number,
    priceUpper: number,
    liquidity: BigNumber,
    roundup: boolean
): Promise<BigNumber> {
    const priceDelta = BigNumber(priceUpper - priceLower);
    const Q96 = BigNumber(2).pow(96);
    let tokenDelta;
    if (roundup) {
        tokenDelta = await roundUpBigNumber(priceDelta.multipliedBy(liquidity).dividedBy(Q96));
    } else {
        tokenDelta = priceDelta.multipliedBy(liquidity).dividedBy(Q96);
    }
    return tokenDelta;
}

export async function getToken0Delta(
    priceLower: number,
    priceUpper: number,
    liquidity: BigNumber
): Promise <BigNumber> {
    let tokenDelta;
    if (liquidity.isGreaterThan(0)) {
        tokenDelta = await _getToken0Delta(priceLower, priceUpper, liquidity, true);
    } else {
        tokenDelta = await _getToken0Delta(priceLower, priceUpper, liquidity.multipliedBy(-1), false);
        tokenDelta = tokenDelta.multipliedBy(-1);
    }
    return tokenDelta;
}
export async function getToken1Delta(
    priceLower: number,
    priceUpper: number,
    liquidity: BigNumber
): Promise <BigNumber> {
    let tokenDelta;
    if (liquidity.isGreaterThan(0)) {
        tokenDelta = await _getToken1Delta(priceLower, priceUpper, liquidity, true);
    } else {
        tokenDelta = await _getToken1Delta(priceLower, priceUpper, liquidity.multipliedBy(-1), false);
        tokenDelta = tokenDelta.multipliedBy(-1);
    }
    return tokenDelta;
}

export async function update(
    tick: number,
    currentTick: number,
    liquidityDelta: BigNumber,
    liquidityDeltaBefore: BigNumber,
    liquidityTotalBefore: BigNumber,
    totalFeeGrowth0Token: number,
    totalFeeGrowth1Token: number,
    outerFeeGrowth0Token: number,
    outerFeeGrowth1Token: number,
    upper: boolean
): Promise<[BigNumber, BigNumber, BigNumber, BigNumber, boolean]> {
    let liquidityTotalAfter, liquidityDeltaAfter;
    liquidityTotalAfter = liquidityTotalBefore.plus(liquidityDelta);
    if (upper) {
        liquidityDeltaAfter = liquidityDeltaBefore.minus(liquidityDelta);
    } else {
        liquidityDeltaAfter = liquidityDeltaBefore.plus(liquidityDelta);
    }
    let flipped = liquidityTotalAfter.isEqualTo(0);
    if (liquidityTotalBefore.isEqualTo(0)){
        flipped = !flipped;
        if (BigNumber(tick).isLessThan(BigNumber(currentTick))) {
            let outerFeeGrowth0Token = BigNumber(totalFeeGrowth0Token);
            let outerFeeGrowth1Token = BigNumber(totalFeeGrowth1Token);
            return [outerFeeGrowth0Token, outerFeeGrowth1Token, BigNumber(liquidityDeltaAfter), BigNumber(liquidityTotalAfter), flipped];
        }
    }
    return [BigNumber(outerFeeGrowth0Token), BigNumber(outerFeeGrowth1Token), BigNumber(liquidityDeltaAfter), BigNumber(liquidityTotalAfter), flipped];
    
}

export async function getInnerFeeGrowth(
    bottomTick: BigNumber,
    topTick: BigNumber,
    currentTick: BigNumber,
    totalFeeGrowth0Token: BigNumber,
    totalFeeGrowth1Token: BigNumber,
    lower_outerFeeGrowth0Token: BigNumber,
    lower_outerFeeGrowth1Token: BigNumber,
    upper_outerFeeGrowth0Token: BigNumber,
    upper_outerFeeGrowth1Token: BigNumber
): Promise<[BigNumber, BigNumber]> {
    let innerFeeGrowth0Token, innerFeeGrowth1Token;
    if (currentTick.isLessThan(topTick)) {
        if (currentTick.isGreaterThan(bottomTick)){
            innerFeeGrowth0Token = totalFeeGrowth0Token.minus(lower_outerFeeGrowth0Token);
            innerFeeGrowth1Token = totalFeeGrowth1Token.minus(lower_outerFeeGrowth1Token);
        } else {
            innerFeeGrowth0Token = lower_outerFeeGrowth0Token;
            innerFeeGrowth1Token = lower_outerFeeGrowth1Token;
        }
        innerFeeGrowth0Token.minus(upper_outerFeeGrowth0Token);
        innerFeeGrowth1Token.minus(upper_outerFeeGrowth1Token);
    } else {
        innerFeeGrowth0Token = upper_outerFeeGrowth0Token.minus(lower_outerFeeGrowth0Token);
        innerFeeGrowth1Token = upper_outerFeeGrowth1Token.minus(lower_outerFeeGrowth1Token);
    }
    return [innerFeeGrowth0Token, innerFeeGrowth1Token];
}

export async function lteConsideringOverflow(
    a: BigNumber,
    b: BigNumber,
    currentTime: BigNumber
): Promise<boolean> {
    let res = a.isGreaterThanOrEqualTo(currentTime);
    if (res == b.isGreaterThanOrEqualTo(currentTime)) {
        res = a.isLessThanOrEqualTo(b)
    }
    return res;
}

export async function getAverageTick(
    time: BigNumber,
    tick: BigNumber,
    index: number,
    oldestIndex: number,
    lastTimestamp: BigNumber,
    lastTickCumulative: BigNumber
): Promise<BigNumber> {
    let timepoints = require("./timepoints.json");
    let TimePoints : any[][] = [];
    for (let timepoint of timepoints) {
        TimePoints.push([timepoint.initialized, timepoint.blockTimestamp, timepoint.tickCumulative, timepoint.secondsPerLiquidityCumulative, timepoint.volatilityCumulative, timepoint.averageTick, timepoint.volumePerLiquidityCumulative]);
    }
    console.log(TimePoints.length);
    const oldestTimestamp = BigNumber(TimePoints[oldestIndex][1]);
    const oldestTickCumulative = BigNumber(TimePoints[oldestIndex][2]);

    if (await lteConsideringOverflow(oldestTimestamp, time.minus(Window), time)) {
        console.log("ll");
        if (await lteConsideringOverflow(lastTimestamp, time.minus(Window), time)) {
            let startTimepoint = TimePoints[index-1];   
            if (startTimepoint[0] == true) {
                return (lastTickCumulative.minus(BigNumber(startTimepoint[2]))).dividedBy(lastTimestamp.minus(BigNumber(startTimepoint[1])));
            } else {
                return tick;
            }
        } else {
            
            let startOfWindow = await getSingleTimepoint(time, Window, tick, index, oldestIndex, BigNumber(0));
            
            return (lastTickCumulative.minus(BigNumber(startOfWindow[2]))).dividedBy(lastTimestamp.minus(BigNumber(startOfWindow[1])));
        } 
    } else {
        console.log("kkk");
        if (lastTimestamp.isEqualTo(oldestTimestamp)) {
            return tick;
        } else {
            return (lastTickCumulative.minus(oldestTickCumulative)).dividedBy(lastTimestamp.minus(oldestTimestamp));
        }
    }

}

export async function volatilityOnRange(
    dt: BigNumber,
    tick0: BigNumber,
    tick1: BigNumber,
    avgTick0: BigNumber,
    avgTick1: BigNumber
): Promise<BigNumber> {
    let K = (tick1.minus(tick0)).minus(avgTick1.minus(avgTick0));
    let B = (tick0.minus(avgTick0)).multipliedBy(dt);
    let sumOfSquares = dt.multipliedBy(dt.plus(1)).multipliedBy((dt.multipliedBy(2)).plus(1));
    let sumOfSequence = dt.multipliedBy(dt.plus(1));
    let x = ((K.pow(2)).multipliedBy(sumOfSquares)).plus(B.multipliedBy(K).multipliedBy(sumOfSequence).multipliedBy(6)).plus(dt.multipliedBy(6).multipliedBy(B.pow(2)));
    let y = (dt.pow(2)).multipliedBy(6);
    return x.dividedBy(y);

}

export async function createNewTimepoint(
    last: any[],
    lastIndex: number,
    blockTimestamp: BigNumber,
    tick: BigNumber,
    prevTick: BigNumber,
    liquidity: BigNumber,
    averageTick: BigNumber,
    volumePerLiquidity: BigNumber
): Promise<any[]> {
    let delta = blockTimestamp.minus(last[1]);
    let last_initialized = true;
    let last_blockTimestamp = blockTimestamp;
    let last_tickCumulative = tick.multipliedBy(delta);
    let last_secondsPerLiquidityCumulative;
    if (liquidity.isGreaterThan(0)) {
        last_secondsPerLiquidityCumulative = BigNumber(last[3]).plus(delta.multipliedBy(BigNumber(2).pow(128)).dividedBy(liquidity));
    } else {
        last_secondsPerLiquidityCumulative = BigNumber(last[3]).plus(delta.multipliedBy(BigNumber(2).pow(128)));
    }
    let last_volatilityCumulative = BigNumber(last[4]).plus(await volatilityOnRange(delta, prevTick, tick, BigNumber(last[5]), averageTick));
    let last_averageTick = averageTick;
    let last_volumePerLiquidityCumulative = BigNumber(last[6]).plus(volumePerLiquidity);

    return [last_initialized, last_blockTimestamp.toString(), last_tickCumulative.toString(), last_secondsPerLiquidityCumulative.toString(), last_volatilityCumulative.toString(), last_averageTick.toString(), last_volumePerLiquidityCumulative.toString()];
}

export async function binarySearch(
    time: BigNumber,
    target: BigNumber,
    lastIndex: number,
    oldestIndex: number
): Promise<[any[], any[]]> {
    let left = oldestIndex;
    let right = lastIndex >= oldestIndex ? lastIndex : lastIndex + UINT16_MODULO; // newest timepoint considering one index overflow
    let current = (left + right) >> 1;
    let timepoints = require("./timepoints.json");
    
    let TimePoints : any[][] = [];
    for (let timepoint of timepoints) {
        TimePoints.push([timepoint.initialized, timepoint.blockTimestamp, timepoint.tickCumulative, timepoint.secondsPerLiquidityCumulative, timepoint.volatilityCumulative, timepoint.averageTick, timepoint.volumePerLiquidityCumulative]);
    }
    let beforeOrAt, atOrAfter;

    while(left < right) {
       
        beforeOrAt = TimePoints[current];
        let [initializedBefore, timestampBefore] = [beforeOrAt[0], BigNumber(beforeOrAt[1])];
        if (initializedBefore == true) {
        
            if (await lteConsideringOverflow(timestampBefore, target, time)) {
           
                atOrAfter = TimePoints[current+1];
                let [initializedAfter, timestampAfter] = [atOrAfter[0], BigNumber(atOrAfter[1])];
                if(initializedAfter == true) {
                    if (await lteConsideringOverflow(target, timestampAfter, time)) {
                        return [beforeOrAt, atOrAfter];
                    }
                    left = current + 1;
                } else {
                    return [beforeOrAt, beforeOrAt];
                }
            } else {
                right = current - 1;
            }
        } else {
            left = current + 1;
        }
        current = (left + right) >> 1;
       
    }
    

    return [[], []]


}

export async function getSingleTimepoint(
    time: BigNumber,
    secondsAgo: BigNumber,
    tick: BigNumber,
    index: number,
    oldestIndex: number,
    liquidity: BigNumber
): Promise<any[]> {
    let timepoints = require("./timepoints.json");
    const target = time.minus(secondsAgo);
    let TimePoints : any[][] = [];
    for (let timepoint of timepoints) {
        TimePoints.push([timepoint.initialized, timepoint.blockTimestamp, timepoint.tickCumulative, timepoint.secondsPerLiquidityCumulative, timepoint.volatilityCumulative, timepoint.averageTick, timepoint.volumePerLiquidityCumulative]);
    }
    console.log("len", TimePoints.length);

    if (secondsAgo.isEqualTo(0) || await lteConsideringOverflow(BigNumber(TimePoints[index][1]), target, time)) {
        console.log("GGGG");
        let last = TimePoints[index];
        console.log(last);
        if (BigNumber(last[1]).isEqualTo(target)) {
            console.log("kk");
            return last;
        } else {
            console.log("uu");
            let avgTick = await getAverageTick(time, tick, index, oldestIndex, BigNumber(last[1]), BigNumber(last[2]));
            console.log("III");
            let prevTick = tick;
            if (index != oldestIndex) {
                let prevLast = TimePoints[index - 1];
                prevTick = (BigNumber(last[2]).minus(BigNumber(prevLast[2]))).dividedBy(BigNumber(last[1]).minus(BigNumber(prevLast[1])));
            }
            let result = await createNewTimepoint(last, index, target, tick, prevTick, liquidity, avgTick, BigNumber(0));
            return result;
        }
    }

    let [beforeOrAt, atOrAfter] = await binarySearch(time, target, index, oldestIndex);
    if (target.isEqualTo(BigNumber(atOrAfter[1]))) {
        return atOrAfter;
    } 
    if (!target.isEqualTo(BigNumber(beforeOrAt[1]))) {
        let timepointTimeDelta = BigNumber(atOrAfter[1]).minus(BigNumber(beforeOrAt[1]));
        let targetDelta = target.minus(BigNumber(beforeOrAt[1]));
        let beforeOrAt_tickCumulative = BigNumber(beforeOrAt[2]).plus((BigNumber(atOrAfter[2]).minus(BigNumber(beforeOrAt[2]))).dividedBy(timepointTimeDelta).multipliedBy(targetDelta));
        let beforeOrAt_secondsPerLiquidityCumulative = BigNumber(beforeOrAt[3]).plus((BigNumber(atOrAfter[3]).minus(BigNumber(beforeOrAt[3]))).multipliedBy(targetDelta).dividedBy(timepointTimeDelta));
        let beforeOrAt_volatilityCumulative = BigNumber(beforeOrAt[4]).plus((BigNumber(atOrAfter[4]).minus(BigNumber(beforeOrAt[4]))).dividedBy(timepointTimeDelta).multipliedBy(targetDelta));
        let beforeOrAt_volumePerLiquidityCumulative = BigNumber(beforeOrAt[6]).plus(BigNumber(atOrAfter[6]).minus(BigNumber(beforeOrAt[6])).dividedBy(timepointTimeDelta).multipliedBy(targetDelta));
        return [beforeOrAt[0], beforeOrAt[1], beforeOrAt_tickCumulative.toString(), beforeOrAt_secondsPerLiquidityCumulative.toString(), beforeOrAt_volatilityCumulative.toString(), beforeOrAt[5], beforeOrAt_volumePerLiquidityCumulative.toString()]
    }

    return beforeOrAt;

}


export async function writeTimepoint(
    index: number,
    blockTimestamp: BigNumber,
    tick: BigNumber,
    liquidity: BigNumber,
    volumePerLiquidity: BigNumber
): Promise<number> {
    let timepoints = require("./timepoints.json");
    let TimePoints : any[][] = [];
    for (let timepoint of timepoints) {
        TimePoints.push([timepoint.initialized, timepoint.blockTimestamp, timepoint.tickCumulative, timepoint.secondsPerLiquidityCumulative, timepoint.volatilityCumulative, timepoint.averageTick, timepoint.volumePerLiquidityCumulative]);
    }
    let oldTimePoints = timepoints.length;
    let oldestIndex = 0;
    let indexUpdated = index + 1;
    let last = TimePoints[index];
    let avgTick = await getAverageTick(blockTimestamp, tick, index, oldestIndex, BigNumber(last[1]), BigNumber(last[2]));
    let prevTick = tick;
    if (index != oldestIndex) {
        let prevLast = TimePoints[index - 1];
        prevTick = (BigNumber(last[2]).minus(BigNumber(prevLast[2]))).dividedBy(BigNumber(last[1]).minus(BigNumber(prevLast[1])));
    }

    let newTimepoint : any[] = [];
    newTimepoint = await createNewTimepoint(last, index, blockTimestamp, tick, prevTick, liquidity, avgTick, volumePerLiquidity);
    fs.readFile('src/Simulation/camelot_v3/timepoints.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        let jsonData: any[] = JSON.parse(data);
        
        const newData = {
            initialized: newTimepoint[0], 
            blockTimestamp: newTimepoint[1], 
            tickCumulative: newTimepoint[2],
            secondsPerLiquidityCumulative: newTimepoint[3],
            volatilityCumulative: newTimepoint[4],
            averageTick: newTimepoint[5],
            volumePerLiquidityCumulative: newTimepoint[6]
        };

        jsonData.push(newData); 

        const updatedJsonData: string = JSON.stringify(jsonData, null, 2); 

        fs.writeFile('src/Simulation/camelot_v3/timepoints.json', updatedJsonData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('File has been updated successfully.');
        });

        fs.writeFile('src/Simulation/camelot_v3/temp_timepoints.json', updatedJsonData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('File has been updated successfully.');
        });
    });
    

    return indexUpdated;
}   

export async function getAverages(
    time: BigNumber,
    tick: BigNumber,
    index: number,
    liquidity: BigNumber
) : Promise<[BigNumber, BigNumber]>{
    delete require.cache[require.resolve("./timepoints.json")];
    let timepoints = require("./timepoints.json");
    let TimePoints : any[][] = [];
    for (let timepoint of timepoints) {
        TimePoints.push([timepoint.initialized, timepoint.blockTimestamp, timepoint.tickCumulative, timepoint.secondsPerLiquidityCumulative, timepoint.volatilityCumulative, timepoint.averageTick, timepoint.volumePerLiquidityCumulative]);
    }
    let oldest = TimePoints[0];
    let oldestIndex = 0;
    const endOfWindow = await getSingleTimepoint(time, BigNumber(0), tick, index, oldestIndex, liquidity);
    console.log("EEEE");
    let oldestTimestamp = BigNumber(oldest[1]);
    if (await lteConsideringOverflow(oldestTimestamp, time.minus(Window), time)) {
        let startOfWindow = await getSingleTimepoint(time, Window, tick, index, oldestIndex, liquidity);
        let volatilityAverage = (BigNumber(endOfWindow[4]).minus(BigNumber(startOfWindow[4]))).dividedBy(Window);
        let volumePerLiqAverage = (BigNumber(endOfWindow[6]).minus(BigNumber(startOfWindow[6]))).dividedBy(BigNumber(2).pow(57));
        return [volatilityAverage, volumePerLiqAverage];
        
    } else if (!time.isEqualTo(oldestTimestamp)) {
        let _oldestVolatilityCumulative = BigNumber(oldest[4]);
        let _oldestVolumePerLiquidityCumulative = BigNumber(oldest[6]);
        let volatilityAverage = (BigNumber(endOfWindow[4]).minus(_oldestVolatilityCumulative)).dividedBy(time.minus(oldestTimestamp));
        let volumePerLiqAverage = (BigNumber(endOfWindow[6]).minus(_oldestVolumePerLiquidityCumulative)).dividedBy(BigNumber(2).pow(57));
        return [volatilityAverage, volumePerLiqAverage];
    } 
    return [BigNumber(0), BigNumber(0)];

}
export async function exp(
    x: BigNumber,
    g: BigNumber,
    gHighestDegree: BigNumber
): Promise<BigNumber> {
    let xLowestDegree = x;
    let res = gHighestDegree; // g**8

    gHighestDegree = gHighestDegree.dividedBy(g); // g**7
    res = res.plus(xLowestDegree.multipliedBy(gHighestDegree));

    gHighestDegree = gHighestDegree.dividedBy(g); // g**6
    xLowestDegree = xLowestDegree.multipliedBy(x);
    res = res.plus((xLowestDegree.multipliedBy(gHighestDegree)).dividedBy(2));

    gHighestDegree = gHighestDegree.dividedBy(g); // g**5
    xLowestDegree = xLowestDegree.multipliedBy(x);
    res = res.plus((xLowestDegree.multipliedBy(gHighestDegree)).dividedBy(6));

    gHighestDegree = gHighestDegree.dividedBy(g); // g**4
    xLowestDegree = xLowestDegree.multipliedBy(x);
    res = res.plus((xLowestDegree.multipliedBy(gHighestDegree)).dividedBy(24));

    gHighestDegree = gHighestDegree.dividedBy(g); // g**3
    xLowestDegree = xLowestDegree.multipliedBy(x);
    res = res.plus((xLowestDegree.multipliedBy(gHighestDegree)).dividedBy(120));

    gHighestDegree = gHighestDegree.dividedBy(g); // g**2
    xLowestDegree = xLowestDegree.multipliedBy(x);
    res = res.plus((xLowestDegree.multipliedBy(gHighestDegree)).dividedBy(720));

    xLowestDegree = xLowestDegree.multipliedBy(x); // x**7
    res = res.plus(((xLowestDegree.multipliedBy(g)).dividedBy(5040)).plus(xLowestDegree.multipliedBy(x)).dividedBy(40320));

    return res;
}

export async function sigmoid(
    x: BigNumber,
    g: BigNumber,
    alpha: BigNumber,
    beta: BigNumber
): Promise<BigNumber>{
    if (x.isGreaterThan(beta)) {
        x = x.minus(beta);
        if (x.isGreaterThanOrEqualTo(g.multipliedBy(6))) {
            return alpha;
        } 
        let g8 = g.pow(8);
        let ex = await exp(x, g, g8);
        let res = (alpha.multipliedBy(g8)).dividedBy(g8.plus(ex));
        return res;
    } else {
        x = beta.minus(x);
        if (x.isGreaterThanOrEqualTo(g.multipliedBy(6))) {
            return BigNumber(0);
        } 
        let g8 = g.pow(8);
        let _exp = await exp(x, g, g8);
        let ex = _exp.plus(g8);
        let res = (alpha.multipliedBy(g8)).dividedBy(ex);
        return res;

    }
}

export async function getFee(
    volatility: BigNumber,
    volumePerLiquidity: BigNumber
): Promise<BigNumber> {
    let sum1 = await sigmoid(volatility, Configuration[4], Configuration[0], Configuration[2]);
    let sum2 = await sigmoid(volatility, Configuration[5], Configuration[1], Configuration[3]);
    let sumOfSigmoids = sum1.plus(sum2);

    if (sumOfSigmoids.isGreaterThan(BigNumber(MAX_UINT256))) {
        sumOfSigmoids = BigNumber(MAX_UINT256);
    }
    let more_fee = await sigmoid(volumePerLiquidity, Configuration[7], sumOfSigmoids.integerValue(BigNumber.ROUND_DOWN), Configuration[6]);
    return (BASE_FEE.plus(more_fee)).integerValue(BigNumber.ROUND_DOWN);
}

export async function getNewFee(
    time: BigNumber,
    tick: BigNumber,
    index: number,
    liquidity: BigNumber
): Promise<BigNumber> {
    let [volatilityAverage, volumePerLiqAverage] = await getAverages(time, tick, index, liquidity);
    console.log("CCCCC")
    let fee = await getFee(volatilityAverage.dividedBy(15), volumePerLiqAverage);
    return fee;
}

export async function find_value_tick(
    wordPosition: BigNumber
): Promise<BigNumber> {
    let ticktable = require("./tickTable.json");
    let tickTable : any[][] = [];
    for (let tick of ticktable) {
        tickTable.push([tick.wordPosition, tick.value]);
    }
    for (let i = 0; i < tickTable.length; i++) {
        if (BigNumber(tickTable[i][0]).isEqualTo(wordPosition)) {
            return BigNumber(tickTable[i][1]);
        }
    } 
    return BigNumber(0);
}

export async function getSingleSignificantBit(
    wordValue: number
): Promise<number> {
    let singleBitPos = 0;

    if ((wordValue & 0x5555555555555555) === 0) singleBitPos |= 1 << 0; // 0
    if ((wordValue & 0xFFFFFFFFFFFFFFFF) === 0) singleBitPos |= 1 << 7; // 1
    if ((wordValue & 0x0000FFFFFFFF0000) === 0) singleBitPos |= 1 << 6; // 2
    if ((wordValue & 0x00000000FFFFFFFF) === 0) singleBitPos |= 1 << 5; // 3
    if ((wordValue & 0x0000FFFF0000FFFF) === 0) singleBitPos |= 1 << 4; // 4
    if ((wordValue & 0x00FF00FF00FF00FF) === 0) singleBitPos |= 1 << 3; // 5
    if ((wordValue & 0x0F0F0F0F0F0F0F0F) === 0) singleBitPos |= 1 << 2; // 6
    if ((wordValue & 0x3333333333333333) === 0) singleBitPos |= 1 << 1; // 7

    return singleBitPos;
}

export async function getMostSignificantBit(
    word: BigNumber
): Promise<BigNumber> {
    let _word = word.toNumber();
    _word |= _word >> 1;
    _word |= _word >> 2;
    _word |= _word >> 4;
    _word |= _word >> 8;
    _word |= _word >> 16;
    _word |= _word >> 32;
    _word |= _word >> 64;
    _word |= _word >> 128;

    _word = _word - (_word >> 1);

    let mostBitPos = BigNumber(await getSingleSignificantBit(_word));
    return mostBitPos;
}

export async function boundTick(
    tick: BigNumber
): Promise<BigNumber> {
    let boundedTick = tick;
    if (boundedTick.isLessThan(MIN_TICK)) {
        boundedTick = MIN_TICK;
    } else if (boundedTick.isGreaterThan(MAX_TICK)) {
        boundedTick = MAX_TICK;
    }
    return boundedTick;
}

export async function nextTickInTheSameRow(
    tick: BigNumber,
    lte: boolean
): Promise <[BigNumber, boolean]> {
    let ticktable = require("./tickTable.json");
    let tickTable : any[][] = [];
    for (let tick of ticktable) {
        tickTable.push([tick.wordPosition, tick.value]);
    }
    if (lte) {
        let bitNumber = tick.modulo(256).plus(256);
        let rowNumber = tick.dividedBy(BigNumber(2).pow(8));
        console.log(bitNumber.toString())

        let _value = await find_value_tick(rowNumber);
        let _row = (_value.multipliedBy(BigNumber(2).pow(BigNumber(255).minus(bitNumber)))).integerValue();
        console.log(_row.toString());
        if (!_row.isEqualTo(0)) {
            let val1 = await getMostSignificantBit(_row);
            tick = (tick.minus(BigNumber(255).minus(val1))).integerValue();
            return [await boundTick(tick), true];
        } else {
            tick = (tick.minus(bitNumber)).integerValue();
            return [await boundTick(tick), false];
        }
    } else {
        tick = tick.plus(1);
        let bitNumber = tick.modulo(256);
        let rowNumber = tick.dividedBy(BigNumber(2).pow(8));

        let _value = await find_value_tick(rowNumber);
        let _row = (_value.multipliedBy(BigNumber(2).pow(bitNumber))).integerValue();

        if (!_row.isEqualTo(0)) {
            let _row1 = _row.toNumber();
            let val2 = BigNumber(await getSingleSignificantBit(- _row1 & _row1)).integerValue();
            tick = tick.plus(val2);
            return [await boundTick(tick), true];
        } else {
            tick = BigNumber(tick.plus(BigNumber(255).minus(bitNumber))).integerValue();
            return [await boundTick(tick), false];
        }
    }

}

export async function mulDiv(
    a: BigNumber,
    b: BigNumber,
    denominator: BigNumber
): Promise<BigNumber> {
    let prod0 = a.multipliedBy(b);
    let prod1;
    let result;
    let mm = a.multipliedBy(b);
    prod1 = (mm.minus(prod0)).minus(mm.isLessThan(prod0) ? 1 : 0);
    if (prod1.isEqualTo(0)) {
        result = (prod0.dividedBy(denominator)).integerValue();
        return result;
    }
    let remainder = (a.multipliedBy(b)).mod(denominator);
    prod1 = prod1.minus(remainder.isGreaterThan(prod0) ? 1 : 0);
    prod0 = prod0.minus(denominator);

    let _denominator = denominator.toNumber();
    let twos = - _denominator & _denominator;
    denominator = denominator.dividedBy(twos);
    prod0 = prod0.dividedBy(twos);

    let _prod0 = prod0.toNumber();
    let _prod1 = prod1.toNumber();

    _prod0 |= _prod0 * twos;
    prod0 = BigNumber(_prod0);
    let inv = (denominator.multipliedBy(3)).pow(2);
    inv = inv.multipliedBy(BigNumber(2).minus(denominator.multipliedBy(inv)));
    inv = inv.multipliedBy(BigNumber(2).minus(denominator.multipliedBy(inv)));
    inv = inv.multipliedBy(BigNumber(2).minus(denominator.multipliedBy(inv)));
    inv = inv.multipliedBy(BigNumber(2).minus(denominator.multipliedBy(inv)));
    inv = inv.multipliedBy(BigNumber(2).minus(denominator.multipliedBy(inv)));
    inv = inv.multipliedBy(BigNumber(2).minus(denominator.multipliedBy(inv)));

    result = (prod0.multipliedBy(inv)).integerValue();
    return result;
}

export async function mulDivRoundingUp(
    a: BigNumber,
    b: BigNumber,
    denominator: BigNumber
): Promise<BigNumber> {
    let result: BigNumber;

    result = a.multipliedBy(b).integerValue();
    if (a.isEqualTo(0) || result.dividedBy(a).isEqualTo(b)) {
        if (denominator.isLessThan(0)) throw new Error("Denominator must be greater than 0");
        result = (result.dividedBy(denominator)).plus(result.mod(denominator).isGreaterThan(0) ? 1: 0).integerValue();
    } else {
        result = await mulDiv(a, b, denominator);
        if ((a.multipliedBy(b)).mod(denominator)) {
            result = result.plus(1);
        }
    }
    result = result.integerValue();
    return result;
}

export async function divRoundingUp(
    x: BigNumber,
    y: BigNumber
): Promise<BigNumber> {
    let z: BigNumber;
    z = (x.dividedBy(y)).plus((x.mod(y)).isGreaterThan(0) ? 1 : 0).integerValue();
    return z;
}

export async function getNewPrice(
    price: BigNumber,
    liquidity: BigNumber,
    amount: BigNumber,
    zeroToOne: boolean,
    fromInput: boolean
): Promise<BigNumber> {
    if (zeroToOne == fromInput) {
        if (amount.isEqualTo(0)) return price;
        let liquidityShifted = liquidity.multipliedBy(BigNumber(2).pow(96));

        if (fromInput) {
            let product;
            product = amount.multipliedBy(price);
            if (product.dividedBy(amount).isEqualTo(price)) {
                let denominator = liquidityShifted.plus(product);
                if (denominator.isGreaterThanOrEqualTo(liquidityShifted)) {
                    return (await mulDivRoundingUp(liquidityShifted, price, denominator)).integerValue();
                }
            }
            return (await divRoundingUp(liquidityShifted, (liquidityShifted.dividedBy(price)).plus(amount))).integerValue();
        } else {
            let product;
            product = amount.multipliedBy(price);
            return (await mulDivRoundingUp(liquidityShifted, price, liquidityShifted.minus(product))).integerValue();
        }
        
    } else {
        if (fromInput) {
            return amount.multipliedBy(BigNumber(2).pow(96)).dividedBy(liquidity);
        } else {
            let quotient = await mulDivRoundingUp(amount, BigNumber(2).pow(96), liquidity);
            return (price.minus(quotient)).integerValue();
        }
    }
}

export async function getNewPriceAfterInput(
    price: BigNumber,
    liquidity: BigNumber,
    input: BigNumber,
    zeroToOne: boolean
): Promise<BigNumber> {
    return await getNewPrice(price, liquidity, input, zeroToOne, true);
}

export async function getNewPriceAfterOutput(
    price: BigNumber,
    liquidity: BigNumber,
    output: BigNumber,
    zeroToOne: boolean
): Promise<BigNumber> {
    return await getNewPrice(price, liquidity, output, zeroToOne, false);
}

export async function getTokenADelta01(
    to: BigNumber,
    from: BigNumber,
    liquidity: BigNumber
): Promise<BigNumber> {
    let _to = to.toNumber();
    let _from = from.toNumber();
    return (await _getToken0Delta(_to, _from, liquidity, true)).integerValue();
}

export async function getTOkenADelta10(
    to: BigNumber,
    from: BigNumber,
    liquidity: BigNumber
): Promise<BigNumber> {
    let _to = to.toNumber();
    let _from = from.toNumber();
    return (await _getToken1Delta(_from, _to, liquidity, true)).integerValue();
}

export async function getTokenBDelta01(
    to: BigNumber,
    from: BigNumber,
    liquidity: BigNumber
): Promise<BigNumber> {
    let _to = to.toNumber();
    let _from = from.toNumber();
    return (await _getToken1Delta(_to, _from, liquidity, false)).integerValue();
}

export async function getTokenBDelta10(
    to: BigNumber,
    from: BigNumber,
    liquidity: BigNumber
): Promise<BigNumber> {
    let _to = to.toNumber();
    let _from = from.toNumber();
    return (await _getToken0Delta(_from, _to, liquidity, false)).integerValue();
}

export async function getAmountA(
    to: BigNumber,
    from: BigNumber,
    liquidity: BigNumber,
    zeroToOne: boolean
): Promise<BigNumber> {
    if (zeroToOne) {
        return await getTokenADelta01(to, from, liquidity);
    } else {
        return await getTOkenADelta10(to, from, liquidity);
    }
}

export async function getAmountB(
    to: BigNumber,
    from: BigNumber,
    liquidity: BigNumber,
    zeroToOne: boolean
): Promise<BigNumber> {
    if (zeroToOne) {
        return await getTokenBDelta01(to, from, liquidity);
    } else {
        return await getTokenBDelta10(to, from, liquidity);
    }
}

export async function movePriceTowardsTarget(
    zeroToOne: boolean,
    currentPrice: BigNumber,
    targetPrice: BigNumber,
    liquidity: BigNumber,
    amountAvailable: BigNumber,
    fee: BigNumber
): Promise<[BigNumber, BigNumber, BigNumber, BigNumber]> {
    let resultPrice, input, output, feeAmount;
    if (amountAvailable.isGreaterThanOrEqualTo(0)){
        let amountAvailableAfterFee = await mulDiv(amountAvailable.integerValue(), BigNumber(1000000).minus(fee), BigNumber(1000000));
        input = await getAmountA(targetPrice, currentPrice, liquidity, zeroToOne);
        if (amountAvailableAfterFee.isGreaterThanOrEqualTo(input)) {
            resultPrice = targetPrice;
            feeAmount = await mulDivRoundingUp(input, fee, BigNumber(1000000).minus(fee));
        } else {
            resultPrice = await getNewPriceAfterInput(currentPrice, liquidity, amountAvailableAfterFee, zeroToOne);
            if (!targetPrice.isEqualTo(resultPrice)) {
                input = await getAmountA(resultPrice, currentPrice, liquidity, zeroToOne);
                feeAmount = amountAvailable.integerValue().minus(input);
            } else {
                feeAmount = await mulDivRoundingUp(input, fee, BigNumber(1000000).minus(fee))
            }
        }
        output = await getAmountB(resultPrice, currentPrice, liquidity, zeroToOne);
    } else {
        output = await getAmountB(targetPrice, currentPrice, liquidity, zeroToOne);
        amountAvailable = amountAvailable.multipliedBy(-1);
        if(amountAvailable.integerValue().isGreaterThanOrEqualTo(output)) {
            resultPrice = targetPrice;
        } else {
            resultPrice = await getNewPriceAfterOutput(currentPrice, liquidity, amountAvailable.integerValue(), zeroToOne);
            if (!targetPrice.isEqualTo(resultPrice)) {
                output = await getAmountB(resultPrice, currentPrice, liquidity, zeroToOne);
            }
            if (output.isGreaterThan(amountAvailable.integerValue())) {
                output = amountAvailable.integerValue()
            }
        }
        input = await getAmountA(resultPrice, currentPrice, liquidity, zeroToOne);
        feeAmount = await mulDivRoundingUp(input, fee, BigNumber(1000000).minus(fee));
    }
    return [resultPrice, input, output, feeAmount];
}

// export async function cross(
//     tick: BigNumber
// )

export async function cross(
    tick: BigNumber,
    totalFeeGrowth0Token: BigNumber,
    totalFeeGrowth1Token: BigNumber,
    secondsPerLiquidityCumulative: BigNumber,
    tickCumulative: BigNumber,
    time: BigNumber
): Promise<BigNumber> {
    let Ticks = require("./tickTable.json");
    let ticks : any[][] = [];
    for (let tick of Ticks) {
        ticks.push([tick.id, tick.liquidityTotal, tick.liquidityDelta, tick.outerFeeGrowth0Token, tick.outerFeeGrowth1Token, tick.outerTickCumulative, tick.outerSecondsPerLiquidity, tick.outerSecondsSpent, tick.initialized]);
    }
    let data: any[] | undefined; // Define the type for data
let index: number;
    for (let i = 0; i < ticks.length; i++) {
        if (tick.isEqualTo(BigNumber(ticks[i][0]))) {
            data = ticks[i];
            index = i;
        }
    }
    if (data) {
        let data_outerSecondsSpent = time.minus(BigNumber(data[7]));
        let data_outerSecondsPerLiquidity = secondsPerLiquidityCumulative.minus(BigNumber(data[6]));
        let data_outerTickCumulative = tickCumulative.minus(BigNumber(data[5]));
        let data_outerFeeGrowth1Token = totalFeeGrowth1Token.minus(BigNumber(data[4]));
        let data_outerFeeGrowth0Token = totalFeeGrowth0Token.minus(BigNumber(data[3]));
        fs.readFile('src/Simulation/camelot_v3/ticks.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return BigNumber(0);
            }
            let jsonData: any[] = JSON.parse(data);
            const newData = {
                id: ticks[index][0],
                liquidityTotal: ticks[index][0],
                liquidityDelta: ticks[index][0],
                outerFeeGrowth0Token: data_outerFeeGrowth0Token.toString(),
                outerFeeGrowth1Token: data_outerFeeGrowth1Token.toString(),
                outerTickCumulative: data_outerTickCumulative.toString(),
                outerSecondsPerLiquidity: data_outerSecondsPerLiquidity.toString(),
                outerSecondsSpent: data_outerSecondsSpent.toString(),
                initialized: false
            };
            jsonData[index] = newData; 
            
            const updatedJsonData: string = JSON.stringify(jsonData, null, 2);
            fs.writeFile('src/Simulation/camelot_v3/ticks.json', updatedJsonData, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    return BigNumber(0);
                }
                console.log('File has been updated successfully.');
            });
        });

        return BigNumber(data[2]);
    } else {
        return BigNumber(0);
    }

}

export async function getTickAtSqrtRatio(
    price: number
): Promise<number> {
    price = price / 2**96;
    let price2 = price ** 2;
    let base = 1.0001;
    let logX = Math.log(price2);
    let logBase = Math.log(base);
    let tick = Math.round(logX/logBase);
    return tick;
}

export async function calculateVolumePerLiquidity(
    liquidity: BigNumber,
    _amount0: BigNumber,
    _amount1: BigNumber
): Promise<BigNumber> {
    let amount0 = _amount0.isLessThan(0) ? _amount0.multipliedBy(-1) : _amount0;
    let amount1 = _amount1.isLessThan(0) ? _amount1.multipliedBy(-1) : _amount1;
    let volume = amount0.pow(2).multipliedBy(amount1.pow(2));
    let volumeShifted = BigNumber(0);
    if (volume.isGreaterThanOrEqualTo(BigNumber(2).pow(192))) {
        volumeShifted = BigNumber(MAX_UINT256).dividedBy(liquidity.isGreaterThan(0) ? liquidity : BigNumber(1));
    } else {
        volumeShifted = (volume.multipliedBy(BigNumber(2).pow(64))).dividedBy(liquidity.isGreaterThan(0) ? liquidity : BigNumber(1));
    }
    if (volumeShifted.isGreaterThanOrEqualTo(BigNumber(100000).multipliedBy(BigNumber(2).pow(64)))) {
        return BigNumber(100000).multipliedBy(BigNumber(2).pow(64));
    } else {
        return volumeShifted.integerValue();
    }

}

export async function _calculateSwapAndLock(
    zeroToOne: boolean,
    amountRequired: BigNumber,
    limitSqrtPrice: BigNumber,
    globalState_price: BigNumber,
    globalState_tick: BigNumber,
    globalState_fee: BigNumber,
    globalState_timepointIndex: number,
    globalState_communityFeeToken0: BigNumber,
    globalState_communityFeeToken1: BigNumber,
    liquidity: BigNumber,
    volumePerLiquidityInBlock: BigNumber,
    totalFeeGrowth0Token: BigNumber,
    totalFeeGrowth1Token: BigNumber
): Promise<[BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, number, BigNumber, BigNumber, BigNumber, BigNumber]> {
    let timepoints = require("./timepoints.json");
    let TimePoints : any[][] = [];
    for (let timepoint of timepoints) {
        TimePoints.push([timepoint.initialized, timepoint.blockTimestamp, timepoint.tickCumulative, timepoint.secondsPerLiquidityCumulative, timepoint.volatilityCumulative, timepoint.averageTick, timepoint.volumePerLiquidityCumulative]);
    }

    let communityFeeAmount = BigNumber(0);
    let currentPrice = globalState_price;
    let currentTick = globalState_tick;
    let cache_fee = globalState_fee;
    let cache_timepointIndex = globalState_timepointIndex;
    let _communityFeeToken0 = globalState_communityFeeToken0;
    let _communityFeeToken1 = globalState_communityFeeToken1;

    console.log("oldindex: ", cache_timepointIndex);
    
    let cache_amountRequiredInitial = amountRequired;
    let cache_exactInput = amountRequired.isGreaterThan(0);
    let cache_computedLatestTimepoint = false;
    let cache_amountCalculated = BigNumber(0);
    let cache_tickCummulative, cache_secondsPerLiquidityCumulative;

    let currentLiquidity = liquidity;
    let cache_volumePerLiquidityInBlock = volumePerLiquidityInBlock;
    let cache_totalFeeGrowth = BigNumber(0);
    let cache_communityFee = BigNumber(0); 
    let cache_totalFeeGrowthB = BigNumber(0);
    if (zeroToOne) {
        cache_totalFeeGrowth = totalFeeGrowth0Token;
        cache_communityFee = _communityFeeToken0;
    } else {
        cache_totalFeeGrowth = totalFeeGrowth1Token;
        cache_communityFee = _communityFeeToken1;
    }

    let cache_startTick = currentTick;
    let currentTime = new Date().getTime();
    let blockTimestamp = BigNumber(Math.floor(currentTime / 1000));

    let newTimepointIndex = await writeTimepoint(
        cache_timepointIndex,
        blockTimestamp,
        cache_startTick,
        currentLiquidity,
        cache_volumePerLiquidityInBlock
    )
    console.log("newindex: ", newTimepointIndex);
    
    if (newTimepointIndex != cache_timepointIndex) {
        console.log("oo");
        cache_timepointIndex = newTimepointIndex;
        cache_volumePerLiquidityInBlock = BigNumber(0);
        cache_fee = await getNewFee(blockTimestamp, currentTick, newTimepointIndex, currentLiquidity);
    }

    let step_stepSqrtPrice, step_nextTick, step_initialized, step_nextTickPrice, step_input, step_output, step_feeAmount;
    while(true) {
        step_stepSqrtPrice = currentPrice;
        console.log("tick", currentTick.toString());
        [step_nextTick, step_initialized] = await nextTickInTheSameRow(currentTick, zeroToOne);
        console.log("step", step_nextTick.toString());
        
        step_nextTickPrice = BigNumber(await getSqriRatioAtTick(step_nextTick.toNumber()));
        
        console.log("curr1", currentPrice);
        [currentPrice, step_input, step_output, step_feeAmount] = await movePriceTowardsTarget(
            zeroToOne,
            currentPrice, 
            (zeroToOne == (step_nextTickPrice.isLessThan(limitSqrtPrice))) ? limitSqrtPrice : step_nextTickPrice,
            currentLiquidity,
            amountRequired, 
            cache_fee
        );
        console.log("curr2", currentPrice);
        

        if (cache_exactInput) {
            amountRequired = amountRequired.minus((step_input.plus(step_feeAmount)).integerValue());
            cache_amountCalculated = cache_amountCalculated.minus(step_output.integerValue());
        } else {
            amountRequired = amountRequired.plus(step_output.integerValue());
            cache_amountCalculated = cache_amountCalculated.plus((step_input.plus(step_feeAmount)).integerValue());
        }

        if (cache_communityFee.isGreaterThan(0)) {
            let delta = (step_feeAmount.multipliedBy(cache_communityFee)).dividedBy(COMMUNITY_FEE_DENOMINATOR);
            step_feeAmount = step_feeAmount.minus(delta);
            communityFeeAmount = communityFeeAmount.plus(delta);
        }

        if (currentLiquidity.isGreaterThan(0)) {
            cache_totalFeeGrowth = cache_totalFeeGrowth.plus(await mulDiv(step_feeAmount, BigNumber(2).pow(128), currentLiquidity));
        }
        console.log(currentPrice.toString());
        console.log(step_nextTickPrice.toString());
        if (currentPrice.isEqualTo(step_nextTickPrice)) {
            console.log("yyy");
            if (step_initialized) {
                if (!cache_computedLatestTimepoint) {
                    [cache_tickCummulative, cache_secondsPerLiquidityCumulative, , ] = await getSingleTimepoint(
                        blockTimestamp,
                        BigNumber(0),
                        cache_startTick, cache_timepointIndex,
                        0, 
                        currentLiquidity
                    );
                    cache_computedLatestTimepoint = true;
                    cache_totalFeeGrowthB = zeroToOne ? totalFeeGrowth1Token : totalFeeGrowth0Token;
                }

                let liquidityDelta;
                if (zeroToOne) {
                    liquidityDelta = (await cross(
                        step_nextTick, 
                        cache_totalFeeGrowth, 
                        cache_totalFeeGrowthB,
                        cache_secondsPerLiquidityCumulative,
                        cache_tickCummulative,
                        blockTimestamp
                    )).multipliedBy(-1);
                } else {
                    liquidityDelta = await cross(
                        step_nextTick, 
                        cache_totalFeeGrowthB,
                        cache_totalFeeGrowth,
                        cache_secondsPerLiquidityCumulative, 
                        cache_tickCummulative, 
                        blockTimestamp
                    )
                }
                currentLiquidity = currentLiquidity.plus(liquidityDelta);
            }
            //currentTick = zeroToOne ? step_nextTick.minus(1): step_nextTick;
            console.log("nows", currentTick.toString());
            currentTick = step_nextTick.minus(1);
            console.log("currtick: ", currentTick.toString());

        } else if (!currentPrice.isEqualTo(step_stepSqrtPrice)) {
            console.log("nam");
            currentTick = BigNumber((await getTickAtSqrtRatio(currentPrice.toNumber())));
            break;
        }

        if (amountRequired.isEqualTo(0) || currentPrice.isEqualTo(limitSqrtPrice)) {
            break;
        }
    }

    let [amount0, amount1] = zeroToOne == cache_exactInput ? [cache_amountRequiredInitial.minus(amountRequired), cache_amountCalculated]
    : [cache_amountCalculated, cache_amountRequiredInitial.minus(amountRequired)];

    [globalState_price, globalState_tick, globalState_fee, globalState_timepointIndex] = [currentPrice, currentTick, cache_fee, cache_timepointIndex];

    [liquidity, volumePerLiquidityInBlock] = [
        currentLiquidity,
        cache_volumePerLiquidityInBlock.plus(await calculateVolumePerLiquidity(currentLiquidity, amount0, amount1))
    ];

    if (zeroToOne) {
        totalFeeGrowth0Token = cache_totalFeeGrowth;
    } else {
        totalFeeGrowth1Token = cache_totalFeeGrowth;
    }
    
    return [amount0, amount1, globalState_price, globalState_tick, globalState_fee, globalState_timepointIndex, currentLiquidity, communityFeeAmount, totalFeeGrowth0Token, totalFeeGrowth1Token]

}

export async function toggleTick(
    tick: BigNumber
) {
    let ticktable = require("./tickTable.json");
    let tickTable : any[][] = [];
    for (let tick of ticktable) {
        tickTable.push([tick.wordPosition, tick.value]);
    }
    let bitNumber = (tick.modulo(256).plus(256)).toNumber();
    let rowNumber = tick.dividedBy(BigNumber(2).pow(8));
    let _value = await find_value_tick(rowNumber);
    let value = _value.toNumber();
    value = value ^ (1 << bitNumber);

    fs.readFile('src/Simulation/camelot_v3/tickTable.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        let jsonData: any[] = JSON.parse(data);
        
        const foundItem = jsonData.find(item => item.wordPosition === rowNumber.toString()); // Replace 'someValue' with the actual value you're looking for
        if (foundItem) {
            foundItem.value = value; 
        }

        const updatedJsonData: string = JSON.stringify(jsonData, null, 2); 

        fs.writeFile('src/Simulation/camelot_v3/timepoints.json', updatedJsonData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('File has been updated successfully.');
        });
    });
    
    
     
}

export async function addLiquidity(
    appState: ApplicationState,
    _tokenId: string,
    _amount0Desired: string,
    _amount1Desired: string,
    _from: EthAddress,
    _recipient: EthAddress
) : Promise <ApplicationState> {
    let nftmanager, pool, token0, token1, tickLower, tickUpper;
    let sqrtPriceX96, sqrtRatioAX96, sqrtRatioBX96;
    try {
        appState = await updateCamelotV3State(appState, _from, false);
        let newState = { ...appState };
        for (let i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i].tokenId == _tokenId) {
                nftmanager = tokenIds[i].nftmanager;
                pool = tokenIds[i].algebra_pool;
            }
        }
        if (!nftmanager) {
            throw new Error('nftmanager is undefined');
        }
        if (!pool) {
            throw new Error('pool is undefined');
        }
        let camelotv3state = newState.camelotv3state.camelotv3state.get(nftmanager)!;
        token0 = camelotv3state.token0;
        token1 = camelotv3state.token1;
        tickLower = camelotv3state.tickLower;
        tickUpper = camelotv3state.tickUpper;

        if (!appState.walletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.walletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } 

        if (!appState.smartWalletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.smartWalletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } 

        await updateUserEthBalance(newState);

        
        let globalstate = newState.camelotv3state.globalstate.get(pool);
        sqrtPriceX96 = globalstate?.price;
        if (sqrtPriceX96 === undefined) {
            throw new Error('sqrtPriceX96 is undefined'); // Throw an error if undefined
        }
        sqrtRatioAX96 = await getSqriRatioAtTick(camelotv3state.tickLower);
        if (sqrtRatioAX96 === undefined) {
            throw new Error('sqrtRatioAX96 is undefined'); // Throw an error if undefined
        }
        sqrtRatioBX96 = await getSqriRatioAtTick(camelotv3state.tickUpper);
        if (sqrtRatioBX96 === undefined) {
            throw new Error('sqrtRatioBX96 is undefined'); // Throw an error if undefined
        }

        const amount0Desired = BigNumber(_amount0Desired);
        const amount1Desired = BigNumber(_amount1Desired);
        const liquidity = await getLiquidityForAmount(
            sqrtPriceX96,
            sqrtRatioAX96,
            sqrtRatioBX96,
            amount0Desired,
            amount1Desired
        )
        
        const tick = globalstate?.tick ?? 0; // Default to 0 if undefined
        const price = globalstate?.price ?? 0; // Default to 0 if undefined
        let [amount0Int, amount1Int, ] = await _getAmountsForLiquidity(
            camelotv3state.tickLower,
            camelotv3state.tickUpper,
            BigNumber(liquidity).integerValue(BigNumber.ROUND_FLOOR),
            tick,
            price
        )
        console.log("amount: ", amount0Int.toString(), amount1Int.toString());

        let poolstate = newState.camelotv3state.poolstate.get(pool);

        const totalFeeGrowth0Token = poolstate?.totalFeeGrowth0Token ?? 0;
        const totalFeeGrowth1Token = poolstate?.totalFeeGrowth1Token ?? 0;

        let ticklowerstate = newState.camelotv3state.ticklowerstate.get(pool);
        let tickupperstate = newState.camelotv3state.tickupperstate.get(pool);

        let [tickLower_outerfee0, tickLower_outerfee1 , tickLower_liquidityDelta, tickLower_liquidityTotal, flipped1] = await update(
            tickLower,
            globalstate?.tick ?? 0,
            BigNumber(liquidity).integerValue(BigNumber.ROUND_FLOOR),
            BigNumber(ticklowerstate?.liquidityDelta ?? 0),
            BigNumber(ticklowerstate?.liquidityTotal ?? 0),
            totalFeeGrowth0Token,
            totalFeeGrowth1Token,
            ticklowerstate?.outerFeeGrowth0Token ?? 0,
            ticklowerstate?.outerFeeGrowth1Token ?? 0,
            false
        )
        if (flipped1) {
            await toggleTick(BigNumber(tickLower));
        }
        

        let [tickUpper_outerfee0, tickUpper_outerfee1, tickUpper_liquidityDelta, tickUpper_liquidityTotal, flipped2] = await update(
            tickUpper,
            globalstate?.tick ?? 0,
            BigNumber(liquidity).integerValue(BigNumber.ROUND_FLOOR),
            BigNumber(tickupperstate?.liquidityDelta ?? 0),
            BigNumber(tickupperstate?.liquidityTotal ?? 0),
            totalFeeGrowth0Token,
            totalFeeGrowth1Token,
            tickupperstate?.outerFeeGrowth0Token ?? 0,
            tickupperstate?.outerFeeGrowth1Token ?? 0,
            true
        )
        if (flipped2) {
            await toggleTick(BigNumber(tickUpper));
        }

        const newTokensOwed0 = BigNumber(camelotv3state.tokensOwed0).plus(((BigNumber(poolstate?.totalFeeGrowth0Token ?? 0).minus(BigNumber(camelotv3state.feeGrowthInside0LastX128))).multipliedBy(BigNumber(camelotv3state.liquidity)).dividedBy(BigNumber(2).pow(128))).integerValue(BigNumber.ROUND_DOWN));
        const newTokensOwed1 = BigNumber(camelotv3state.tokensOwed1).plus(((BigNumber(poolstate?.totalFeeGrowth1Token ?? 0).minus(BigNumber(camelotv3state.feeGrowthInside1LastX128))).multipliedBy(BigNumber(camelotv3state.liquidity)).dividedBy(BigNumber(2).pow(128))).integerValue(BigNumber.ROUND_DOWN));
        const newfeeGrowthInside0LastX128 = BigNumber(poolstate?.totalFeeGrowth0Token ?? 0);
        const newfeeGrowthInside1LastX128 = BigNumber(poolstate?.totalFeeGrowth1Token ?? 0);
        const newLiquidity = BigNumber(camelotv3state.liquidity).plus(BigNumber(liquidity).integerValue(BigNumber.ROUND_FLOOR));
        const newLiquidity_poolState = BigNumber(poolstate?.liquidity ?? 0).plus(BigNumber(liquidity).integerValue(BigNumber.ROUND_DOWN));

        const newCamelotV3State: camelotv3statechange = {
            nonce: camelotv3state.nonce,
            operator: camelotv3state.operator,
            token0: camelotv3state.token0,
            token1: camelotv3state.token1,
            tickLower: camelotv3state.tickLower,
            tickUpper: camelotv3state.tickUpper,
            liquidity: Number(newLiquidity),
            feeGrowthInside0LastX128: Number(newfeeGrowthInside0LastX128),
            feeGrowthInside1LastX128: Number(newfeeGrowthInside1LastX128),
            tokensOwed0: Number(newTokensOwed0),
            tokensOwed1: Number(newTokensOwed1)
        }
        newState.camelotv3state.camelotv3state.set(nftmanager, newCamelotV3State);
        
        // const newglobalState: globalstatechange = {
        //     price: globalstate?.price ?? 0,
        //     tick: globalstate?.tick ?? 0,
        //     unlocked: globalstate?.unlocked ?? false
        // }
        // newState.camelotv3state.globalstate.set(pool, newglobalState);

        const newpoolState: poolstatechange = {
            totalFeeGrowth0Token: Number(poolstate?.totalFeeGrowth0Token),
            totalFeeGrowth1Token: Number(poolstate?.totalFeeGrowth1Token),
            liquidity: Number(newLiquidity_poolState)
        }
        newState.camelotv3state.poolstate.set(pool, newpoolState);

        const newtickLower: ticklowerstatechange = {
            liquidityTotal: Number(tickLower_liquidityTotal),
            liquidityDelta: Number(tickLower_liquidityDelta),
            outerFeeGrowth0Token: Number(tickLower_outerfee0),
            outerFeeGrowth1Token: Number(tickLower_outerfee1)
        }
        newState.camelotv3state.ticklowerstate.set(pool, newtickLower);

        const newtickUpper: tickupperstatechange = {
            liquidityTotal: Number(tickUpper_liquidityTotal),
            liquidityDelta: Number(tickUpper_liquidityDelta),
            outerFeeGrowth0Token: Number(tickUpper_outerfee0),
            outerFeeGrowth1Token: Number(tickUpper_outerfee1)
        }
        newState.camelotv3state.tickupperstate.set(pool, newtickUpper);

        let mode = getMode(appState, _from);
        if (appState[mode].tokenBalances.has(token0.toLowerCase())) {
            let oldToken0Balances = appState[mode].tokenBalances.get(token0.toLowerCase())!
                let newToken0Balance = BigNumber(oldToken0Balances).minus(BigNumber(amount0Int));
                appState[mode].tokenBalances.set(token0.toLowerCase() , newToken0Balance.toFixed());
          
                let oldToken1Balances = appState[mode].tokenBalances.get(token1.toLowerCase())!
                let newToken1Balance = BigNumber(oldToken1Balances).minus(BigNumber(amount1Int));
                appState[mode].tokenBalances.set(token1.toLowerCase() , newToken1Balance.toFixed());
    
                
    
        } else {
            new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
        }




        
        // let [feeGrowthInside0X128, feeGrowthInside1X128] = await getInnerFeeGrowth(
        //     BigNumber(tickLower),
        //     BigNumber(tickUpper),
        //     BigNumber(globalstate?.tick ?? 0) ,
        //     BigNumber(totalFeeGrowth0Token),
        //     BigNumber(totalFeeGrowth1Token),
        //     BigNumber(ticklowerstate?.outerFeeGrowth0Token ?? 0),
        //     BigNumber(ticklowerstate?.outerFeeGrowth1Token ?? 0),
        //     BigNumber(tickupperstate?.outerFeeGrowth0Token ?? 0),
        //     BigNumber(tickupperstate?.outerFeeGrowth1Token ?? 0)
        // )
     return newState;
    } catch (err) {
        throw err;
    }
}

export async function removeliquidity(
    appState: ApplicationState,
    _tokenId: string,
    _liquidity: string,
    _to: EthAddress
): Promise<ApplicationState> {
    let nftmanager, pool, token0, token1, tickLower, tickUpper;
    try {
        appState = await updateCamelotV3State(appState, _to, false);
        let newState = { ...appState };
        for (let i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i].tokenId == _tokenId) {
                nftmanager = tokenIds[i].nftmanager;
                pool = tokenIds[i].algebra_pool;
            }
        }
        if (!nftmanager) {
            throw new Error('nftmanager is undefined');
        }
        if (!pool) {
            throw new Error('pool is undefined');
        }
        let camelotv3state = newState.camelotv3state.camelotv3state.get(nftmanager)!;
        token0 = camelotv3state.token0;
        token1 = camelotv3state.token1;
        tickLower = camelotv3state.tickLower;
        tickUpper = camelotv3state.tickUpper;

        // if (!appState.walletState.tokenBalances.has(token0) ) {
        //     await updateUserTokenBalance(appState, token0);
        // } else if (!appState.walletState.tokenBalances.has(token1)) {
        //     await updateUserTokenBalance(appState, token1);
        // } 

        // if (!appState.smartWalletState.tokenBalances.has(token0) ) {
        //     await updateUserTokenBalance(appState, token0);
        // } else if (!appState.smartWalletState.tokenBalances.has(token1)) {
        //     await updateUserTokenBalance(appState, token1);
        // } 

        // await updateUserEthBalance(newState);

        
        let globalstate = newState.camelotv3state.globalstate.get(pool);
        const tick = globalstate?.tick ?? 0; 
        const price = globalstate?.price ?? 0; 
        // sqrtPriceX96 = globalstate?.price;
        // if (sqrtPriceX96 === undefined) {
        //     throw new Error('sqrtPriceX96 is undefined'); // Throw an error if undefined
        // }
        // sqrtRatioAX96 = await getSqriRatioAtTick(camelotv3state.tickLower);
        // if (sqrtRatioAX96 === undefined) {
        //     throw new Error('sqrtRatioAX96 is undefined'); // Throw an error if undefined
        // }
        // sqrtRatioBX96 = await getSqriRatioAtTick(camelotv3state.tickUpper);
        // if (sqrtRatioBX96 === undefined) {
        //     throw new Error('sqrtRatioBX96 is undefined'); // Throw an error if undefined
        // }

        let poolstate = newState.camelotv3state.poolstate.get(pool);
        const totalFeeGrowth0Token = poolstate?.totalFeeGrowth0Token ?? 0;
        const totalFeeGrowth1Token = poolstate?.totalFeeGrowth1Token ?? 0;
        let ticklowerstate = newState.camelotv3state.ticklowerstate.get(pool);
        let tickupperstate = newState.camelotv3state.tickupperstate.get(pool);

        const liquidity = (BigNumber(_liquidity).integerValue(BigNumber.ROUND_DOWN)).multipliedBy(-1);
        
        let [tickLower_outerfee0, tickLower_outerfee1 , tickLower_liquidityDelta, tickLower_liquidityTotal, flipped1] = await update(
            tickLower,
            globalstate?.tick ?? 0,
            liquidity,
            BigNumber(ticklowerstate?.liquidityDelta ?? 0),
            BigNumber(ticklowerstate?.liquidityTotal ?? 0),
            totalFeeGrowth0Token,
            totalFeeGrowth1Token,
            ticklowerstate?.outerFeeGrowth0Token ?? 0,
            ticklowerstate?.outerFeeGrowth1Token ?? 0,
            false
        )
        if (flipped1) {
            await toggleTick(BigNumber(tickLower));
        }

        let [tickUpper_outerfee0, tickUpper_outerfee1, tickUpper_liquidityDelta, tickUpper_liquidityTotal, flipped2] = await update(
            tickUpper,
            globalstate?.tick ?? 0,
            liquidity,
            BigNumber(tickupperstate?.liquidityDelta ?? 0),
            BigNumber(tickupperstate?.liquidityTotal ?? 0),
            totalFeeGrowth0Token,
            totalFeeGrowth1Token,
            tickupperstate?.outerFeeGrowth0Token ?? 0,
            tickupperstate?.outerFeeGrowth1Token ?? 0,
            true
        )
        if (flipped2) {
            await toggleTick(BigNumber(tickUpper));
        }
        
        let [amount0, amount1, ] = await _getAmountsForLiquidity(
            camelotv3state.tickLower,
            camelotv3state.tickUpper,
            liquidity,
            tick,
            price
        )
        const amount0Int = amount0.integerValue(BigNumber.ROUND_DOWN).multipliedBy(-1);
        const amount1Int = amount1.integerValue(BigNumber.ROUND_DOWN).multipliedBy(-1);
        
        const newTokensOwed0 = BigNumber(camelotv3state.tokensOwed0).plus(amount0Int).plus(((BigNumber(poolstate?.totalFeeGrowth0Token ?? 0).minus(BigNumber(camelotv3state.feeGrowthInside0LastX128))).multipliedBy(BigNumber(camelotv3state.liquidity)).dividedBy(BigNumber(2).pow(128))).integerValue(BigNumber.ROUND_DOWN));
        const newTokensOwed1 = BigNumber(camelotv3state.tokensOwed1).plus(amount1Int).plus(((BigNumber(poolstate?.totalFeeGrowth1Token ?? 0).minus(BigNumber(camelotv3state.feeGrowthInside1LastX128))).multipliedBy(BigNumber(camelotv3state.liquidity)).dividedBy(BigNumber(2).pow(128))).integerValue(BigNumber.ROUND_DOWN));
        const newfeeGrowthInside0LastX128 = BigNumber(poolstate?.totalFeeGrowth0Token ?? 0);
        const newfeeGrowthInside1LastX128 = BigNumber(poolstate?.totalFeeGrowth1Token ?? 0);
        const newLiquidity = BigNumber(camelotv3state.liquidity).plus(BigNumber(liquidity).integerValue(BigNumber.ROUND_FLOOR));
        const newLiquidity_poolState = BigNumber(poolstate?.liquidity ?? 0).plus(BigNumber(liquidity).integerValue(BigNumber.ROUND_DOWN));

        const newCamelotV3State: camelotv3statechange = {
            nonce: camelotv3state.nonce,
            operator: camelotv3state.operator,
            token0: camelotv3state.token0,
            token1: camelotv3state.token1,
            tickLower: camelotv3state.tickLower,
            tickUpper: camelotv3state.tickUpper,
            liquidity: Number(newLiquidity),
            feeGrowthInside0LastX128: Number(newfeeGrowthInside0LastX128),
            feeGrowthInside1LastX128: Number(newfeeGrowthInside1LastX128),
            tokensOwed0: Number(newTokensOwed0),
            tokensOwed1: Number(newTokensOwed1)
        }
        newState.camelotv3state.camelotv3state.set(nftmanager, newCamelotV3State);

        const newpoolState: poolstatechange = {
            totalFeeGrowth0Token: Number(poolstate?.totalFeeGrowth0Token),
            totalFeeGrowth1Token: Number(poolstate?.totalFeeGrowth1Token),
            liquidity: Number(newLiquidity_poolState)
        }
        newState.camelotv3state.poolstate.set(pool, newpoolState);

        const newtickLower: ticklowerstatechange = {
            liquidityTotal: Number(tickLower_liquidityTotal),
            liquidityDelta: Number(tickLower_liquidityDelta),
            outerFeeGrowth0Token: Number(tickLower_outerfee0),
            outerFeeGrowth1Token: Number(tickLower_outerfee1)
        }
        newState.camelotv3state.ticklowerstate.set(pool, newtickLower);

        const newtickUpper: tickupperstatechange = {
            liquidityTotal: Number(tickUpper_liquidityTotal),
            liquidityDelta: Number(tickUpper_liquidityDelta),
            outerFeeGrowth0Token: Number(tickUpper_outerfee0),
            outerFeeGrowth1Token: Number(tickUpper_outerfee1)
        }
        newState.camelotv3state.tickupperstate.set(pool, newtickUpper);

    
     return newState;
    } catch (err) {
        throw err;
    }
}


export async function collect(
    appState: ApplicationState,
    _tokenId: string,
    _amount0Max: string,
    _amount1Max: string,
    _to: EthAddress
): Promise<ApplicationState> {
    let nftmanager, pool, token0, token1, tickLower, tickUpper;
    let amount0Collect, amount1Collect;
    try {
        appState = await updateCamelotV3State(appState, _to, false);
        let newState = { ...appState };
        for (let i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i].tokenId == _tokenId) {
                nftmanager = tokenIds[i].nftmanager;
                pool = tokenIds[i].algebra_pool;
            }
        }
        if (!nftmanager) {
            throw new Error('nftmanager is undefined');
        }
        if (!pool) {
            throw new Error('pool is undefined');
        }
        let camelotv3state = newState.camelotv3state.camelotv3state.get(nftmanager)!;
        token0 = camelotv3state.token0;
        token1 = camelotv3state.token1;
        tickLower = camelotv3state.tickLower;
        tickUpper = camelotv3state.tickUpper;


        if (!appState.walletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.walletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } 

        if (!appState.smartWalletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.smartWalletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } 

        await updateUserEthBalance(newState);

        let poolstate = newState.camelotv3state.poolstate.get(pool);
        // const totalFeeGrowth0Token = poolstate?.totalFeeGrowth0Token ?? 0;
        // const totalFeeGrowth1Token = poolstate?.totalFeeGrowth1Token ?? 0;

        const TokensOwed0 = BigNumber(camelotv3state.tokensOwed0).plus(((BigNumber(poolstate?.totalFeeGrowth0Token ?? 0).minus(BigNumber(camelotv3state.feeGrowthInside0LastX128))).multipliedBy(BigNumber(camelotv3state.liquidity)).dividedBy(BigNumber(2).pow(128))).integerValue(BigNumber.ROUND_DOWN));
        const TokensOwed1 = BigNumber(camelotv3state.tokensOwed1).plus(((BigNumber(poolstate?.totalFeeGrowth1Token ?? 0).minus(BigNumber(camelotv3state.feeGrowthInside1LastX128))).multipliedBy(BigNumber(camelotv3state.liquidity)).dividedBy(BigNumber(2).pow(128))).integerValue(BigNumber.ROUND_DOWN));
        const newfeeGrowthInside0LastX128 = BigNumber(poolstate?.totalFeeGrowth0Token ?? 0);
        const newfeeGrowthInside1LastX128 = BigNumber(poolstate?.totalFeeGrowth1Token ?? 0);

        const amount0Max = BigNumber(_amount0Max);
        const amount1Max = BigNumber(_amount1Max);

        if(amount0Max.isGreaterThan(TokensOwed0)) {
            amount0Collect = TokensOwed0;
        } else {
            amount0Collect = amount0Max;
        }

        if(amount1Max.isGreaterThan(TokensOwed1)) {
            amount1Collect = TokensOwed1;
        } else {
            amount1Collect = amount1Max;
        }

        const newTokensOwed0 = TokensOwed0.minus(amount0Collect);
        const newTokensOwed1 = TokensOwed1.minus(amount1Collect);

        const newCamelotV3State: camelotv3statechange = {
            nonce: camelotv3state.nonce,
            operator: camelotv3state.operator,
            token0: camelotv3state.token0,
            token1: camelotv3state.token1,
            tickLower: camelotv3state.tickLower,
            tickUpper: camelotv3state.tickUpper,
            liquidity: camelotv3state.liquidity,
            feeGrowthInside0LastX128: Number(newfeeGrowthInside0LastX128),
            feeGrowthInside1LastX128: Number(newfeeGrowthInside1LastX128),
            tokensOwed0: Number(newTokensOwed0),
            tokensOwed1: Number(newTokensOwed1)
        }
        newState.camelotv3state.camelotv3state.set(nftmanager, newCamelotV3State);


        let mode = getMode(appState, _to);
        if (appState[mode].tokenBalances.has(token0.toLowerCase())) {
            let oldToken0Balances = appState[mode].tokenBalances.get(token0.toLowerCase())!
                let newToken0Balance = BigNumber(oldToken0Balances).plus(BigNumber(amount0Collect));
                appState[mode].tokenBalances.set(token0.toLowerCase() , newToken0Balance.toFixed());
          
                let oldToken1Balances = appState[mode].tokenBalances.get(token1.toLowerCase())!
                let newToken1Balance = BigNumber(oldToken1Balances).plus(BigNumber(amount1Collect));
                appState[mode].tokenBalances.set(token1.toLowerCase() , newToken1Balance.toFixed());
    
        } else {
            new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
        }
    return newState;
    } catch (err) {
        throw err;
    }
}

export async function swap(
    appState: ApplicationState,
    _from: EthAddress,
    _tokenId: string,
    _recipient: EthAddress,
    zeroToOne: boolean,
    _amountRequired: string,
    _limitSqrtPrice: string,
): Promise<ApplicationState> {
    let nftmanager, pool, token0, token1;
    try {
        appState = await updateCamelotV3State(appState, _from, false);
        let newState = { ...appState };
        for (let i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i].tokenId == _tokenId) {
                nftmanager = tokenIds[i].nftmanager;
                pool = tokenIds[i].algebra_pool;
            }
        }
        if (!nftmanager) {
            throw new Error('nftmanager is undefined');
        }
        if (!pool) {
            throw new Error('pool is undefined');
        }
        let camelotv3state = newState.camelotv3state.camelotv3state.get(nftmanager)!;
        token0 = camelotv3state.token0;
        token1 = camelotv3state.token1;
        

        if (!appState.walletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.walletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } 

        if (!appState.smartWalletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.smartWalletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } 

        await updateUserEthBalance(newState);

        
        let globalstate = newState.camelotv3state.globalstate.get(pool);
        let globalState_price = BigNumber(globalstate!.price);
        let globalState_tick = BigNumber(globalstate!.tick);
        let globalState_fee = BigNumber(globalstate!.fee);
        let globalState_timepointIndex = globalstate!.timepointIndex;
        console.log("index: ", globalState_timepointIndex);
        let globalState_communityFeeToken0 = BigNumber(globalstate!.communityFeeToken0);
        let globalState_communityFeeToken1 = BigNumber(globalstate!.communityFeeToken1);

        let poolstate = newState.camelotv3state.poolstate.get(pool);

        let totalFeeGrowth0Token = BigNumber(poolstate?.totalFeeGrowth0Token ?? 0);
        let totalFeeGrowth1Token = BigNumber(poolstate?.totalFeeGrowth1Token ?? 0);
        let liquidity = BigNumber(poolstate?.liquidity ?? 0);
   

        // if (globalState_price === undefined) {
        //     throw new Error('globalState_price is undefined'); // Throw an error if undefined
        // }
        

        let amountRequired = BigNumber(_amountRequired);
        let limitSqrtPrice = BigNumber(_limitSqrtPrice);
        if(limitSqrtPrice.isEqualTo(0)) {
            limitSqrtPrice = zeroToOne ? BigNumber(4295128740) : BigNumber(1461446703485210103287273052203988822378723970341);
        } 
        let volumePerLiquidityInBlock = BigNumber(0);
        let amount0, amount1, currentLiquidity, communityFeeAmount;

        [amount0, amount1, globalState_price, globalState_tick, globalState_fee, globalState_timepointIndex, currentLiquidity, communityFeeAmount, totalFeeGrowth0Token, totalFeeGrowth1Token] = await _calculateSwapAndLock(zeroToOne, amountRequired, limitSqrtPrice, globalState_price, globalState_tick, globalState_fee, globalState_timepointIndex, globalState_communityFeeToken0, globalState_communityFeeToken1, liquidity, volumePerLiquidityInBlock, totalFeeGrowth0Token, totalFeeGrowth1Token);
        console.log("liquid: ", currentLiquidity.toString());
        const newCamelotV3State: camelotv3statechange = {
            nonce: camelotv3state.nonce,
            operator: camelotv3state.operator,
            token0: camelotv3state.token0,
            token1: camelotv3state.token1,
            tickLower: camelotv3state.tickLower,
            tickUpper: camelotv3state.tickUpper,
            liquidity: Number(currentLiquidity),
            feeGrowthInside0LastX128: camelotv3state.feeGrowthInside0LastX128,
            feeGrowthInside1LastX128: camelotv3state.feeGrowthInside1LastX128,
            tokensOwed0: camelotv3state.tokensOwed0,
            tokensOwed1: camelotv3state.tokensOwed1
        }
        newState.camelotv3state.camelotv3state.set(nftmanager, newCamelotV3State);

        const newpoolState: poolstatechange = {
            totalFeeGrowth0Token: Number(totalFeeGrowth0Token),
            totalFeeGrowth1Token: Number(totalFeeGrowth1Token),
            liquidity: Number(currentLiquidity)
        }
        newState.camelotv3state.poolstate.set(pool, newpoolState);

        const newglobalState: globalstatechange = {
            price: Number(globalState_price),
            tick: Number(globalState_tick),
            fee: Number(globalState_fee),
            timepointIndex: Number(globalState_timepointIndex),
            communityFeeToken0: Number(globalState_communityFeeToken0),
            communityFeeToken1: Number(globalState_communityFeeToken1)
        }
        newState.camelotv3state.globalstate.set(pool, newglobalState)

        
        let mode = getMode(appState, _from);
        if (appState[mode].tokenBalances.has(token0.toLowerCase())) {
            if (!zeroToOne) {
                let oldToken0Balances = appState[mode].tokenBalances.get(token0.toLowerCase())!
                let newToken0Balance = BigNumber(oldToken0Balances).plus(BigNumber(amount0).multipliedBy(-1));
                appState[mode].tokenBalances.set(token0.toLowerCase() , newToken0Balance.toFixed());
            } else {
                let oldToken1Balances = appState[mode].tokenBalances.get(token1.toLowerCase())!
                let newToken1Balance = BigNumber(oldToken1Balances).plus(BigNumber(amount1).multipliedBy(-1));
                appState[mode].tokenBalances.set(token1.toLowerCase() , newToken1Balance.toFixed());
            }
        }
            
    
        

     return newState;
    } catch (err) {
        throw err;
    }
}