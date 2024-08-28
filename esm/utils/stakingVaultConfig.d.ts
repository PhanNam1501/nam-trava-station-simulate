export declare const VAULT_TYPES: {
    FARMING: string;
    FARMING_BURN: string;
    BASE: string;
    REWARD_ON_FTM: string;
};
export declare const FILTER_MODE: {
    LIVE: string;
    ENDED: string;
    CLOSED: string;
};
export declare const TOKENS_NAME: {
    BNB: string;
    BUSD: string;
    ORAI: string;
    TRAVA_ON_BSC: string;
    TRAVA_ON_FTM: string;
    TRAVA_ON_ETH: string;
    TRAVA_ON_CURRENT_NETWORK: string;
    TRAVA_BNB_LP: string;
    TRAVA_ETH_LP: string;
    TRAVA_FTM_LP: string;
};
export declare const listStakingVault: {
    [x: string]: ({
        id: string;
        name: string;
        code: string;
        reserveDecimals: string;
        underlyingAddress: string;
        priceUnderlyingAddress: string;
        lpAddress: string;
        stakedTokenAddress: string;
        claimable: boolean;
        tokenName: string;
        filterMode: string;
        rewardToken: {
            symbol: string;
            address: string;
            decimals: string;
        };
        lockedUntil?: undefined;
        badge?: undefined;
        lpLink?: undefined;
    } | {
        id: string;
        name: string;
        code: string;
        reserveDecimals: string;
        underlyingAddress: string;
        priceUnderlyingAddress: string;
        lpAddress: string;
        stakedTokenAddress: string;
        claimable: boolean;
        lockedUntil: number;
        badge: string;
        lpLink: string;
        tokenName: string;
        filterMode: string;
        rewardToken: {
            symbol: string;
            address: string;
            decimals: string;
        };
    })[] | ({
        id: string;
        code: string;
        name: string;
        reserveDecimals: string;
        underlyingAddress: string;
        priceUnderlyingAddress: string;
        lpAddress: string;
        stakedTokenAddress: string;
        claimable: boolean;
        startTimeClaimAll: number;
        badge: string;
        vaultType: string;
        tokenName: string;
        filterMode: string;
        rewardToken: {
            symbol: string;
            address: string;
            decimals: string;
        };
        lpLink?: undefined;
    } | {
        id: string;
        code: string;
        name: string;
        reserveDecimals: string;
        underlyingAddress: string;
        priceUnderlyingAddress: string;
        lpAddress: string;
        stakedTokenAddress: string;
        claimable: boolean;
        badge: string;
        lpLink: string;
        vaultType: string;
        tokenName: string;
        filterMode: string;
        rewardToken: {
            symbol: string;
            address: string;
            decimals: string;
        };
        startTimeClaimAll?: undefined;
    } | {
        id: string;
        code: string;
        name: string;
        reserveDecimals: string;
        underlyingAddress: string;
        priceUnderlyingAddress: string;
        lpAddress: string;
        stakedTokenAddress: string;
        claimable: boolean;
        badge: string;
        vaultType: string;
        tokenName: string;
        filterMode: string;
        rewardToken: {
            symbol: string;
            address: string;
            decimals: string;
        };
        startTimeClaimAll?: undefined;
        lpLink?: undefined;
    } | {
        id: string;
        code: string;
        name: string;
        reserveDecimals: string;
        underlyingAddress: string;
        priceUnderlyingAddress: string;
        lpAddress: string;
        stakedTokenAddress: string;
        claimable: boolean;
        vaultType: string;
        tokenName: string;
        filterMode: string;
        rewardToken: {
            symbol: string;
            address: string;
            decimals: string;
        };
        startTimeClaimAll?: undefined;
        badge?: undefined;
        lpLink?: undefined;
    })[];
};
