import { NETWORKS, CONFIG, BASE18 } from "./config";

export const VAULT_TYPES = {
  FARMING: "FARMING",
  FARMING_BURN: "FARMING_BURN",
  BASE: "BASE",
  REWARD_ON_FTM: "REWARD_ON_FTM",
};

export const FILTER_MODE = {
  LIVE: "LIVE",
  ENDED: "ENDED",
  CLOSED: "CLOSED"
};

export const TOKENS_NAME = {
  BNB: "BNB",
  BUSD: "BUSD",
  ORAI: "ORAI",

  TRAVA_ON_BSC: "TRAVA_ON_BSC",
  TRAVA_ON_FTM: "TRAVA_ON_FTM",
  TRAVA_ON_ETH: "TRAVA_ON_ETH",
  TRAVA_ON_CURRENT_NETWORK: "TRAVA_ON_CURRENT_NETWORK",

  TRAVA_BNB_LP: "TRAVA_BNB_LP",
  TRAVA_ETH_LP: "TRAVA_ETH_LP",
  TRAVA_FTM_LP: "TRAVA_FTM_LP",
};
export const listStakingVault = {
  [NETWORKS.bscTestnet.chainId]: [
    {
      id: "bsc-mainnet-travabnb",
      name: "Trava BNB",
      code: "BNB/TRAVA",
      reserveDecimals: BASE18.toFixed(),
      underlyingAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      priceUnderlyingAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      lpAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      stakedTokenAddress: "0xA36991E7FA207815f37e01E72DBC3b5b874D7F6C",
      claimable: true,
      tokenName: TOKENS_NAME.TRAVA_BNB_LP,
      filterMode: FILTER_MODE.LIVE,
      rewardToken: {
        symbol: "TRAVA",
        address: "0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b",
        decimals: BASE18.toFixed()
      }
    },
    {
      id: "trava",
      name: "Trava Token",
      code: "TRAVA",
      reserveDecimals: BASE18.toFixed(),
      underlyingAddress: "0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b",
      priceUnderlyingAddress: "0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b",
      lpAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      stakedTokenAddress: "0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF",
      claimable: true,
      tokenName: TOKENS_NAME.TRAVA_ON_BSC,
      filterMode: FILTER_MODE.LIVE,
      rewardToken: {
        symbol: "TRAVA",
        address: "0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b",
        decimals: BASE18.toFixed()
      }
    },
    {
      id: "bsc-mainnet-bnbtrava2",
      name: "Trava BNB",
      code: "BNB/TRAVA",
      reserveDecimals: BASE18.toFixed(),
      underlyingAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      priceUnderlyingAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      lpAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      stakedTokenAddress: "0xA36991E7FA207815f37e01E72DBC3b5b874D7F6C",
      claimable: true,
      lockedUntil: 1628624800000,
      badge: "3 months",
      lpLink: "https://pancakeswap.finance/add/BNB/0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
      tokenName: TOKENS_NAME.TRAVA_BNB_LP,
      filterMode: FILTER_MODE.LIVE,
      rewardToken: {
        symbol: "TRAVA",
        address: "0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b",
        decimals: BASE18.toFixed()
      }
    },
    {
      id: "bsc-mainnet-bnbtrava3",
      name: "Trava BNB",
      code: "BNB/TRAVA",
      reserveDecimals: BASE18.toFixed(),
      underlyingAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      priceUnderlyingAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      lpAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
      stakedTokenAddress: "0xA36991E7FA207815f37e01E72DBC3b5b874D7F6C",
      claimable: true,
      lockedUntil: 1628624800000,
      badge: "9 months",
      lpLink: "https://pancakeswap.finance/add/BNB/0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
      tokenName: TOKENS_NAME.TRAVA_BNB_LP,
      filterMode: FILTER_MODE.LIVE,
      rewardToken: {
        symbol: "TRAVA",
        address: "0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b",
        decimals: BASE18.toFixed()
      }
    },
  ],
  [NETWORKS.bscMainnet.chainId]: [
    {
      id: "bsc-mainnet-rtrava-farming",
      code: "rTRAVA",
      name: "rTRAVA",
      reserveDecimals: BASE18.toFixed(),
      underlyingAddress: "0x170772A06aFfC0d375cE90Ef59C8eC04c7ebF5D2",
      priceUnderlyingAddress: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
      lpAddress: "0x865c77d4ff6383e06c58350a2cfb95cca2c0f056",
      stakedTokenAddress: "0x17b173D4B80B0B5BB7E0f1E99F5962f2D51799Eb",
      claimable: true,
      startTimeClaimAll: 1634576400000,
      badge: "No Lock",
      vaultType: VAULT_TYPES.FARMING,
      tokenName: TOKENS_NAME.TRAVA_ON_BSC,
      filterMode: FILTER_MODE.LIVE,
      rewardToken: {
        symbol: "TRAVA",
        address: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
        decimals: BASE18.toFixed()
      }
    },
    {
      id: "bsc-mainnet-travabnb",
      code: "BNB/TRAVA",
      name: "BNB/TRAVA",
      reserveDecimals: BASE18.toFixed(),
      underlyingAddress: "0x865c77d4ff6383e06c58350a2cfb95cca2c0f056",
      priceUnderlyingAddress: "0x865c77d4ff6383e06c58350a2cfb95cca2c0f056",
      lpAddress: "0x865c77d4ff6383e06c58350a2cfb95cca2c0f056",
      stakedTokenAddress: "0xF04feE30118fdb83c0957C4f6AbdfDde977b9Aeb",
      claimable: true,
      badge: "No Lock",
      lpLink: "https://pancakeswap.finance/add/BNB/0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
      vaultType: VAULT_TYPES.FARMING,
      tokenName: TOKENS_NAME.TRAVA_BNB_LP,
      filterMode: FILTER_MODE.LIVE,
      rewardToken: {
        symbol: "TRAVA",
        address: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
        decimals: BASE18.toFixed()
      }
    },
    {
      id: "trava",
      code: "TRAVA",
      name: "TRAVA",
      reserveDecimals: BASE18.toFixed(),
      underlyingAddress: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
      priceUnderlyingAddress: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
      lpAddress: "0x865c77d4ff6383e06c58350a2cfb95cca2c0f056",
      stakedTokenAddress: "0xC5f0137ce42437d8f5eF25DA110F7FD7386178ec",
      claimable: true,
      badge: "No Lock",
      vaultType: VAULT_TYPES.FARMING,
      tokenName: TOKENS_NAME.TRAVA_ON_BSC,
      filterMode: FILTER_MODE.LIVE,
      rewardToken: {
        symbol: "TRAVA",
        address: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
        decimals: BASE18.toFixed()
      }
    },
    {
      id: "orai",
      code: "ORAI",
      name: "ORAI",
      reserveDecimals: BASE18.toFixed(),
      underlyingAddress: "0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0",
      priceUnderlyingAddress: "0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0",
      lpAddress: "0x756E415E458ac05c1a69e834092034017f74Da93",
      stakedTokenAddress: "0xd5Cc214621395686B972DDE8481a7463A0DaB962",
      claimable: true,
      vaultType: VAULT_TYPES.BASE,
      tokenName: TOKENS_NAME.ORAI,
      filterMode: FILTER_MODE.LIVE,
      rewardToken: {
        symbol: "TRAVA",
        address: "0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
        decimals: BASE18.toFixed()
      }
    },
  ]
}
