import {JsonRpcApiProvider,InterfaceAbi,Contract} from "ethers"
import { EthAddress } from "./types"

export default class BaseReadContract {
    contractAddress : EthAddress
    web3Reader : JsonRpcApiProvider
    abi : InterfaceAbi
    contractUtil : Contract
    constructor(contractAddress : EthAddress,abi : InterfaceAbi,web3Reader : JsonRpcApiProvider)
    {
        this.contractAddress = contractAddress;
        this.web3Reader = web3Reader;
        this.abi = abi
        this.contractUtil = new Contract(contractAddress,abi,web3Reader)
    }


}