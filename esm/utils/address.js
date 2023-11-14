import { NETWORKS, CONFIG } from "./config";
import { toChecksumAddress } from 'ethereumjs-util';
export const listAddr = {
    [NETWORKS.bscTestnet.chainId]: {
        TRAVA_LENDING_POOL_MARKET: "0x50794d89dbdb2d3aba83820bc3557ff076ca481b",
        ORACLE_ADDRESS: "0x3e2320C81FdB8919bC5771CBA897B9C683506140",
        TRAVA_TOKEN_IN_MARKET: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
        TRAVA_TOKEN_IN_STAKING: "0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b",
        NFT_CORE_ADDRESS: "0xd2Eca5a421db7c2e2aC88Da684214B52915A66b3",
        MULTI_CALL_ADDRESS: "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78",
        NFT_SELL_ADDRESS: "0x6C5844D1681C346c0f95669B1efe394ef12F1B93",
        NFT_AUCTION_ADDRESS: "0xD3DEba29db83A4Be4A3635d20e3FAe791298086C",
        NFT_MANAGER_ADDRESS: "0xA91A365D2e3D280553E96D5afA157e6A3e50890A",
        NFT_COLLECTION_ADDRESS: "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1",
        WBNB_ADDRESS: "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
        TRAVA_TOKEN: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
        INCENTIVE_CONTRACT: "0x8f5D5A6C9938d397be1f99F19dE7bF54B68210cb",
        VESTING_TRAVA_ADDRESS: "0xeD562cb35EB497Bce7C7789d7b4A0463ab60955b",
        WBNB_TRAVA_LP_ADDRESS: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
        VE_TRAVA_ADDRESS: "0x7E41803de7781f53D1901A3d70A3D3747b3B3B63",
        INCENTIVE_VAULT_ADDRESS: "0xf8F913DFd1Cfd0ef4AE8a04f41B47441c1d0A893",
        TRAVA_TOKEN_ADDRESS_GOVENANCE: '0xCE9f0487f07988003f511d6651153a6dacC32f50',
        TOKEN_VALUATOR_ADDRESS: '0x1b2E2a052980D31F9E31fdd5253B562dB248DCB2',
        LP_VALUATOR_ADDRESS: '0x677e8Ecb6Cf81b680CbaAF60571e9Fe2028A8CbD',
        RTRAVA_TOKEN_ADDRESS: '0x4a9901cdAfDFB2aC614c12627E0A5B45A63929d6',
        NFT_FARMING_BASE_EXP: "0xb0c3137d7C7d8cf994b9931359A97605dF277815"
    },
    // MUST BE FILL MAINNET ADDRESS HERE. NOW IS TESTNET
    [NETWORKS.bscMainnet.chainId]: {
        TRAVA_LENDING_POOL_MARKET: "0x75de5f7c91a89c16714017c7443eca20c7a8c295",
        ORACLE_ADDRESS: "0x7Cd53b71Bf56Cc6C9c9B43719FE98e7c360c35DF",
        TRAVA_TOKEN_IN_MARKET: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
        TRAVA_TOKEN_IN_STAKING: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
        NFT_CORE_ADDRESS: "0xAcBfD38C52Ae0344D47A7335D072DE5e3BC49f91",
        MULTI_CALL_ADDRESS: "0x956BBC80253755A48FBcCC6783BBB418C793A257",
        NFT_SELL_ADDRESS: "0x39728bB898f6e44D0c0EC9d7934976e5ceA4DcAf",
        NFT_AUCTION_ADDRESS: "0xc715BBe707d39524173c0635611cD69c250c59CB",
        NFT_MANAGER_ADDRESS: "0xDE4e584DA24e9a528eCb3ffD0AaccBAEe2EfD137",
        NFT_COLLECTION_ADDRESS: "0x9C3E857eCe6224544aA77c1A6e500d8Fa1c9C102",
        WBNB_ADDRESS: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        TRAVA_TOKEN: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
        INCENTIVE_CONTRACT: "0x4c481E66798c6C82aF77d1e14d3233fE5D592A0b",
        VESTING_TRAVA_ADDRESS: "0xa2FC194C9f8806501cab9d07Ed03d2FaFF16a618",
        WBNB_TRAVA_LP_ADDRESS: "0x865c77d4ff6383e06c58350a2cfb95cca2c0f056",
        VE_TRAVA_ADDRESS: "0xedf6a93772EEcFB1300F61F6C1aE9680c33996A2",
        INCENTIVE_VAULT_ADDRESS: "0xB2E1105969689E931BbBB45a727AE019C8246692",
        TRAVA_TOKEN_ADDRESS_GOVENANCE: '0x0391bE54E72F7e001f6BBc331777710b4f2999Ef',
        TOKEN_VALUATOR_ADDRESS: '0x6a16D2019A938Cdb5666784d605c08FafC4b8DFB',
        LP_VALUATOR_ADDRESS: '0xb551b74044dfe4ebac72298fb383BEF9152fd8C4',
        RTRAVA_TOKEN_ADDRESS: '0x170772A06aFfC0d375cE90Ef59C8eC04c7ebF5D2',
        NFT_FARMING_BASE_EXP: "0xc7a3a214206d6677b3321865AfbD84a417414Db3",
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
