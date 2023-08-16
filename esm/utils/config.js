import { set as dfsTokensSetConfig } from "@zennomi/tokens";
/**
 *
 * @type {Networks}
 */
export const NETWORKS = {
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
export const CONFIG = {
    chainId: NETWORKS.bsc.chainId,
    testingMode: false,
};
/**
 *
 * @param chainId
 */
export const getNetworkData = (chainId) => {
    const networkData = Object.values(NETWORKS).find((network) => network.chainId === +chainId);
    if (!networkData)
        throw new Error(`Cannot find network data for chainId: ${chainId}`);
    return networkData;
};
/**
 *
 * @param config
 */
export const configure = (config) => {
    if (!config || typeof config !== "object")
        throw new Error("Object expected");
    const newKeys = Object.keys(config);
    newKeys.forEach((key) => {
        CONFIG[key] = config[key];
        if (key === "chainId")
            dfsTokensSetConfig("network", config[key]);
    });
};
