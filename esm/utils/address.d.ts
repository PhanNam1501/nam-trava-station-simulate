import { EthAddress } from "./types";
export declare const listAddr: {
    [x: number]: {
        TRAVA_LENDING_POOL_MARKET: string;
        ORACLE_ADDRESS: string;
        TRAVA_TOKEN_IN_MARKET: string;
        NFT_CORE_ADDRESS: string;
        MULTI_CALL_ADDRESS: string;
        NFT_SELL_ADDRESS: string;
        NFT_MANAGER_ADDRESS: string;
        NFT_COLLECTION_ADDRESS: string;
        WBNB_ADDRESS: string;
        TRAVA_TOKEN: string;
        INCENTIVE_CONTRACT: string;
    };
};
export declare const getAddr: (name: string, chainId?: number) => EthAddress;
export declare const convertHexStringToAddress: (hexString: EthAddress) => EthAddress;
