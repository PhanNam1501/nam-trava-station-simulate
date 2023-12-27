import { ApplicationState } from "../State/ApplicationState";
import { EthAddress, bytes32, uint256 } from "./types";
type API_METHOD = "post" | "put" | "update" | "get";
type TokenApprove = {
    address: EthAddress;
    amount: uint256;
};
type ExecuteData = {
    target: EthAddress;
    data: bytes32;
    value: uint256;
};
type ExecuteRequestData = {
    chainId: uint256;
    EOAAddress: EthAddress;
    smartWalletAddress: EthAddress;
    execute: ExecuteData;
};
type ExecuteRequest = {
    method: API_METHOD;
    url: string;
    approve: Array<TokenApprove>;
    data: ExecuteRequestData;
};
export declare function simulateExecute(appState: ApplicationState, tokensApprove: Array<TokenApprove>, executeData: ExecuteData): Promise<void>;
export { API_METHOD, TokenApprove, ExecuteData, ExecuteRequest, ExecuteRequestData };
