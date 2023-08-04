// import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: "bscTestnet",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      // forking: {
      //   url: "https://hardcore-mayer:untrue-puppet-yearly-early-widow-spud@nd-723-346-173.p2pify.com",
      // },
      // chainId: 97,
      accounts: [
        {
          privateKey:
            "36f1ea3519a6949576c242d927dd0c74650554cdfaedbcd03fb3a80c558c03de",

          balance: "100000000000000000000000000000",
        },
        {
          privateKey:
            "37235af6356e58fd30610f5b5b3979041e029fccdfce7bf05ee868d3f7c114ec",

          balance: "100000000000000000000000000000",
        },
        {
          privateKey:
            "ddc0dbf76bd1652473690e3e67cad62a42407fa3068a0710b80481be4ef2f3bb",

          balance: "100000000000000000000000000000",
        },
      ],
      gasPrice: 5000000000,
      // gas: 25e6,
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20e9,
      gas: 2e6,
      // gas: 1e7,
      accounts: [],
    },
  },
};

export default config;
