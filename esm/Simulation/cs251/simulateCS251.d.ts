import { BigNumber } from "bignumber.js";
import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function getExchangeRate(appState: ApplicationState, exchange: EthAddress): Promise<BigNumber>;
export declare function addLiquidity(appState: ApplicationState, exchange: EthAddress, tokenAddr: EthAddress, // Declare and provide a value for tokenAddr
from: EthAddress, amountETH: uint256): Promise<ApplicationState>;
export declare function removeLiquidity(appState: ApplicationState, exchange: EthAddress, tokenAddr: EthAddress, // Declare and provide a value for tokenAddr
amountETH: uint256, to: EthAddress): Promise<ApplicationState>;
export declare function swapAssets(appState: ApplicationState, exchange: EthAddress, amountIn: uint256, from: EthAddress, tokenAddr: EthAddress, isSwapForETH: boolean): Promise<ApplicationState>;
