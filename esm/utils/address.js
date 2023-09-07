import { NETWORKS, CONFIG } from "./config";
import { toChecksumAddress } from 'ethereumjs-util';
export const listAddr = {
    [NETWORKS.bsc.chainId]: {
        TRAVA_LENDING_POOL_MARKET: "0x50794d89dbdb2d3aba83820bc3557ff076ca481b",
        ORACLE_ADDRESS: "0x3e2320C81FdB8919bC5771CBA897B9C683506140",
        TRAVA_TOKEN_IN_MARKET: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
        NFT_CORE_ADDRESS: "0xd2Eca5a421db7c2e2aC88Da684214B52915A66b3",
        MULTI_CALL_ADDRESS: "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78",
        NFT_SELL_ADDRESS: "0xf5804062c93b0C725e277F772b5DA06749005cd5",
        NFT_MANAGER_ADDRESS: "0xA91A365D2e3D280553E96D5afA157e6A3e50890A",
        NFT_COLLECTION_ADDRESS: "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1",
        WBNB_ADDRESS: "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
        TRAVA_TOKEN: "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37",
        INCENTIVE_CONTRACT: "0x8f5D5A6C9938d397be1f99F19dE7bF54B68210cb",
    },
    // MUST BE FILL MAINNET ADDRESS HERE. NOW IS TESTNET
    [NETWORKS.bscMainnet.chainId]: {
        TRAVA_LENDING_POOL_MARKET: "0x75de5f7c91a89c16714017c7443eca20c7a8c295",
        ORACLE_ADDRESS: "0x3e2320C81FdB8919bC5771CBA897B9C683506140",
        TRAVA_TOKEN_IN_MARKET: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
        NFT_CORE_ADDRESS: "0xd2Eca5a421db7c2e2aC88Da684214B52915A66b3",
        MULTI_CALL_ADDRESS: "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78",
        NFT_SELL_ADDRESS: "0x39728bB898f6e44D0c0EC9d7934976e5ceA4DcAf",
        NFT_MANAGER_ADDRESS: "0xA91A365D2e3D280553E96D5afA157e6A3e50890A",
        NFT_COLLECTION_ADDRESS: "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1",
        WBNB_ADDRESS: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        TRAVA_TOKEN: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
        INCENTIVE_CONTRACT: "0x8f5D5A6C9938d397be1f99F19dE7bF54B68210cb", // testnet
    },
};
export const getAddr = (name, chainId) => {
    const _chainId = typeof chainId === "undefined" ? CONFIG.chainId : chainId;
    const addr = listAddr[_chainId];
    // skip this check if we're in testing mode
    if (!CONFIG.testingMode) {
        if (!addr)
            throw new Error(`Cannot find address for chainId: ${_chainId}.`);
        if (!addr[name])
            throw new Error(`Cannot find address for name: ${name} (chainId: ${_chainId}).`);
    }
    if (addr[name])
        return addr[name];
    else
        throw new Error(`Invalid addr`);
};
export const convertHexStringToAddress = (hexString) => {
    String(hexString).toLowerCase();
    const strippedHex = hexString.replace(/^0x/, '');
    return toChecksumAddress(`0x${strippedHex}`);
};
