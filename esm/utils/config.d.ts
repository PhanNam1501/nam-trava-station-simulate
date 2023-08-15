import { Config, Network, Networks } from "./types";
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
