import { Contract, Interface } from "ethers";
import { getAddr } from "./address";
import MultiCallABI from "../abis/Multicall.json";

export async function multiCall(abi: any, calls: any, provider: any, chainId: any): Promise<any> {

    let _provider = provider;
    const multi = new Contract(
        getAddr("MULTI_CALL_ADDRESS", chainId),
        MultiCallABI,
        _provider
    );
    const itf = new Interface(abi);

    const callData = calls.map((call: any) => [
        call.address.toLowerCase(),
        itf.encodeFunctionData(call.name as string, call.params),
    ]);
    const { returnData } = await multi.aggregate(callData);
    return returnData.map((call: any, i: any) =>
        itf.decodeFunctionResult(calls[i].name, call)
    );
};