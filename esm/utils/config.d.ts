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
export declare const percentMul: (_value: string, percentage: string) => BigNumber;
export declare const wadDiv: (_a: string, _b: string) => BigNumber;
export declare const MAX_UINT256: string;
export declare const PERCENTAGE_FACTOR: BigNumber;
export declare const HALF_PERCENT: BigNumber;
export declare const WAD: BigNumber;
