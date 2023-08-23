import { NETWORKS, CONFIG } from "./config";
import { EthAddress } from "./types";

export const listAddr = {
  [NETWORKS.bsc.chainId]: {
    TRAVA_LENDING_POOL_MARKET: "0x6df52f798740504c24ccd374cf7ce81b28ce8330",
    ORACLE_ADDRESS: "0x3e2320C81FdB8919bC5771CBA897B9C683506140",
    TRAVA_TOKEN_IN_MARKET: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
    NFT_CORE_ADDRESS: "0xd2Eca5a421db7c2e2aC88Da684214B52915A66b3",
    MULTI_CALL_ADDRESS: "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78",
    NFT_SELL_ADDRESS: "0xf5804062c93b0C725e277F772b5DA06749005cd5",
    NFT_MANAGER_ADDRESS: "0xA91A365D2e3D280553E96D5afA157e6A3e50890A",
    NFT_COLLECTION_ADDRESS: "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1",
    WBNB_ADDRESS: "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
    TRAVA_TOKEN: "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37",
  },
  // MUST BE FILL MAINNET ADDRESS HERE. NOW IS TESTNET
  [NETWORKS.bscMainnet.chainId]: {
    TRAVA_LENDING_POOL_MARKET: "0x75de5f7c91a89c16714017c7443eca20c7a8c295", // mainnet
    ORACLE_ADDRESS: "0x3e2320C81FdB8919bC5771CBA897B9C683506140", // testnet
    TRAVA_TOKEN_IN_MARKET: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435", // testnet
    NFT_CORE_ADDRESS: "0xd2Eca5a421db7c2e2aC88Da684214B52915A66b3", // testnet
    MULTI_CALL_ADDRESS: "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78", // testnet
    NFT_SELL_ADDRESS: "0xf5804062c93b0C725e277F772b5DA06749005cd5", // testnet
    NFT_MANAGER_ADDRESS: "0xA91A365D2e3D280553E96D5afA157e6A3e50890A", // testnet
    NFT_COLLECTION_ADDRESS: "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1", // testnet
    WBNB_ADDRESS: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // mainnet
    TRAVA_TOKEN: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef", // mainnet
  },
};

export const getAddr = (name: string, chainId?: number): EthAddress => {
  const _chainId: number =
    typeof chainId === "undefined" ? CONFIG.chainId : chainId;

  const addr = listAddr[_chainId];

  // skip this check if we're in testing mode
  if (!CONFIG.testingMode) {
    if (!addr) throw new Error(`Cannot find address for chainId: ${_chainId}.`);
    if (!addr[name as keyof typeof addr])
      throw new Error(
        `Cannot find address for name: ${name} (chainId: ${_chainId}).`
      );
  }

  if (addr[name as keyof typeof addr]) return addr[name as keyof typeof addr]!;
  else throw new Error(`Invalid addr`);
};
