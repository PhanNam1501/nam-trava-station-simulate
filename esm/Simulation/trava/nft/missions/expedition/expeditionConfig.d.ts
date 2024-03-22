import { EthAddress, uint256 } from "../../../../../utils/types";
export interface ExpeditionOption {
    id: uint256;
    contractAddress: EthAddress;
    acceptableRarities: Array<number>;
    status: uint256;
    failureRefund: number;
}
export interface ExpeditionOptions {
    [chainId: number]: Array<ExpeditionOption>;
}
export declare const expeditionOptions: ExpeditionOptions;
