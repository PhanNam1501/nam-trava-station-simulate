import { EthAddress } from "../utils/types";
import { JsonRpcProvider } from "ethers";
export declare function isBNBToken(token: EthAddress, _chainId: number | string): boolean;
export declare function isUSDTToken(token: EthAddress, _chainId: number | string): boolean;
export declare function isSpecialToken(token: EthAddress, _chainId: number | string): boolean;
export declare function getSpecialToken(token: EthAddress, _chainId: number | string): string;
export declare function convertTokens(_listTokens: Array<EthAddress>, _chainId: number | string): string[];
export declare function getTokenPrice(_listTokens: Array<EthAddress>, _chainId: number | string, _web3?: JsonRpcProvider): Promise<string[]>;
export declare function getLPTokenPrice(_listLPTokens: Array<EthAddress>, _chainId: number | string, _web3?: JsonRpcProvider): Promise<string[]>;
