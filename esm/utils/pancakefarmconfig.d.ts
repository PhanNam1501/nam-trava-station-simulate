import { EthAddress } from "./types";
export interface TokenInFarm {
    symbol: string;
    address: EthAddress;
    decimals: string;
}
export interface FarmingItem {
    id: string;
    name: string;
    code: string;
    v2WrapperAddress: EthAddress;
    stakedToken: TokenInFarm;
    rewardToken: TokenInFarm;
}
export interface FarmingList {
    [chainId: number]: FarmingItem[];
}
export declare const listFarmingV2List: {
    [x: string]: {
        id: string;
        name: string;
        code: string;
        v2WrapperAddress: string;
        stakedToken: {
            symbol: string;
            address: string;
            decimals: string;
        };
        rewardToken: {
            symbol: string;
            address: string;
            decimals: string;
        };
    }[];
};
