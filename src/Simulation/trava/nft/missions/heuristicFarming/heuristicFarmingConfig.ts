import { NETWORKS } from "../../../../../utils/config";

export interface Vault {
    id: string;
    level: number;
    name: string;
    rarity: string;
    collectionPrice: number;
    disabled?: boolean;
}

export interface HeuristicFamingConfigs {
    [networkId: number]: Record<string, Vault>;
}

export const heuristicFamingConfig: HeuristicFamingConfigs = {
    [NETWORKS.bscTestnet.chainId]: {
        "copper-vault": { id: "copper-vault", level: 1, name: "Copper", rarity: "copper", collectionPrice: 4000 },
        "silver-vault": { id: "silver-vault", level: 2, name: "Silver", rarity: "silver", collectionPrice: 10600 },
        "gold-vault": { id: "gold-vault", level: 3, name: "Gold", rarity: "gold", collectionPrice: 23600, disabled: true },
        "diamond-vault": {
            id: "diamond-vault",
            level: 4,
            name: "Diamond",
            rarity: "diamond",
            collectionPrice: 52000,
            disabled: true,
        },
        "crystal-vault": {
            id: "crystal-vault",
            level: 5,
            name: "Crystal",
            rarity: "crystal",
            collectionPrice: 150000,
            disabled: true,
        },
    },
    [NETWORKS.bscMainnet.chainId]: {
        "copper-vault": { id: "copper-vault", level: 1, name: "Copper", rarity: "copper", collectionPrice: 9000 },
        "silver-vault": { id: "silver-vault", level: 2, name: "Silver", rarity: "silver", collectionPrice: 22000 },
        "gold-vault": { id: "gold-vault", level: 3, name: "Gold", rarity: "gold", collectionPrice: 64000 },
        "diamond-vault": { id: "diamond-vault", level: 4, name: "Diamond", rarity: "diamond", collectionPrice: 150000 },
        "crystal-vault": { id: "crystal-vault", level: 5, name: "Crystal", rarity: "crystal", collectionPrice: 820000 },
    },
};
