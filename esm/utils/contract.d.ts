import { JsonRpcApiProvider, InterfaceAbi, Contract } from "ethers";
import { EthAddress } from "./types";
export default class BaseReadContract {
    contractAddress: EthAddress;
    web3Reader: JsonRpcApiProvider;
    abi: InterfaceAbi;
    contractUtil: Contract;
    constructor(contractAddress: EthAddress, abi: InterfaceAbi, web3Reader: JsonRpcApiProvider);
}
