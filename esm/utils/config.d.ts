import { Config, Networks } from "./types";
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
 * @param config
 */
export declare const configure: (config: Config) => void;
export declare const percentMul: (value: BigNumber, percentage: BigNumber) => BigNumber;
export declare const wadDiv: (a: BigNumber, b: BigNumber) => BigNumber;
export declare const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const MAX_LOCK_TIMES: number;
export declare const YEAR_TO_SECONDS: number;
export declare const MONTH_TO_SECONDS: number;
export declare const WEEK_TO_SECONDS: number;
export declare const DAY_TO_SECONDS: number;
export declare const HOUR_TO_SECONDS: number;
export declare const BASE18: BigNumber;
export declare const MAX_UINT256: string;
export declare const PERCENTAGE_FACTOR: BigNumber;
export declare const HALF_PERCENT: BigNumber;
export declare const WAD: BigNumber;
export declare const FEE_AUCTION_PERCENTAGE: number;
export declare const MINIMUM_BID_STEP_PERCENT: number;
export declare const tramline_api = "https://tramlines-backend.trava.finance/api";
export declare const centic_api = "https://develop.centic.io/dev";
export declare const centic_api_key = "3ATJtOInT7QfaV2pvAdhlRVMHbztLjyyAL16UrKe5Q6vMtlR";
export declare const bnb = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
