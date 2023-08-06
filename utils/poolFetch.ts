import { ethers } from "hardhat";
import { abi as AbiTravaLP } from "../abis/TravaLendingPool.json";
import BEP20ABI from "../abis/BEP20.json";
import { EthAddress } from "./types";
import dotenv from "dotenv";
dotenv.config();

export default class PoolFetcher {
  // get
  poolAddress: EthAddress;
  constructor(poolAddress: EthAddress) {
    this.poolAddress = poolAddress;
  }

  async getPoolsAddressData() {}

  async getOraclePrice() {}

  async _getRiskParam() {}

  async _getIncentiveData() {}

  async _getTokenTotalData() {}

  _mergeFinalResult() {}

  async getPoolTokenData() {
    const travaLP = await ethers.getContractAt(
      AbiTravaLP,
      process.env.TRAVA_LENDING_POOL_MARKET!
    );
    const reserveAddressList = await travaLP.getReservesList();
    if (reserveAddressList.length == 0) {
      return undefined;
    }
  }

  async getPoolsData() {}
}

const poolFetcher = new PoolFetcher(process.env.TRAVA_LENDING_POOL_MARKET!);
poolFetcher.getPoolTokenData().then((res) => {
  console.log(res);
});
