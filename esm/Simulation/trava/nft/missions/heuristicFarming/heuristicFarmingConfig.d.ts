export interface Vault {
    id: string;
    level: number;
    name: string;
    rarity: string;
    collectionPrice: number;
    disabled?: boolean;
}
export interface HeuristicFamingConfigs {
    [networkId: number | string]: Record<string, Vault>;
}
export declare const heuristicFamingConfig: HeuristicFamingConfigs;
