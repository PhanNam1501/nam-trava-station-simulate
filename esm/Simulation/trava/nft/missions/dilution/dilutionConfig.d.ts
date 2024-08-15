import { uint256 } from "../../../../../utils/types";
export interface KnightArmyOption {
    dilutionRank: uint256;
    maxium: number | "unlimited";
    powerRating: number;
    condition: Array<number>;
}
export declare const TimeLockPercentage: {
    text: string;
    timeAmout: number;
    percent: number;
}[];
export declare const KnightArmyOptions: KnightArmyOption[];
export declare const PowerRatingKnight: number[];
export declare const DilutionJoinFee: number[];
export declare const MaxDilutionTravaLock: (string | number)[];
