import AbiTravaLP from "../abis/TravaLendingPool.json";
import BEP20ABI from "../abis/BEP20.json";
import { EthAddress } from "./types";
import {JsonRpcProvider , InterfaceAbi} from "ethers"
import BaseReadContract from "./contract";
import { getAddr } from "./address";

const abi : InterfaceAbi = AbiTravaLP;
export default class PoolFetcher extends BaseReadContract{
  // get
  constructor(web3 : JsonRpcProvider){
    super(getAddr("TRAVA_LENDING_POOL_MARKET"),abi,web3);

  }

  async getPoolsAddressData() {}

  async getOraclePrice() {}

  async _getRiskParam() {}

  async _getIncentiveData() {}

  async _getTokenTotalData() {}

  _mergeFinalResult() {}

  async getPoolTokenData() {
   
    const reserveAddressList = await this.contractUtil.getReservesList();
    if (reserveAddressList.length == 0) {
      return undefined;
    }
  }

  async getPoolsData() {}
}

