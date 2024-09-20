import { BigNumber } from "bignumber.js";
import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState} from "../../State/ApplicationState";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Contract } from "ethers";
import _, { min } from "lodash";
import { bnb, MAX_UINT256, percentMul, wadDiv } from "../../utils/config";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
import { updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserEthBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import { DetailTokenInPool } from "../../State/SmartWalletState";
import { getMode} from "../../utils/helper";
import { updateCamelotState } from "./update";
import { camelotstate, camelotstatechange } from "../../State/camelot";
import { updateTokenDetailInOthersPoolsCompound } from "../forkCompoundLP";
import ERC20Mock from "../../abis/ERC20Mock.json"; // Ensure ERC20Mock ABI is imported
import tokenpair from "./pair.json";

export async function getPair(token0: EthAddress, token1: EthAddress): Promise<EthAddress|undefined> {
    for (let pair of tokenpair) {
        if (pair.address1 == token0 && pair.address2 == token1) {
            return pair.pairAddress;
        } else if (pair.address1 == token1 && pair.address2 == token0) {
            return pair.pairAddress;
        }
    }
    return undefined;
}

export async function checkPair(token1: EthAddress, token2: EthAddress): Promise<boolean> {
    for (let pair of tokenpair) {
        if (pair.address1 == token1) {
            if (pair.address2 == token2) {
                return true;
            }
        } else if (pair.address2 == token1) {
            if (pair.address1 == token2) {
                return true;
            }
        }
    }
    return false;
}

export async function TokenMiddle(token1: EthAddress, token2: EthAddress): Promise<[EthAddress, EthAddress, EthAddress] | null> {
    let token1_arr: EthAddress[] = []; 
    let pair1_arr: EthAddress[] = [];

    for (let pair of tokenpair) {
        if (pair.address1 == token1) {
            token1_arr.push(pair.address2);
            pair1_arr.push(pair.pairAddress);
        } else if (pair.address2 == token1) {
            token1_arr.push(pair.address1);
            pair1_arr.push(pair.pairAddress);
        }
    }
    for (let pair of tokenpair) {
        if (pair.address1 == token2) {
            if (token1_arr.includes(pair.address2)) {
                return [pair1_arr[token1_arr.indexOf(pair.address2)], pair.pairAddress ,pair.address2];
            }
        } else if (pair.address2 == token2) {
            if (token1_arr.includes(pair.address1)) {
                return [pair1_arr[token1_arr.indexOf(pair.address1)], pair.pairAddress, pair.address2];
            
            }
        }
    }
    return null;

}


export async function quote(a : BigNumber, b : BigNumber, c : BigNumber): Promise<BigNumber> {
    const result = a.multipliedBy(c).dividedBy(b);
    return result;
}

export async function addLiquidityC(
    appState: ApplicationState,
    token0: EthAddress,
    token1: EthAddress,
    pairAddress: EthAddress,
    token0Amount: string,
    token1Amount: string,
    from: EthAddress
  ): Promise<ApplicationState> {
    let amountA, amountB, liquidityadd;
    try {
        appState = await updateCamelotState(appState, from, false);
        let newState = { ...appState };
        let camelotstate = newState.camelotstate.camelotstate.get(pairAddress)!;

        if (!appState.walletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.walletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } else if (!appState.walletState.tokenBalances.has(pairAddress)) {
            await updateUserTokenBalance(appState, pairAddress);
        }

        if (!appState.smartWalletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.smartWalletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } else if (!appState.smartWalletState.tokenBalances.has(pairAddress)) {
            await updateUserTokenBalance(appState, pairAddress);
        }

        await updateUserEthBalance(newState);

        const oldtoken0Reserve = BigNumber(camelotstate.reserves0);
        const oldtoken1Reserve = BigNumber(camelotstate.reserves1);
        const oldLiquidity = BigNumber(camelotstate.liquidity);
        const oldTotalSupply = BigNumber(camelotstate.totalSupply);

        if (oldtoken0Reserve === BigNumber(0) && oldtoken1Reserve === BigNumber(0)) {
            amountA = BigNumber(token0Amount);
            amountB = BigNumber(token1Amount);
        } else {
            let amountBoptimal = await quote(BigNumber(token0Amount), oldtoken0Reserve, oldtoken1Reserve);
            if (amountBoptimal.isLessThan(BigNumber(token1Amount))) {
                amountA = BigNumber(token0Amount);
                amountB = amountBoptimal;
            } else {
                let amountAoptimal = await quote(BigNumber(token1Amount), oldtoken1Reserve, oldtoken0Reserve);
                amountA = amountAoptimal;
                amountB = BigNumber(token0Amount);
            }
        }
        const newtoken0Reserve = oldtoken0Reserve.plus(amountA);
        const newtoken1Reserve = oldtoken1Reserve.plus(amountB);

        if (oldLiquidity.isEqualTo(0)) {
            liquidityadd = BigNumber(amountA.multipliedBy(amountB)).sqrt();
        } else {
            const minValue = min([amountA.multipliedBy(oldLiquidity).dividedBy(oldtoken0Reserve), amountB.multipliedBy(oldLiquidity).dividedBy(oldtoken1Reserve)]) || BigNumber(0);
            liquidityadd = BigNumber(minValue);
        }

        const newLiquidity = BigNumber(oldLiquidity.plus(liquidityadd));
        const newTotalSupply = BigNumber(oldTotalSupply.plus(liquidityadd));


        const newCamelotState: camelotstatechange = {
            token0addr : token0,
            token1addr : token1,
            pairaddr : pairAddress,
            reserves0 :Number(newtoken0Reserve),
            reserves1 : Number(newtoken1Reserve),
            liquidity : Number(newLiquidity),
            totalSupply : Number(newTotalSupply),
        }

        newState.camelotstate.camelotstate.set(pairAddress, newCamelotState);

    let mode = getMode(appState, from);
    if (appState[mode].tokenBalances.has(token0.toLowerCase())) {
        let oldToken0Balances = appState[mode].tokenBalances.get(token0.toLowerCase())!
            let newToken0Balance = BigNumber(oldToken0Balances).minus(amountA);
            appState[mode].tokenBalances.set(token0.toLowerCase() , newToken0Balance.toFixed());
      
            let oldToken1Balances = appState[mode].tokenBalances.get(token1.toLowerCase())!
            let newToken1Balance = BigNumber(oldToken1Balances).minus(amountB);
            appState[mode].tokenBalances.set(token1.toLowerCase() , newToken1Balance.toFixed());

            let oldTokenPair = appState.walletState.tokenBalances.get(pairAddress.toLowerCase())!
            let newTokenPair = BigNumber(oldTokenPair).plus(liquidityadd);
            appState[mode].tokenBalances.set(pairAddress , newTokenPair.toFixed());
    }  else {
            new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
        }

        return newState;
    } catch (err) {
        throw err;
    }
}   

export async function removeLiquidityC(
    appState: ApplicationState,
    token0: EthAddress,
    token1: EthAddress,
    pairAddress: EthAddress,
    liquidity: string,
    from: EthAddress,
  ): Promise<ApplicationState> {
    try {
        appState = await updateCamelotState(appState, from, false);
        let newState = { ...appState };
        let camelotstate = newState.camelotstate.camelotstate.get(pairAddress)!;
        if (!appState.walletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.walletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } else if (!appState.walletState.tokenBalances.has(pairAddress)) {
            await updateUserTokenBalance(appState, pairAddress);
        }

        if (!appState.smartWalletState.tokenBalances.has(token0) ) {
            await updateUserTokenBalance(appState, token0);
        } else if (!appState.smartWalletState.tokenBalances.has(token1)) {
            await updateUserTokenBalance(appState, token1);
        } else if (!appState.smartWalletState.tokenBalances.has(pairAddress)) {
            await updateUserTokenBalance(appState, pairAddress);
        }

        await updateUserEthBalance(newState);

        const oldReserve0 = BigNumber(camelotstate.reserves0);
        const oldReserve1 = BigNumber(camelotstate.reserves1);
        const oldLiquidity = BigNumber(camelotstate.liquidity);
        const oldTotalSupply = BigNumber(camelotstate.totalSupply);

    
        const oldbalance0 = camelotstate.reserves0;
        const oldbalance1 = camelotstate.reserves1;
        
        const liquidityremove = BigNumber(liquidity);
        const amount0 = BigNumber(liquidityremove).multipliedBy(oldbalance0).dividedBy(camelotstate.totalSupply);
        const amount1 = BigNumber(liquidityremove).multipliedBy(oldbalance1).dividedBy(camelotstate.totalSupply);

        const newReserve0 = BigNumber(oldReserve0).minus(amount0);
        const newReserve1 = BigNumber(oldReserve1).minus(amount1);
        const newLiquidity = BigNumber(oldLiquidity).minus(liquidityremove);
        const newTotalSupply = BigNumber(oldTotalSupply).minus(liquidityremove)



        const newCamelotState: camelotstatechange = {
            token0addr : token0,
            token1addr : token1,
            pairaddr : pairAddress,
            reserves0 : Number(newReserve0),
            reserves1 : Number(newReserve1),
            liquidity : Number(newLiquidity),
            totalSupply : Number(newTotalSupply),
        }

        newState.camelotstate.camelotstate.set(pairAddress, newCamelotState);

    let mode = getMode(appState, from);
    if (appState[mode].tokenBalances.has(token0.toLowerCase())) {
        let oldToken0Balances = appState[mode].tokenBalances.get(token0.toLowerCase())!
            let newToken0Balance = BigNumber(oldToken0Balances).plus(amount0);
            appState[mode].tokenBalances.set(token0.toLowerCase() , newToken0Balance.toFixed());
      
            let oldToken1Balances = appState[mode].tokenBalances.get(token1.toLowerCase())!
            let newToken1Balance = BigNumber(oldToken1Balances).plus(amount1);
            appState[mode].tokenBalances.set(token1.toLowerCase() , newToken1Balance.toFixed());

            let oldTokenPair = appState.walletState.tokenBalances.get(pairAddress.toLowerCase())!
            let newTokenPair = BigNumber(oldTokenPair).minus(liquidityremove);
            appState[mode].tokenBalances.set(pairAddress , newTokenPair.toFixed());

    } else {
            new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
        }

        return newState;

    } catch (err) {
        throw err;
    }
}

export async function swapLiquidity(
    appState: ApplicationState,
    token0: EthAddress,
    token1: EthAddress,
    pairAddress: EthAddress,
    amountIn: string,
    from: EthAddress,
  ): Promise<BigNumber> {
    try{
    appState = await updateCamelotState(appState, from, false);
    let newState = { ...appState };
    let camelotstate = newState.camelotstate.camelotstate.get(pairAddress)!;
    if (!appState.walletState.tokenBalances.has(token0) ) {
        await updateUserTokenBalance(appState, token0);
    } else if (!appState.walletState.tokenBalances.has(token1)) {
        await updateUserTokenBalance(appState, token1);
    } else if (!appState.walletState.tokenBalances.has(pairAddress)) {
        await updateUserTokenBalance(appState, pairAddress);
    }

    if (!appState.smartWalletState.tokenBalances.has(token0) ) {
        await updateUserTokenBalance(appState, token0);
    } else if (!appState.smartWalletState.tokenBalances.has(token1)) {
        await updateUserTokenBalance(appState, token1);
    } else if (!appState.smartWalletState.tokenBalances.has(pairAddress)) {
        await updateUserTokenBalance(appState, pairAddress);
    }

    await updateUserEthBalance(newState);

    console.log(`camelot state before swap between ${token0} and ${token1}`, camelotstate);

    const oldReserveIn = camelotstate.reserves0;
    const oldReserveOut = camelotstate.reserves1;
    const oldLiquidity = BigNumber(camelotstate.liquidity);
    const oldTotalSupply = BigNumber(camelotstate.totalSupply);

        
    const amountInWithFee = BigNumber(amountIn).multipliedBy(997);
    const numerator = amountInWithFee.multipliedBy(oldReserveOut);
    const denominator = BigNumber(oldReserveIn).multipliedBy(1000).plus(amountInWithFee);
    const amountOut = numerator.dividedBy(denominator);

        // Update reserves
    const newReserveIn = BigNumber(oldReserveIn).plus(BigNumber(amountIn));
    const newReserveOut = BigNumber(oldReserveOut).minus(amountOut);

    const newCamelotState: camelotstatechange = {
        token0addr : token0,
        token1addr : token1,
        pairaddr : pairAddress,
        reserves0 : Number(newReserveIn),
        reserves1 : Number(newReserveOut),
        liquidity : Number(oldLiquidity),
        totalSupply : Number(oldTotalSupply),
    }


    newState.camelotstate.camelotstate.set(pairAddress, newCamelotState);
    console.log(`camelot state before swap between ${token0} and ${token1}`, newCamelotState);

    let mode = getMode(appState, from);
    if (appState[mode].tokenBalances.has(token0.toLowerCase())) {
        let oldToken0Balances = appState[mode].tokenBalances.get(token0.toLowerCase())!
        let newToken0Balance = BigNumber(oldToken0Balances).minus(BigNumber(amountIn));
        appState[mode].tokenBalances.set(token0.toLowerCase() , newToken0Balance.toFixed());
  
        let oldToken1Balances = appState[mode].tokenBalances.get(token1.toLowerCase())!
        let newToken1Balance = BigNumber(oldToken1Balances).plus(amountOut);
        appState[mode].tokenBalances.set(token1.toLowerCase() , newToken1Balance.toFixed());
    } else {
        new Error(`from addresses are wallet address or smart wallet address: ${appState.walletState.address} || ${appState.smartWalletState.address}.`);
    }

    return amountOut;
    } catch (err) {
        throw err;
    }
         
  }

export async function swapLiquidityAll(
    appState: ApplicationState,
    token0: EthAddress,
    token1: EthAddress,
    amountIn: string,
    from: EthAddress,
    ): Promise<BigNumber|null> {
        let pair02,pair21, tokenmid, amountOut;
        appState = await updateCamelotState(appState, from, false);
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
        const check = await checkPair(token0, token1);
        if (check) {
            const pair01 = await getPair(token0, token1);
            if (!pair01) {
                throw new Error("Pair not found");
            }
            amountOut = await swapLiquidity(appState, token0, token1, pair01, amountIn, from);
            console.log("0");
            return amountOut;
        } 
        const result = await TokenMiddle(token0, token1);
        if (result) {
            [pair02, pair21, tokenmid] = result;
        } else {
            console.log("1");
            return null;
        }
        amountOut = await swapLiquidity(appState, token0, tokenmid, pair02, amountIn, from);
        amountOut = await swapLiquidity(appState, tokenmid, token1, pair21, amountOut.toString(), from);
        console.log("Done");
        return amountOut;

}

export async function swapLiquidityV2(
    appState: ApplicationState,
    path: EthAddress[],
    amountIn: string,
    from: EthAddress,
    ){
        let amountOut, amountOut1 = BigNumber(0);
        for (let i = 0; i < path.length; i++) {
            if (i == 1) {
                amountOut = await swapLiquidityAll(appState, path[i-1], path[i], amountIn, from);
                if (amountOut == null) {
                    throw new Error("Swap failed1");
                }
                amountOut1 = amountOut;

            } else if (i != 0 && i != 1) {
                amountOut = await swapLiquidityAll(appState, path[i-1], path[i], amountOut1.toString(), from);
                if (amountOut == null) {
                    throw new Error("Swap failed2");
                }
                amountOut1 = amountOut;
        }
    }
}











