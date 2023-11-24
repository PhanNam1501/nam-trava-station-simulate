import { ApplicationState } from "../State";
import { EthAddress, uint256, wallet_mode } from "./types";
export declare function multiCall(abi: any, calls: any, provider: any, chainId: any): Promise<any>;
export declare function getMode(appState: ApplicationState, _from: EthAddress): wallet_mode;
export declare function mul(a: uint256, b: uint256): uint256;
export declare function div(a: uint256, b: uint256): uint256;
export declare function isWallet(appState: ApplicationState, address: EthAddress): boolean;
