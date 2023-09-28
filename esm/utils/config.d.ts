import { Config, ContractNetwork, Network, Networks } from "./types";
import BigNumber from "bignumber.js";
/**
 *
 * @type {Networks}
 */
export declare const NETWORKS: Networks;
/**
 *
 */
export declare const CONFIG: Config;
/**
 *
 * @param chainId
 */
export declare const getNetworkData: (chainId: number) => Network;
/**
 *
 * @param config
 */
export declare const configure: (config: Config) => void;
export declare const CONTRACT_NETWORK: ContractNetwork;
export declare const percentMul: (value: BigNumber, percentage: BigNumber) => BigNumber;
export declare const wadDiv: (a: BigNumber, b: BigNumber) => BigNumber;
export declare const YEAR_TO_SECONDS: number;
export declare const BASE18: BigNumber;
export declare const MAX_UINT256: string;
export declare const PERCENTAGE_FACTOR: BigNumber;
export declare const HALF_PERCENT: BigNumber;
export declare const WAD: BigNumber;
