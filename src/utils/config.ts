import { set as dfsTokensSetConfig } from "@zennomi/tokens";
import { Config, ContractNetwork, Network, Networks } from "./types";
import { Contract } from "ethers";


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

export const CONTRACT_NETWORK: ContractNetwork = {
   bsc: {
    WBNB: "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
    TRAVA_LENDING_POOL_MARKET: ["0x6df52f798740504c24ccd374cf7ce81b28ce8330"],
    ORACLE_ADDRESS: "0x3e2320C81FdB8919bC5771CBA897B9C683506140",
    TRAVA_TOKEN_IN_MARKET: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
    MULTI_CALL_ADDRESS: "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78",
    NFT_CORE_ADDRESS: "0xd2Eca5a421db7c2e2aC88Da684214B52915A66b3",
    NFT_MARKETPLACE: "0xf5804062c93b0C725e277F772b5DA06749005cd5",
    NFT_MANAGER: "0xA91A365D2e3D280553E96D5afA157e6A3e50890A",
    NFT_COLLECTION: "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1",
    TRAVA_TOKEN: "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37"
   }
};