import { EthAddress, uint256 } from "../../../../../utils/types";
export interface TokenSellOption {
    address: EthAddress;
    symbol: string;
    name: string;
    decimals: uint256;
}
export interface TokenSellOptions {
    [chainId: number]: Array<TokenSellOption>;
}
export declare const tokenSellOptions: TokenSellOptions;
