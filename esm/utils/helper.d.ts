import { JsonRpcProvider } from "ethers";
import { ApplicationState } from "../State";
import { EthAddress, uint256, wallet_mode } from "./types";
export declare function multiCall(abi: any, calls: any, provider: any, chainId: any): Promise<any>;
export declare function getMode(appState: ApplicationState, _from: EthAddress): wallet_mode;
export declare function mul(a: uint256, b: uint256): uint256;
export declare function div(a: uint256, b: uint256): uint256;
export declare function isWallet(appState: ApplicationState, address: EthAddress): boolean;
export declare function isNullAddress(address: EthAddress): address is "0x0000000000000000000000000000000000000000";
export declare function isNonUpdateTokenBalance(appState: ApplicationState, _userAddress: EthAddress, _tokenAddress: EthAddress): boolean | undefined;
export declare function isUserAddress(appState: ApplicationState, userAddress: EthAddress): boolean;
export declare const convertApyToApr: (apy: number) => number;
export declare function getJsonProvider(_chainId: number | string, _rpcUrl?: string): JsonRpcProvider;
