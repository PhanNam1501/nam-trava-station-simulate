"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxDilutionTravaLock = exports.DilutionJoinFee = exports.PowerRatingKnight = exports.KnightArmyOptions = exports.TimeLockPercentage = void 0;
exports.TimeLockPercentage = [
    { text: "6 Months", timeAmout: 15552000, percent: 0.159 },
    { text: "1 Year", timeAmout: 31104000, percent: 0.38 },
    { text: "1.5 Years", timeAmout: 46656000, percent: 0.685 },
    { text: "2 Years", timeAmout: 77760000, percent: 1 },
];
exports.KnightArmyOptions = [
    { dilutionRank: "small", maxium: 100000, powerRating: 15, condition: [1, 2, 3] },
    { dilutionRank: "medium", maxium: 1000000, powerRating: 75, condition: [1, 2, 3, 4] },
    { dilutionRank: "large", maxium: "unlimited", powerRating: 350, condition: [1, 2, 3, 4, 5] },
];
// for limited knight
exports.PowerRatingKnight = [1.6, 4.4, 12, 28.88, 280]; // Power Level After Joining
exports.DilutionJoinFee = [500, 1320, 3600, 8666.67, 84000]; // Upfront Fee
exports.MaxDilutionTravaLock = [10000, 500000, 1000000, 5000000, "unlimited"]; //Max Amount
