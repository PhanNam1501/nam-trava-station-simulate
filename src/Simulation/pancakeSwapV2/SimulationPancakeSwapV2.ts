import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../basic/UpdateStateAccount";
import _ from "lodash";
import { MAX_UINT256 } from "../../utils/config";
import { getMode, isWallet } from "../../utils/helper";
import BigNumber from "bignumber.js";
import { getAddr } from "../../utils";
import { updatePancakeSwapV2 } from "./UpdateStateAccount";

export async function simulateAddliquidity(
    appState1: ApplicationState,
    _token0: EthAddress,
    _token1: EthAddress,
    _tokenPair: EthAddress,
    _token0Amount: string,
    _token1Amount: string,
): Promise<ApplicationState> {
    let token0Amount = _token0Amount;
    let token1Amount = _token1Amount;
    let token0 = _token0.toLowerCase();
    let token1 = _token1.toLowerCase();
    let tokenPair = _tokenPair.toLowerCase();
    
    let appState = {...appState1};
    if (!appState.pancakeSwapV2Pair.isFetch) {
        appState = await updatePancakeSwapV2(appState);
    }
    if (!appState.smartWalletState.tokenBalances.has(token0)) {
        appState = await updateUserTokenBalance(appState, token0)
        appState = await updateSmartWalletTokenBalance(appState,token0)
    }
    if (!appState.smartWalletState.tokenBalances.has(token1)) {
        appState = await updateUserTokenBalance(appState, token1)
        appState = await updateSmartWalletTokenBalance(appState,token1)
    }
    if (!appState.smartWalletState.tokenBalances.has(tokenPair)) {
        appState = await updateUserTokenBalance(appState, tokenPair)
        appState = await updateSmartWalletTokenBalance(appState,tokenPair)
    }
    if (!appState.smartWalletState.tokenBalances.get(token0)) {
        throw new Error("token0 not found in smart wallet");
    }
    let token0Balance = appState.smartWalletState.tokenBalances.get(token0)!;
    if (!appState.smartWalletState.tokenBalances.get(token1)) {
        throw new Error("token1 not found in smart wallet");
    }
    let token1Balance = appState.smartWalletState.tokenBalances.get(token1)!;
    
    let token0ToUSD = BigNumber(token0Amount).multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token0Price).toString();
    let token1ToUSD = BigNumber(token1Amount).multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token1Price).toString();
    let sumToken0And1 = BigNumber(token0ToUSD).plus(token1ToUSD).toString();
    let tvl = appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.tvl;
    let pairBalance =  appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.totalSupplyPairToken;
    let _tokenPairAmount = BigNumber(tvl).plus(sumToken0And1).multipliedBy(pairBalance).dividedBy(tvl).minus(pairBalance).toString();

    appState.smartWalletState.tokenBalances.set(token0, BigNumber(token0Balance).minus(token0Amount).toString());
    appState.smartWalletState.tokenBalances.set(token1, BigNumber(token1Balance).minus(token1Amount).toString());
    appState.smartWalletState.tokenBalances.set(tokenPair, BigNumber(appState.smartWalletState.tokenBalances.get(tokenPair)!).plus(_tokenPairAmount).toString());
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.pairTokenOfSmartWallet = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.pairTokenOfSmartWallet).plus(_tokenPairAmount).toString();
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token0Hold = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token0Hold).plus(_token0Amount).toString();
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token1Hold = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token1Hold).plus(_token1Amount).toString();
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.totalSupplyPairToken = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.totalSupplyPairToken).plus(_tokenPairAmount).toString();
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.tvl = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.tvl)
                                                                    .plus(BigNumber(_token0Amount).multipliedBy(BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token0Price)))
                                                                    .plus(BigNumber(_token1Amount).multipliedBy(BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token1Price)))
                                                                    .toString();
    return appState;
}

export async function simulateRemoveliquidity(
    appState1: ApplicationState,
    _token0: EthAddress,
    _token1: EthAddress,
    _tokenPair: EthAddress,
    _tokenPairAmount: string
): Promise<ApplicationState> {
    let token0 = _token0.toLowerCase();
    let token1 = _token1.toLowerCase();
    let tokenPair = _tokenPair.toLowerCase();
    
    let appState = {...appState1};
    if (!appState.pancakeSwapV2Pair.isFetch) {
        appState = await updatePancakeSwapV2(appState);
    }
    if (!appState.smartWalletState.tokenBalances.has(token0)) {
        appState = await updateUserTokenBalance(appState, token0)
        appState = await updateSmartWalletTokenBalance(appState,token0)
    }
    if (!appState.smartWalletState.tokenBalances.has(token1)) {
        appState = await updateUserTokenBalance(appState, token1)
        appState = await updateSmartWalletTokenBalance(appState,token1)
    }
    if (!appState.smartWalletState.tokenBalances.has(tokenPair)) {
        appState = await updateUserTokenBalance(appState, tokenPair)
        appState = await updateSmartWalletTokenBalance(appState,tokenPair)
    }
    if (!appState.smartWalletState.tokenBalances.get(token0)) {
        throw new Error("token0 not found in smart wallet");
    }
    let token0Balance = appState.smartWalletState.tokenBalances.get(token0)!;
    if (!appState.smartWalletState.tokenBalances.get(token1)) {
        throw new Error("token1 not found in smart wallet");
    }
    let token1Balance = appState.smartWalletState.tokenBalances.get(token1)!;
    
    let token0Amount = BigNumber(_tokenPairAmount)
                    .multipliedBy(BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.pairTokenOfSmartWallet))
                    .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.totalSupplyPairToken)
                    .multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.tvl)
                    .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token0Price)
                    .dividedBy(2)
                    .toString();

    let token1Amount = BigNumber(_tokenPairAmount)
                    .multipliedBy(BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.pairTokenOfSmartWallet))
                    .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.totalSupplyPairToken)
                    .multipliedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.tvl)
                    .dividedBy(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token1Price)
                    .dividedBy(2)
                    .toString();
    
    appState.smartWalletState.tokenBalances.set(token0, BigNumber(token0Balance).plus(token0Amount).toString());
    appState.smartWalletState.tokenBalances.set(token1, BigNumber(token1Balance).plus(token1Amount).toString());
    appState.smartWalletState.tokenBalances.set(tokenPair, BigNumber(appState.smartWalletState.tokenBalances.get(tokenPair)!).minus(_tokenPairAmount).toString());
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.pairTokenOfSmartWallet = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.pairTokenOfSmartWallet).minus(_tokenPairAmount).toString();
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token0Hold = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token0Hold).minus(token0Amount).toString();
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token1Hold = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token1Hold).minus(token1Amount).toString();
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.totalSupplyPairToken = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.totalSupplyPairToken).minus(_tokenPairAmount).toString();
    appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.tvl = BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.tvl)
                                                                    .minus(BigNumber(token0Amount).multipliedBy(BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token0Price)))
                                                                    .minus(BigNumber(token1Amount).multipliedBy(BigNumber(appState.pancakeSwapV2Pair.pancakeV2Pairs.get(tokenPair)!.token1Price)))
                                                                    .toString();
    return appState;
}