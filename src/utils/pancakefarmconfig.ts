import { NETWORKS, CONFIG, BASE18 } from "./config";
import { EthAddress } from "./types";

 interface Token {
    symbol: string;
    address: EthAddress;
    decimals: string;
}

export interface FarmingItem {
    id: string;
    name: string;
    code: string;
    v2WrapperAddress: EthAddress;
    stakedToken: Token;
    rewardToken: Token;
}

export interface FarmingList {
    [chainId: number]: FarmingItem[];
}



export const listFarmingV2List = {
    [NETWORKS.bscMainnet.chainId]: [
        {
            id: "bsc-mainnet-cakebnb",
            name: "Cake BNB LP",
            code: "Cake/BNB",
            v2WrapperAddress: "0x9669218e7ffACE40D78FF09C78aEA5F4DEb9aD4D",
            stakedToken: {
                symbol: "Cake-LP",
                address: "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0",
                decimals: BASE18.toFixed()
            },
            rewardToken: {
                symbol: "Cake",
                address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
                decimals: BASE18.toFixed()
            }
        },
        {
            id: "bsc-mainnet-cakeusdt",
            name: "Cake Usdt LP",
            code: "Cake/Usdt",
            v2WrapperAddress: "0xf320e4E90D3914EE224777dE842f4995467CBeF6",
            stakedToken: {
                symbol: "Cake-LP",
                address: "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0",
                decimals: BASE18.toFixed()
            },
            rewardToken: {
                symbol: "Cake",
                address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
                decimals: BASE18.toFixed()
            }
        },
        {
            id: "bsc-mainnet-mgpbnb",
            name: "MGP-BNB LP",
            code: "MGP/BNB",
            v2WrapperAddress: "0x8F30711e577d8870B390B383a6d4B1c28D6DEdF8",
            stakedToken: {
                symbol: "Cake-LP",
                address: "0x2b3DBbA2D1F5158c7BA4b645B7ea187F7F1763af",
                decimals: BASE18.toFixed()
            },
            rewardToken: {
                symbol: "Cake",
                address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
                decimals: BASE18.toFixed()
            }
        },
        {
            id: "bsc-mainnet-pnpbnb",
            name: "PNP-BNB LP",
            code: "PNB/BNB",
            v2WrapperAddress: "0x6F2ecB6929326Fd30406dDA3E643413f2736a3f7",
            stakedToken: {
                symbol: "Cake-LP",
                address: "0x1C5bD1B4A4Fc05cC0Fb1a0f61136512744Ca4F34",
                decimals: BASE18.toFixed()
            },
            rewardToken: {
                symbol: "Cake",
                address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
                decimals: BASE18.toFixed()
            }
        },
        {
            id: "bsc-mainnet-ckpmcake",
            name: "CKP-mCAKE LP",
            code: "CKP/mCAKE",
            v2WrapperAddress: "0xd4cE5488aEDfb0F26A2bcFa068fB57bDDEBE09Fd",
            stakedToken: {
                symbol: "Cake-LP",
                address: "0xdb92AD18eD18752a194b9D831413B09976B34AE1",
                decimals: BASE18.toFixed()
            },
            rewardToken: {
                symbol: "Cake",
                address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
                decimals: BASE18.toFixed()
            }
        },
        {
            id: "bsc-mainnet-rdpbnb",
            name: "RDP-BNB LP",
            code: "RDP/BNB",
            v2WrapperAddress: "0x66e49e2b4c5c16EbE95E1af7902DAB1211b80E07",
            stakedToken: {
                symbol: "Cake-LP",
                address: "0xc9B415b8331e1Fb0d2f3442Ac8413E279304090f",
                decimals: BASE18.toFixed()
            },
            rewardToken: {
                symbol: "Cake",
                address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
                decimals: BASE18.toFixed()
            }
        },
        {
            id: "bsc-mainnet-bnbhzn",
            name: "BNB-HZN LP",
            code: "BNB/HZN",
            v2WrapperAddress: "0x33770fBC3952d5C85eEDF780Ca63E15C009DefaA",
            stakedToken: {
                symbol: "Cake-LP",
                address: "0xDc9a574b9B341D4a98cE29005b614e1E27430E74",
                decimals: BASE18.toFixed()
            },
            rewardToken: {
                symbol: "Cake",
                address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
                decimals: BASE18.toFixed()
            }
        }
    ]
};