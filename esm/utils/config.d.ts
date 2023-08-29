import { Config, ContractNetwork, Network, Networks } from "./types";
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
export declare const MAX_UINT256: string;
