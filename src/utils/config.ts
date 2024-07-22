import { set as dfsTokensSetConfig } from "@zennomi/tokens";
import { Config, ContractNetwork, Network, Networks } from "./types";
import { Contract, ethers } from "ethers";
import BigNumber from "bignumber.js";
import { DivisionByZeroError, MultiplicationOverflowError } from "./error";

/**
 *
 * @type {Networks}
 */
export const NETWORKS: Networks = {
  bscTestnet: {
    chainName: "Binance Smart Chain Testnet",
    chainId: 97,
    rpcUrls: ["https://bsc.publicnode.com"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
    nativeCurrency: {
      name: "Binance Smart Chain",
      decimals: 18,
      symbol: "BNB"
    },
    iconUrls: []
  },
  bscMainnet: {
    chainName: "Binance Smart Chain",
    chainId: 56,
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com/"],
    nativeCurrency: {
      name: "Binance Smart Chain",
      decimals: 18,
      symbol: "BNB"
    },
    iconUrls: []
  }
};

/**
 *
 */
export const CONFIG: Config = {
  chainId: NETWORKS.bscMainnet.chainId,
  testingMode: false,
};

/**
 *
 * @param config
 */
export const configure = (config: Config) => {
  if (!config || typeof config !== "object") throw new Error("Object expected");

  const newKeys: Array<string> = Object.keys(config);

  newKeys.forEach((key) => {
    CONFIG[key as keyof Config] = config[key as keyof Config];
    if (key === "chainId") dfsTokensSetConfig("network", config[key]);
  });
};

export const percentMul = (value: BigNumber, percentage: BigNumber): BigNumber => {
  if (value.toFixed(0) == "0" || percentage.isZero()) {
    return BigNumber(0);
  }
  if (value.isGreaterThanOrEqualTo(BigNumber(MAX_UINT256).minus(HALF_PERCENT))) {
    throw new MultiplicationOverflowError("MATH_MULTIPLICATION_OVERFLOW");
  }
  return BigNumber(value.multipliedBy(percentage).plus(HALF_PERCENT).div(PERCENTAGE_FACTOR).toFixed(0))
}

export const wadDiv = (a: BigNumber, b: BigNumber): BigNumber => {

  if(a.toFixed(0) == "0") {
    throw new DivisionByZeroError("MATH_DIVISION_BY_ZERO");
  }
  let halfB = b.div(2);

  if(a.isGreaterThan(BigNumber(MAX_UINT256).minus(halfB).div(WAD))) {
    throw new MultiplicationOverflowError("MATH_MULTIPLICATION_OVERFLOW");
  }
  return a.multipliedBy(WAD).plus(halfB).div(b)
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const MAX_LOCK_TIMES = 4 * 365 * 24 * 60 * 60
export const YEAR_TO_SECONDS = 365 * 24 * 60 * 60
export const MONTH_TO_SECONDS = 30 * 24 * 60 * 60
export const WEEK_TO_SECONDS = 7 * 24 * 60 * 60
export const DAY_TO_SECONDS = 24 * 60 * 60
export const HOUR_TO_SECONDS = 60 * 60
export const BASE18 = BigNumber("1000000000000000000");
export const MAX_UINT256: string = ethers.MaxUint256.toString()
export const PERCENTAGE_FACTOR: BigNumber = BigNumber(1e4)
export const HALF_PERCENT: BigNumber = PERCENTAGE_FACTOR.div(2)
export const WAD: BigNumber = BigNumber(1e18)
export const FEE_AUCTION_PERCENTAGE = 5 / 100;
export const MINIMUM_BID_STEP_PERCENT = 5 / 100;
export const tramline_api = "https://tramlines-backend.trava.finance/api"
export const centic_api = "https://develop.centic.io/dev"
export const centic_api_key = "3ATJtOInT7QfaV2pvAdhlRVMHbztLjyyAL16UrKe5Q6vMtlR"
export const bnb = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";