import { EthAddress, uint256 } from "../../../utils/types";
export interface TokenLockOption {
    address: EthAddress;
    symbol: string;
    name: string;
    decimals: uint256;
}
export interface TokenLockOptions {
    [chainId: number | string]: Array<TokenLockOption>;
}
export declare const tokenLockOptions: TokenLockOptions;
