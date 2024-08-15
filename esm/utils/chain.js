"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listChain = void 0;
exports.listChain = {
    // ethereum
    1: {
        chainName: "Ethereum",
        chainId: 1,
        rpcUrls: ["https://ethereum.publicnode.com"],
        blockExplorerUrls: ["https://etherscan.io/"],
        nativeCurrency: {
            name: "Ethereum",
            decimals: 18,
            symbol: "ETH"
        },
        iconUrls: []
    },
    // goerli
    5: {
        chainName: "Goerli",
        chainId: 5,
        rpcUrls: ["https://ethereum-goerli.publicnode.com"],
        blockExplorerUrls: ["https://goerli.etherscan.io/"],
        nativeCurrency: {
            name: "Ethereum",
            decimals: 18,
            symbol: "ETH"
        },
        iconUrls: []
    },
    // sepolia
    69: {
        chainName: "Sepolia",
        chainId: 69,
        rpcUrls: ["https://eth-sepolia-public.unifra.io"],
        blockExplorerUrls: ["https://sepolia.etherscan.io/"],
        nativeCurrency: {
            name: "Ethereum",
            decimals: 18,
            symbol: "ETH"
        },
        iconUrls: []
    },
    // binance smart chain
    56: {
        chainName: "Binance Smart Chain",
        chainId: 56,
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        blockExplorerUrls: ["https://bscscan.com/"],
        nativeCurrency: {
            name: "Binance Smart Chain",
            decimals: 18,
            symbol: "BNB"
        },
        iconUrls: []
    },
    // binance smart chain testnet
    97: {
        chainName: "Binance Smart Chain Testnet",
        chainId: 97,
        rpcUrls: ["https://bsc-testnet.publicnode.com"],
        blockExplorerUrls: ["https://testnet.bscscan.com/"],
        nativeCurrency: {
            name: "Binance Smart Chain",
            decimals: 18,
            symbol: "BNB"
        },
        iconUrls: []
    },
    // polygon
    137: {
        chainName: "Polygon",
        chainId: 137,
        rpcUrls: ["https://polygon.meowrpc.com"],
        blockExplorerUrls: ["https://polygonscan.com/"],
        nativeCurrency: {
            name: "Matic",
            decimals: 18,
            symbol: "MATIC"
        },
        iconUrls: []
    }
};
