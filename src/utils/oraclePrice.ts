import { EthAddress } from "./types";
import AaveOracle from "../abis/AaveOracle.json";
import {JsonRpcApiProvider,InterfaceAbi} from "ethers";
import BaseReadContract from "./contract";
import { convertHexStringToAddress, getAddr } from "./address";

export default class OraclePrice extends BaseReadContract {

  constructor(
    address : EthAddress,
    web3Reader : JsonRpcApiProvider,
  )
    {
      super(address,AaveOracle,web3Reader)
    }

  async getAssetPrice(_assetAddress: EthAddress) {
    const assetAddress = convertHexStringToAddress(_assetAddress);
    return await this.contractUtil.getAssetPrice(assetAddress);
  }
}

// const oracleContract = new OracleContract(process.env.ORACLE_ADDRESS!);
// oracleContract.getAssetPrice(process.env.TRAVA_TOKEN_IN_MARKET!).then((res) => {
//   console.log(res.toString());
// });
