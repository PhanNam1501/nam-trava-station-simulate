import axios from "axios";
import { ApplicationState } from "../State/ApplicationState";
import { EthAddress, bytes32, uint256 } from "./types";
import { stringToBytes } from "@zennomi/tokens/esm/utils";

type API_METHOD = "post" | "put" | "update" | "get";

type TokenApprove = {
    address: EthAddress;
    amount: uint256;
}

type ExecuteData = {
    target: EthAddress;
    data: bytes32;
    value: uint256;
}

type ExecuteRequestData = {
    chainId: uint256;
    EOAAddress: EthAddress;
    smartWalletAddress: EthAddress;
    execute: ExecuteData;
}

type ExecuteRequest = {
    method: API_METHOD;
    url: string;
    approve: Array<TokenApprove>;
    data: ExecuteRequestData;
}


export async function simulateExecute(
    appState: ApplicationState,
    tokensApprove: Array<TokenApprove>,
    executeData: ExecuteData
): Promise<void> {
    let executeRequest: ExecuteRequest = {
        method: "post",
        url: appState.simulatorUrl + "execute",
        approve: tokensApprove,
        data: {
            chainId: appState.chainId.toString(),
            EOAAddress: appState.walletState.address,
            smartWalletAddress: appState.smartWalletState.address,
            execute: executeData
        }
    }

    let res = await axios.request(executeRequest)
    if (String(res.data.error) != "undefined") {
        throw new Error(String(res.data.error))
    }
}

export {
    API_METHOD,
    TokenApprove,
    ExecuteData,
    ExecuteRequest,
    ExecuteRequestData
};