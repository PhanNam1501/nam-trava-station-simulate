import Dec from "decimal.js";
import { set as dfsTokensSetConfig } from "@zennomi/tokens";
import { Config, Network, Networks } from "./types";

Dec.set({
  rounding: Dec.ROUND_DOWN,
  toExpPos: 9e15,
  toExpNeg: -9e15,
  precision: 100,
});

/**
 *
 * @type {Networks}
 */
export const NETWORKS: Networks = {
  bsc: {
    chainId: 97,
    chainName: "Binance Smart Chain Testnet",
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
    iconUrls: [],
    rpcUrls: [],
    nativeCurrency: { name: "BNB", decimals: 18, symbol: "BNB" },
  },
};

/**
 *
 */
export const CONFIG: Config = {
  chainId: NETWORKS.bsc.chainId,
  testingMode: false,
};

/**
 *
 * @param chainId
 */
export const getNetworkData = (chainId: number): Network => {
  const networkData: Network | undefined = Object.values(NETWORKS).find(
    (network) => network.chainId === +chainId
  );

  if (!networkData)
    throw new Error(`Cannot find network data for chainId: ${chainId}`);

  return networkData;
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
