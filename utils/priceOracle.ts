import hre from "hardhat";
import { EthAddress } from "./types";
import AaveOracle from "../abis/AaveOracle.json";
import dotenv from "dotenv";
dotenv.config();

export default class OracleContract {
  contractAddress: EthAddress;

  constructor(contractAddress: EthAddress) {
    this.contractAddress = contractAddress;
  }

  async getAssetPrice(assetAddress: EthAddress) {
    const OracleContract = await hre.ethers.getContractAt(
      AaveOracle,
      this.contractAddress
    );
    return await OracleContract.getAssetPrice(assetAddress);
  }
}

// const oracleContract = new OracleContract(process.env.ORACLE_ADDRESS!);
// oracleContract.getAssetPrice(process.env.TRAVA_TOKEN_IN_MARKET!).then((res) => {
//   console.log(res.toString());
// });
