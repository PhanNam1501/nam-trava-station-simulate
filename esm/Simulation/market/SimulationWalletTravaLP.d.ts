import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import { BigNumber } from "bignumber.js";
import { DetailTokenInPool } from "../../State/SmartWalletState";
export declare function calculateMaxRewards(appState: ApplicationState): Promise<string>;
export declare function getListTDTokenRewardsAddress(appState: ApplicationState): Array<EthAddress>;
export declare function calculateMaxAmountSupply(appState: ApplicationState, _tokenAddress: string, mode: "walletState" | "smartWalletState"): BigNumber;
export declare function calculateMaxAmountBorrow(appState: ApplicationState, _tokenAddress: string): BigNumber;
export declare function calculateMaxAmountRepay(appState: ApplicationState, _tokenAddress: string, mode: "walletState" | "smartWalletState"): BigNumber;
export declare function calculateMaxAmountWithdraw(appState: ApplicationState, _tokenAddress: string): BigNumber;
export declare function calculateNewAvailableBorrow(newTotalCollateral: BigNumber, newLTV: BigNumber, newTotalDebt: BigNumber): BigNumber;
export declare function calculateNewHealFactor(newTotalCollateral: BigNumber, newLiquidationThreshold: BigNumber, newTotalDebt: BigNumber): BigNumber;
export declare function calculateNewLTV(oldTotalColleteral: BigNumber, oldLTV: BigNumber, newTotalCollateral: BigNumber, tokenLTV: BigNumber): BigNumber;
export declare function calculateNewLiquidThreshold(oldTotalColleteral: BigNumber, oldLiqThres: BigNumber, newTotalCollateral: BigNumber, tokenLiqThres: BigNumber): BigNumber;
export declare function getBalanceUsdFromAmount(amount: BigNumber, tokenInfo: DetailTokenInPool): BigNumber;
export declare function getAmountFromBalanceUsd(balanceUsd: BigNumber, tokenInfo: DetailTokenInPool): BigNumber;
export declare function SimulationSupply(appState1: ApplicationState, _from: EthAddress, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationBorrow(appState1: ApplicationState, _to: EthAddress, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationRepay(appState1: ApplicationState, _from: EthAddress, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationWithdraw(appState1: ApplicationState, _to: EthAddress, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationClaimReward(appState1: ApplicationState, _to: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationConvertReward(appState1: ApplicationState, from: EthAddress, to: EthAddress, _amount: string): Promise<ApplicationState>;
