import { EthAddress } from "./types";
export declare const listAddr: {
    [x: string]: {
        TRAVA_LENDING_POOL_MARKET: string;
        ORACLE_ADDRESS: string;
        TRAVA_TOKEN_IN_MARKET: string;
        TRAVA_TOKEN_IN_STAKING: string;
        NFT_CORE_ADDRESS: string;
        MULTI_CALL_ADDRESS: string;
        NFT_SELL_ADDRESS: string;
        NFT_AUCTION_ADDRESS: string;
        NFT_MANAGER_ADDRESS: string;
        NFT_COLLECTION_ADDRESS: string;
        BNB_ADDRESS: string;
        WBNB_ADDRESS: string;
        USDT_ADDRESS: string;
        TRAVA_TOKEN: string;
        INCENTIVE_CONTRACT: string;
        VESTING_TRAVA_ADDRESS: string;
        WBNB_TRAVA_LP_ADDRESS: string;
        VE_TRAVA_ADDRESS: string;
        INCENTIVE_VAULT_ADDRESS: string;
        TRAVA_TOKEN_ADDRESS_GOVENANCE: string;
        TOKEN_VALUATOR_ADDRESS: string;
        LP_VALUATOR_ADDRESS: string;
        RTRAVA_TOKEN_ADDRESS: string;
        NFT_FARMING_BASE_EXP: string;
        NFT_TICKET: string;
        DILUTION_STAKING: string;
        BUSD_TOKEN: string;
        TOD_TOKEN: string;
        BUSD_TOD_LC_ADDRESS: string;
        RouterAddress: string;
        FactoryAddress: string;
        VE_TRAVA_MARKETPLACE_ADDRESS?: undefined;
        BUSD_TOKEN_ADDRESS?: undefined;
    } | {
        TRAVA_LENDING_POOL_MARKET: string;
        ORACLE_ADDRESS: string;
        TRAVA_TOKEN_IN_MARKET: string;
        TRAVA_TOKEN_IN_STAKING: string;
        NFT_CORE_ADDRESS: string;
        MULTI_CALL_ADDRESS: string;
        NFT_SELL_ADDRESS: string;
        NFT_AUCTION_ADDRESS: string;
        NFT_MANAGER_ADDRESS: string;
        NFT_COLLECTION_ADDRESS: string;
        BNB_ADDRESS: string;
        WBNB_ADDRESS: string;
        USDT_ADDRESS: string;
        TRAVA_TOKEN: string;
        INCENTIVE_CONTRACT: string;
        VESTING_TRAVA_ADDRESS: string;
        WBNB_TRAVA_LP_ADDRESS: string;
        VE_TRAVA_ADDRESS: string;
        INCENTIVE_VAULT_ADDRESS: string;
        TRAVA_TOKEN_ADDRESS_GOVENANCE: string;
        TOKEN_VALUATOR_ADDRESS: string;
        LP_VALUATOR_ADDRESS: string;
        RTRAVA_TOKEN_ADDRESS: string;
        VE_TRAVA_MARKETPLACE_ADDRESS: string;
        BUSD_TOKEN_ADDRESS: string;
        NFT_FARMING_BASE_EXP: string;
        NFT_TICKET: string;
        DILUTION_STAKING: string;
        BUSD_TOKEN: string;
        TOD_TOKEN: string;
        BUSD_TOD_LC_ADDRESS: string;
        RouterAddress: string;
        FactoryAddress: string;
    };
};
export declare const getAddr: (name: string, chainId?: number | string) => EthAddress;
export declare const convertHexStringToAddress: (hexString: EthAddress) => EthAddress;
