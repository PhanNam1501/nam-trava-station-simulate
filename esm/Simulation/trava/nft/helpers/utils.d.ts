import { ApplicationState } from "../../../../State/ApplicationState";
import { CollectionArmoury, NormalKnight, SellingArmouryType, SpecialKnight } from "./global";
import { NFTSellingState } from "../../../../State/TravaNFTState";
export declare function fetchNormalItems(armorTokenIds: Array<string>, helmetTokenIds: Array<string>, shieldTokenIds: Array<string>, weaponTokenIds: Array<string>, appState: ApplicationState): Promise<{
    armor: CollectionArmoury;
    helmet: CollectionArmoury;
    shield: CollectionArmoury;
    weapon: CollectionArmoury;
}[]>;
export declare function fetchBasicCollections(collectionIds: Array<string>, appState: ApplicationState): Promise<{
    normalCollections: Array<NormalKnight>;
    specialCollections: Array<SpecialKnight>;
}>;
export declare function _fetchNormal(appState: ApplicationState, tokenIds: any): Promise<NFTSellingState>;
export declare function armourySort(item1: SellingArmouryType, item2: SellingArmouryType): number;
export declare function collectionSort(item1: NormalKnight, item2: NormalKnight): 1 | -1;
export declare function shuffleArray(array: any): void;
