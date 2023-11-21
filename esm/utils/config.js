"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MINIMUM_BID_STEP_PERCENT = exports.FEE_AUCTION_PERCENTAGE = exports.WAD = exports.HALF_PERCENT = exports.PERCENTAGE_FACTOR = exports.MAX_UINT256 = exports.BASE18 = exports.HOUR_TO_SECONDS = exports.DAY_TO_SECONDS = exports.WEEK_TO_SECONDS = exports.MONTH_TO_SECONDS = exports.YEAR_TO_SECONDS = exports.MAX_LOCK_TIMES = exports.ZERO_ADDRESS = exports.wadDiv = exports.percentMul = exports.configure = exports.CONFIG = exports.NETWORKS = void 0;
const tokens_1 = require("@zennomi/tokens");
const ethers_1 = require("ethers");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const error_1 = require("./error");
/**
 *
 * @type {Networks}
 */
exports.NETWORKS = {
    bscTestnet: {
        chainId: 97,
        chainName: "Binance Smart Chain Testnet",
        blockExplorerUrls: ["https://testnet.bscscan.com/"],
        iconUrls: [],
        rpcUrls: [],
        nativeCurrency: { name: "BNB", decimals: 18, symbol: "BNB" },
    },
    bscMainnet: {
        chainId: 56,
        chainName: "Binance Smart Chain Mainnet",
        blockExplorerUrls: ["https://bscscan.com/"],
        iconUrls: [],
        rpcUrls: [],
        nativeCurrency: { name: "BNB", decimals: 18, symbol: "BNB" },
    },
};
/**
 *
 */
exports.CONFIG = {
    chainId: exports.NETWORKS.bscTestnet.chainId,
    testingMode: false,
};
/**
 *
 * @param config
 */
const configure = (config) => {
    if (!config || typeof config !== "object")
        throw new Error("Object expected");
    const newKeys = Object.keys(config);
    newKeys.forEach((key) => {
        exports.CONFIG[key] = config[key];
        if (key === "chainId")
            (0, tokens_1.set)("network", config[key]);
    });
};
exports.configure = configure;
const percentMul = (value, percentage) => {
    if (value.toFixed(0) == "0" || percentage.isZero()) {
        return (0, bignumber_js_1.default)(0);
    }
    if (value.isGreaterThanOrEqualTo((0, bignumber_js_1.default)(exports.MAX_UINT256).minus(exports.HALF_PERCENT))) {
        throw new error_1.MultiplicationOverflowError("MATH_MULTIPLICATION_OVERFLOW");
    }
    return (0, bignumber_js_1.default)(value.multipliedBy(percentage).plus(exports.HALF_PERCENT).div(exports.PERCENTAGE_FACTOR).toFixed(0));
};
exports.percentMul = percentMul;
const wadDiv = (a, b) => {
    if (a.toFixed(0) == "0") {
        throw new error_1.DivisionByZeroError("MATH_DIVISION_BY_ZERO");
    }
    let halfB = b.div(2);
    if (a.isGreaterThan((0, bignumber_js_1.default)(exports.MAX_UINT256).minus(halfB).div(exports.WAD))) {
        throw new error_1.MultiplicationOverflowError("MATH_MULTIPLICATION_OVERFLOW");
    }
    return a.multipliedBy(exports.WAD).plus(halfB).div(b);
};
exports.wadDiv = wadDiv;
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.MAX_LOCK_TIMES = 4 * 365 * 24 * 60 * 60;
exports.YEAR_TO_SECONDS = 365 * 24 * 60 * 60;
exports.MONTH_TO_SECONDS = 30 * 24 * 60 * 60;
exports.WEEK_TO_SECONDS = 7 * 24 * 60 * 60;
exports.DAY_TO_SECONDS = 24 * 60 * 60;
exports.HOUR_TO_SECONDS = 60 * 60;
exports.BASE18 = (0, bignumber_js_1.default)("1000000000000000000");
exports.MAX_UINT256 = ethers_1.ethers.MaxUint256.toString();
exports.PERCENTAGE_FACTOR = (0, bignumber_js_1.default)(1e4);
exports.HALF_PERCENT = exports.PERCENTAGE_FACTOR.div(2);
exports.WAD = (0, bignumber_js_1.default)(1e18);
exports.FEE_AUCTION_PERCENTAGE = 5 / 100;
exports.MINIMUM_BID_STEP_PERCENT = 5 / 100;
