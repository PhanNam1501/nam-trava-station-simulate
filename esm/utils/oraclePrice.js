"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AaveOracle_json_1 = __importDefault(require("../abis/AaveOracle.json"));
const contract_1 = __importDefault(require("./contract"));
const address_1 = require("./address");
class OraclePrice extends contract_1.default {
    constructor(address, web3Reader) {
        super(address, AaveOracle_json_1.default, web3Reader);
    }
    getAssetPrice(_assetAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetAddress = (0, address_1.convertHexStringToAddress)(_assetAddress);
            return yield this.contractUtil.getAssetPrice(assetAddress);
        });
    }
}
exports.default = OraclePrice;
// const oracleContract = new OracleContract(process.env.ORACLE_ADDRESS!);
// oracleContract.getAssetPrice(process.env.TRAVA_TOKEN_IN_MARKET!).then((res) => {
//   console.log(res.toString());
// });
