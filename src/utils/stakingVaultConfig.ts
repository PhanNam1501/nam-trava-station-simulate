import { NETWORKS, CONFIG } from "./config";

export const listStakingVault = {
    [NETWORKS.bsc.chainId] : [
        {
            id: "bsc-mainnet-travabnb",
            name: "Trava BNB",
            code: "BNB/TRAVA",
            underlyingAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
            stakedTokenAddress: "0xA36991E7FA207815f37e01E72DBC3b5b874D7F6C",
            claimable: true,
            reserveDecimals : "1000000000000000000"
          },
          {
            id: "trava",
            name: "Trava Token",
            code: "TRAVA",
            underlyingAddress: "0x41Ad43Ae987F7bE3B5024E7B167f81772f097D5b",
            stakedTokenAddress: "0x1120E28F5D9eeABfC18afE9600315c6c184b9fcF",
            claimable: true,
            reserveDecimals : "1000000000000000000"
          },
          {
            id: "bsc-mainnet-bnbtrava2",
            name: "Trava BNB",
            code: "BNB/TRAVA",
            underlyingAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
            stakedTokenAddress: "0xA36991E7FA207815f37e01E72DBC3b5b874D7F6C",
            claimable: true,
            lockedUntil: 1628624800000,
            badge: "3 months",
            lpLink: "https://pancakeswap.finance/add/BNB/0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
            reserveDecimals : "1000000000000000000"
          },
          {
            id: "bsc-mainnet-bnbtrava3",
            name: "Trava BNB",
            code: "BNB/TRAVA",
            underlyingAddress: "0xdCbf1fe4642d3c593f665D04Cc66E1E8923DAB5e",
            stakedTokenAddress: "0xA36991E7FA207815f37e01E72DBC3b5b874D7F6C",
            claimable: true,
            lockedUntil: 1628624800000,
            badge: "9 months",
            lpLink: "https://pancakeswap.finance/add/BNB/0x0391bE54E72F7e001f6BBc331777710b4f2999Ef",
            reserveDecimals : "1000000000000000000"
          },
          {
            id: "bnb",
            name: "Binance Token",
            code: "BNB",
            underlyingAddress: "0x0245CE100fe6cD3f09d8d660911a9b20440685aB",
            stakedTokenAddress: "0x1bA94b6f7CB7dE9b48339582d65E99aee402ba74",
            bnbGateWay: "0x59F92dE42C860161Fe234349b186af739ba9aAb6",
            claimable: true,
            reserveDecimals : "1000000000000000000"
          },
          {
            id: "busd",
            name: "Binance USD",
            code: "BUSD",
            underlyingAddress: "0xB9DEC3EbBf11Ecd9c028b6790e3009021261c3C4",
            stakedTokenAddress: "0x332ee356C133C808626FDA565e36F007CD317aBd",
            claimable: true,
            reserveDecimals : "1000000000000000000"
          },
          {
            id: "orai",
            name: "Orai Token",
            code: "ORAI",
            underlyingAddress: "0x35dA5D673D7893A8C7F5730Ce1318dEf11baB051",
            stakedTokenAddress: "0x593C5721936998eB7b30e504643E955f9D44c4C5",
            claimable: true,
            reserveDecimals : "1000000000000000000"
          },
    ]
}
export const VAULT_TYPES = {
  FARMING: "FARMING",
  FARMING_BURN: "FARMING_BURN",
  BASE: "BASE",
  REWARD_ON_FTM: "REWARD_ON_FTM",
};

