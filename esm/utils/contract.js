"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
class BaseReadContract {
    constructor(contractAddress, abi, web3Reader) {
        this.contractAddress = contractAddress;
        this.web3Reader = web3Reader;
        this.abi = abi;
        this.contractUtil = new ethers_1.Contract(contractAddress, abi, web3Reader);
    }
}
exports.default = BaseReadContract;
