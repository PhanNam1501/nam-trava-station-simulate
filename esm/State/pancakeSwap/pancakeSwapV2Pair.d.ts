import { EthAddress, uint256 } from "../../utils/types";
export declare class PancakeSwapV2Pair {
    pancakeV2Pairs: Map<string, PancakeV2Pair>;
    isFetch: boolean;
    constructor();
}
export interface PancakeV2Pair {
    addressToken0: EthAddress;
    addressToken1: EthAddress;
    token0Price: uint256;
    token1Price: uint256;
    token0Decimals: uint256;
    token1Decimals: uint256;
    token0Hold: uint256;
    token1Hold: uint256;
    pairTokenDecimals: uint256;
    totalSupplyPairToken: uint256;
    tvl: uint256;
    pairTokenOfSmartWallet: uint256;
}
