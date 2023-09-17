import { set as dfsTokensSetConfig } from "@zennomi/tokens";
import { Config, ContractNetwork, Network, Networks } from "./types";
import { Contract, ethers } from "ethers";
import BigNumber from "bignumber.js";

/**
 *
 * @type {Networks}
 */
export const NETWORKS: Networks = {
  bscTestnet: {
    chainId: 97,
    chainName: "Binance Smart Chain Testnet",
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
    iconUrls: [],
    rpcUrls: [],
    nativeCurrency: { name: "BNB", decimals: 18, symbol: "BNB" },
  },
  bscMainnet: {
    chainId: 56,
    chainName: "Binance Smart Chain Mainnet",
    blockExplorerUrls: ["https://bscscan.com/"],
    iconUrls: [],
    rpcUrls: [],
    nativeCurrency: { name: "BNB", decimals: 18, symbol: "BNB" },
  },
};

/**
 *
 */
export const CONFIG: Config = {
  chainId: NETWORKS.bscTestnet.chainId,
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

export const CONTRACT_NETWORK: ContractNetwork = {
  bscTestnet: {
    WBNB: "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
    TRAVA_LENDING_POOL_MARKET: ["0x50794d89dbdb2d3aba83820bc3557ff076ca481b"],
    ORACLE_ADDRESS: "0x3e2320C81FdB8919bC5771CBA897B9C683506140",
    TRAVA_TOKEN_IN_MARKET: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
    MULTI_CALL_ADDRESS: "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78",
    NFT_CORE_ADDRESS: "0xd2Eca5a421db7c2e2aC88Da684214B52915A66b3",
    NFT_MARKETPLACE: "0x6C5844D1681C346c0f95669B1efe394ef12F1B93",
    NFT_MANAGER: "0xA91A365D2e3D280553E96D5afA157e6A3e50890A",
    NFT_COLLECTION: "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1",
    TRAVA_TOKEN: "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37",
  },
};

export const percentMul = (_value: string, percentage: string): BigNumber => {
  let value: BigNumber = BigNumber(_value);
  if (value.toString() == "0" || percentage == "0") {
    return BigNumber(0);
  }
  if (value.isGreaterThanOrEqualTo(BigNumber(MAX_UINT256).minus(HALF_PERCENT))) {
    throw new Error("MATH_MULTIPLICATION_OVERFLOW")
  }
  return BigNumber(value.multipliedBy(percentage).plus(HALF_PERCENT).div(PERCENTAGE_FACTOR).toFixed(0))
}

export const wadDiv = (_a: string, _b: string): BigNumber => {
  let a = BigNumber(_a);
  let b = BigNumber(_b);

  if(a.isZero()) {
    throw new Error("MATH_DIVISION_BY_ZERO")
  }
  let halfB = b.div(2);

  if(a.isGreaterThan(BigNumber(MAX_UINT256).minus(halfB).div(WAD))) {
    throw new Error("MATH_MULTIPLICATION_OVERFLOW")
  }
  return a.multipliedBy(WAD).plus(halfB).div(b)
}

export const MAX_UINT256: string = ethers.MaxUint256.toString()
export const PERCENTAGE_FACTOR: BigNumber = BigNumber(1e4)
export const HALF_PERCENT: BigNumber = PERCENTAGE_FACTOR.div(2)
export const WAD: BigNumber = BigNumber(1e18)