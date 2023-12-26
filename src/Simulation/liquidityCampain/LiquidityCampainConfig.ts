import { BASE18, NETWORKS } from "../../utils";

export const LIQUIDITY_TOKENS_NAME = {
    TOD: "TOD Vault",
    TRAVA: "Trava Vault",
};

export const listLiquidityVault = {
    [NETWORKS.bscTestnet.chainId]: [
      {
        id: "TRAVA",
        name: "Trava",
        code: "TRAVA",
        reserveDecimals: BASE18.toFixed(),
        underlyingAddress: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
        priceUnderlyingAddress: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
        stakedTokenAddress: "0x1537263E42f81424A5099f992c1111D9d8c012B3",
        claimable: true,
        tokenName: LIQUIDITY_TOKENS_NAME.TRAVA,
        rewardToken: {
          symbol: "TRAVA",
          address: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
          decimals: BASE18.toFixed()
        }
      },
      {
        id: "TOD",
        name: "TOD",
        code: "TOD",
        reserveDecimals: BASE18.toFixed(),
        underlyingAddress: "0x8ADE9A293528EB21f2fD9d7fF6eD919Adf1AdEC7",
        priceUnderlyingAddress: "0x8ADE9A293528EB21f2fD9d7fF6eD919Adf1AdEC7",
        stakedTokenAddress: "0x58FDCe55D226491B03A440192C85Cb6CDfB05a42",
        claimable: true,
        tokenName: LIQUIDITY_TOKENS_NAME.TOD,
        rewardToken: {
          symbol: "TRAVA",
          address: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
          decimals: BASE18.toFixed()
        }
      },
    ],
    [NETWORKS.bscMainnet.chainId]: [
        {
            id: "TRAVA",
            name: "Trava",
            code: "TRAVA",
            reserveDecimals: BASE18.toFixed(),
            underlyingAddress: "",
            priceUnderlyingAddress: "",
            stakedTokenAddress: "",
            claimable: true,
            tokenName: LIQUIDITY_TOKENS_NAME.TRAVA,
            rewardToken: {
              symbol: "TRAVA",
              address: "",
              decimals: BASE18.toFixed()
            }
          },
          {
            id: "TOD",
            name: "TOD",
            code: "TOD",
            reserveDecimals: BASE18.toFixed(),
            underlyingAddress: "",
            priceUnderlyingAddress: "",
            stakedTokenAddress: "",
            claimable: true,
            tokenName: LIQUIDITY_TOKENS_NAME.TOD,
            rewardToken: {
              symbol: "TRAVA",
              address: "",
              decimals: BASE18.toFixed()
            }
          },
    ]
  }
  