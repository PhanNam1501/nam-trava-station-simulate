type Config = {
  chainId: number;
  testingMode: boolean;
  [key: string]: any;
};

type ContractNetwork = {
  bscTestnet: Contract;
  bscMainnet: Contract;
};

type Contract = {
  WBNB: EthAddress;
  TRAVA_LENDING_POOL_MARKET: Array<EthAddress>;
  ORACLE_ADDRESS: EthAddress;
  TRAVA_TOKEN_IN_MARKET: EthAddress;
  MULTI_CALL_ADDRESS: EthAddress;
  NFT_CORE_ADDRESS: EthAddress;
  NFT_MARKETPLACE: EthAddress;
  NFT_MANAGER: EthAddress;
  NFT_COLLECTION: EthAddress;
  TRAVA_TOKEN: EthAddress;
};

type Network = {
  chainId: number;
  chainName: string;
  blockExplorerUrls: Array<string>;
  iconUrls: Array<string>;
  rpcUrls: Array<string>;
  nativeCurrency: { name: string; decimals: number; symbol: string };
};

type Networks = {
  bscTestnet: Network;
  bscMainnet: Network;
};

type EthAddress = string;
type bytes32 = string;
type bytes = string | Array<any>;
type uint256 = string;
type uint32 = string;
type uint160 = string;
type uint128 = string;
type uint80 = string;
type uint64 = string;
type uint24 = string;
type uint16 = string;
type uint8 = string;
type int256 = string;
type int24 = string;

export {
  Config,
  ContractNetwork,
  Contract,
  Network,
  Networks,
  EthAddress,
  bytes32,
  bytes,
  uint256,
  uint160,
  uint32,
  uint128,
  uint80,
  uint64,
  uint24,
  uint16,
  uint8,
  int256,
  int24,
};
