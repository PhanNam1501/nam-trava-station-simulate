import { Contract } from "ethers";
export default class BaseReadContract {
    constructor(contractAddress, abi, web3Reader) {
        this.contractAddress = contractAddress;
        this.web3Reader = web3Reader;
        this.abi = abi;
        this.contractUtil = new Contract(contractAddress, abi, web3Reader);
    }
}
