import { BASE18, NETWORKS } from "../../utils";

export const TOKENS_NAME = {
    TOD: "TOD Vault",
    TRAVA: "Trava Vault",
};

export const listLiquidityVault = {
    [NETWORKS.bscTestnet.chainId]: [
      {
        id: "TRAVA",
        name: "Trava",
        code: "TRAVA",
        reserveDecimals: "18",
        underlyingAddress: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
        priceUnderlyingAddress: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
        stakedTokenAddress: "0x1537263E42f81424A5099f992c1111D9d8c012B3",
        claimable: true,
        tokenName: TOKENS_NAME.TRAVA,
        rewardToken: {
          symbol: "TRAVA",
          address: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
          decimals: "18"
        }
      },
      {
        id: "TOD",
        name: "TOD",
        code: "TOD",
        reserveDecimals: "9",
        underlyingAddress: "0x8ADE9A293528EB21f2fD9d7fF6eD919Adf1AdEC7",
        priceUnderlyingAddress: "0x8ADE9A293528EB21f2fD9d7fF6eD919Adf1AdEC7",
        stakedTokenAddress: "0x58FDCe55D226491B03A440192C85Cb6CDfB05a42",
        claimable: true,
        tokenName: TOKENS_NAME.TOD,
        rewardToken: {
          symbol: "TRAVA",
          address: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
          decimals: "18"
        }
      },
    ],
    [NETWORKS.bscMainnet.chainId]: [
        {
            id: "TRAVA",
            name: "Trava",
            code: "TRAVA",
            reserveDecimals: "18",
            underlyingAddress: "",
            priceUnderlyingAddress: "",
            stakedTokenAddress: "",
            claimable: true,
            tokenName: TOKENS_NAME.TRAVA,
            rewardToken: {
              symbol: "TRAVA",
              address: "",
              decimals: "18"
            }
          },
          {
            id: "TOD",
            name: "TOD",
            code: "TOD",
            reserveDecimals: "9",
            underlyingAddress: "",
            priceUnderlyingAddress: "",
            stakedTokenAddress: "",
            claimable: true,
            tokenName: TOKENS_NAME.TOD,
            rewardToken: {
              symbol: "TRAVA",
              address: "",
              decimals: "18"
            }
          },
    ]
  }
  