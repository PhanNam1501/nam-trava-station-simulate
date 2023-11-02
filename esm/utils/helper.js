var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Contract, Interface } from "ethers";
import { getAddr } from "./address";
import MultiCallABI from "../abis/Multicall.json";
export function multiCall(abi, calls, provider, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        let _provider = provider;
        const multi = new Contract(getAddr("MULTI_CALL_ADDRESS", chainId), MultiCallABI, _provider);
        const itf = new Interface(abi);
        const callData = calls.map((call) => [
            call.address.toLowerCase(),
            itf.encodeFunctionData(call.name, call.params),
        ]);
        const { returnData } = yield multi.aggregate(callData);
        return returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
    });
}
;
