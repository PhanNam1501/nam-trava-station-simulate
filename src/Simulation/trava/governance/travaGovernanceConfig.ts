import { NETWORKS } from "../../../utils/config";
import { EthAddress, uint256 } from "../../../utils/types";

export interface TokenLockOption {
    address: EthAddress;
    symbol: string;
    name: string;
    decimals: uint256
}

export interface TokenLockOptions {
    [chainId: number | string]: Array<TokenLockOption>;
}

export const tokenLockOptions: TokenLockOptions = {
    [NETWORKS.bscMainnet.chainId]: [
        {
            address: "0x0391be54e72f7e001f6bbc331777710b4f2999ef",
            symbol: 'TRAVA',
            name: 'Trava Finance',
            decimals: "18"
        },
        {
            address: "0x170772a06affc0d375ce90ef59c8ec04c7ebf5d2",
            symbol: 'rTRAVA',
            name: 'Trava Finance',
            decimals: "18"
        },
        {
            address: "0x865c77d4ff6383e06c58350a2cfb95cca2c0f056",
            symbol: 'BNB/TRAVA',
            name: 'Trava Finance',
            decimals: "18"
        },
    ],
    [NETWORKS.bscTestnet.chainId]: [
        {
            address: "0xce9f0487f07988003f511d6651153a6dacc32f50",
            symbol: 'TRAVA',
            name: 'Trava Finance',
            decimals: "18"
        },
        {
            address: "0x4a9901cdafdfb2ac614c12627e0a5b45a63929d6",
            symbol: 'rTRAVA',
            name: 'Trava Finance',
            decimals: "18"
        },
        {
            address: "0x007c269d478ccd0ce196051e8acb284bb1e7cecd",
            symbol: 'BNB/TRAVA',
            name: 'Trava Finance',
            decimals: "18"
        },
    ],
};
