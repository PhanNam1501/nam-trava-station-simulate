import { EthAddress, uint256 } from "../../utils/types";


export class PancakeSwapV2Pair {
    pancakeV2Pairs: Map<string, PancakeV2Pair>;
    isFetch: boolean;
    constructor() {
      this.pancakeV2Pairs = new Map();
      this.isFetch = false;
    }
}

export interface PancakeV2Pair {
    addressToken0: EthAddress;
    addressToken1: EthAddress;
    token0Price: number;
    token1Price: number;
    token0Decimals: number;
    token1Decimals: number;
    token0Hold: number;
    token1Hold: number;
    pairTokenDecimals: number;
    totalSupplyPairToken: number;
    tvl: number;
    pairTokenOfSmartWallet: number
}