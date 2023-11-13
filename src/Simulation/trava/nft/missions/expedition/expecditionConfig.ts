import { NETWORKS } from "../../../../../utils";
import { EthAddress, uint256 } from "../../../../../utils/types";

export interface VaultConfigOption {
    id: uint256;
    contractAddress: EthAddress;
    acceptableRarities: Array<number>;
    failureRefund: number;
    status: uint256;
}

export interface VaultConfigOptions {
    [chainId: number]: Array<VaultConfigOption>;
}

export const vaultConfigOptions: VaultConfigOptions = {
    [NETWORKS.bscMainnet.chainId]: [
        {
            id: "rookie",
            contractAddress: "0xCF8B29E9762a8bE82d8Bc9822Ce3096D4F03388c",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 0,
            status: "available",
        },
        {
            id: "professional",
            contractAddress: "0x1aEc07118Cc8ABbb85828d4340b6Aa3cd52Dd61d",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 0,
            status: "available",
        },
        {
            id: "veteran",
            contractAddress: "0xd52D8A80aae0E2bc92De3C7CE9Aca167b3fAb193",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 0,
            status: "available",
        },
        {
            id: "elite",
            contractAddress: "",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 0,
            status: "unavailable",
        },
        {
            id: "master",
            contractAddress: "",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 0,
            status: "unavailable",
        },
        {
            id: "ultimate",
            contractAddress: "",
            acceptableRarities: [],
            failureRefund: 0,
            status: "unavailable",
        },
    ],
    [NETWORKS.bscTestnet.chainId]: [
        {
            id: "rookie",
            contractAddress: "0x5B9050F8C56EaF91a283aEB2fbB4eC5D61Ab682B",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 50,
            status: "available",
        },
        {
            id: "professional",
            contractAddress: "0x5B6f3CAD58626D409494A8800f60ec1a10C8e929",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 150,
            status: "available",
        },
        {
            id: "veteran",
            contractAddress: "0x2393C076fE12Ceeab778D07EAa8922c2D35616b5",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 300,
            status: "available",
        },
        {
            id: "elite",
            contractAddress: "0xa2af0B110F990D7A6bcBf46740c12c20960968BD",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 800,
            status: "available",
        },
        {
            id: "master",
            contractAddress: "0x4C973D5554b9451aC7e5242fA25eb3E2be3f8Bb7",
            acceptableRarities: [1, 2, 3, 4, 5],
            failureRefund: 6500,
            status: "available",
        },
        {
            id: "ultimate",
            contractAddress: "",
            acceptableRarities: [],
            failureRefund: 0,
            status: "unavailable",
        },
    ],
};