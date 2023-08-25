var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import AaveOracle from "../abis/AaveOracle.json";
import BaseReadContract from "./contract";
import { convertHexStringToAddress } from "./address";
export default class OraclePrice extends BaseReadContract {
    constructor(address, web3Reader) {
        super(address, AaveOracle, web3Reader);
    }
    getAssetPrice(_assetAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetAddress = convertHexStringToAddress(_assetAddress);
            return yield this.contractUtil.getAssetPrice(assetAddress);
        });
    }
}
// const oracleContract = new OracleContract(process.env.ORACLE_ADDRESS!);
// oracleContract.getAssetPrice(process.env.TRAVA_TOKEN_IN_MARKET!).then((res) => {
//   console.log(res.toString());
// });
