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
        otherTokenInLpAddress: "0x2CEC38C779d6b962bc877777b6f70937d21c9c38",
        lpAddress: "0x85Ddc89670e6dF515B00A69e86916e3208feb8e3",
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
        underlyingAddress: "0xfca3cf5e82f595d4f20c24d007ae5e2e94fab2f0",
        priceUnderlyingAddress: "0xfca3cf5e82f595d4f20c24d007ae5e2e94fab2f0",
        otherTokenInLpAddress: "0x2CEC38C779d6b962bc877777b6f70937d21c9c38",
        lpAddress: "0x8E402D21cb184B84A55d7331f2C700d459ABADaa",
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
            otherTokenInLpAddress: "",
            lpAddress: "",
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
            otherTokenInLpAddress: "",
            lpAddress: "",
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
  