export declare const LIQUIDITY_TOKENS_NAME: {
    TOD: string;
    TRAVA: string;
};
export declare const listLiquidityVault: {
    [x: string]: {
        id: string;
        name: string;
        code: string;
        reserveDecimals: string;
        underlyingAddress: string;
        priceUnderlyingAddress: string;
        otherTokenInLpAddress: string;
        lpAddress: string;
        stakedTokenAddress: string;
        claimable: boolean;
        tokenName: string;
        rewardToken: {
            symbol: string;
            address: string;
            decimals: string;
        };
    }[];
};
