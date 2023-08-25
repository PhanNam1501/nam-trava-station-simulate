import { EthAddress } from "./types";
import { JsonRpcApiProvider } from "ethers";
import BaseReadContract from "./contract";
export default class OraclePrice extends BaseReadContract {
    constructor(address: EthAddress, web3Reader: JsonRpcApiProvider);
    getAssetPrice(_assetAddress: EthAddress): Promise<any>;
}
