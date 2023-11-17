import { NETWORKS } from "../../../../../utils";
export const tokenSellOptions = {
    [NETWORKS.bscMainnet.chainId]: [
        {
            address: "0x0391be54e72f7e001f6bbc331777710b4f2999ef",
            symbol: 'TRAVA',
            name: 'Trava Finance',
            decimals: "18"
        },
        {
            address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            symbol: 'BUSD',
            name: 'Binance USD',
            decimals: "18"
        },
    ],
    [NETWORKS.bscTestnet.chainId]: [
        {
            address: "0xe1f005623934d3d8c724ec68cc9bfd95498d4435",
            symbol: 'TRAVA',
            name: 'Trava Finance',
            decimals: "18"
        },
        {
            address: "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee",
            symbol: 'BUSD',
            name: 'Binance USD',
            decimals: "18"
        },
    ],
};
