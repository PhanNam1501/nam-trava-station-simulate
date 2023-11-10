import { Contract, Interface } from "ethers";
import { getAddr } from "./address";
import MultiCallABI from "../abis/Multicall.json";
import { ApplicationState } from "../State";
import { EthAddress, uint256, wallet_mode } from "./types";
import { FromAddressError } from "./error";
import BigNumber from "bignumber.js";

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

export function getMode(appState: ApplicationState, _from: EthAddress): wallet_mode {
    let mode: wallet_mode;
    if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
        mode = "walletState"
    } else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
        mode = "smartWalletState"
    } else {
        throw new FromAddressError()
    }
    return mode;
}

export function mul(a: uint256, b: uint256): uint256 {
    return BigNumber(a).multipliedBy(b).toFixed(0)
}

export function div(a: uint256, b: uint256): uint256 {
    return BigNumber(a).div(b).toFixed(0);
}