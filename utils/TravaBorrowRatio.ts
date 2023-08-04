import { CONFIG, NETWORKS } from "./config";

export const TRAVA_TVL_BSC = {
  [NETWORKS.bsc.chainId]: {
    DAI: "77", // %
    USDC: "80", // %
    USDT: "75", // %
    ETH: "82,5", // %
    BNB: "75", // %
    BTCB: "70", // %
    BUSD: "75", // %
    AAVE: "70", // %
    ADA: "70", // %
    CAKE: "70", // %
    XRP: "70", // %
    DOGE: "55", // %
    DOT: "70", // %
    XVS: "60", // %
    FTM: "75", // %
  },
};

export const TOKEN_NAME_TO_ADDRESS = {
  [NETWORKS.bsc.chainId]: {
    DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3", // fake address
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // fake address
    USDT: "0x55d398326f99059ff775485246999027b3197955", // fake address
    ETH: "0x2170ed0880ac9a755fd29b2688956bd959f933f8", // fake address
    BNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // fake address
    BTCB: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", // fake address
    BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56", // fake address
    AAVE: "0xfb6115445bff7b52feb98650c87f44907e58f802", // fake address
    ADA: "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47", // fake address
    CAKE: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", // fake address
    XRP: "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe", // fake address
    DOGE: "0xba2ae424d960c26247dd6c32edc70b295c744c43", // fake address
    DOT: "0x7083609fce4d1d8dc0c979aab8c869ea2c873402", // fake address
    XVS: "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63", // fake address
    FTM: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", // fake address
    TRAVA: "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37", // address in bsc testnet
  },
};

/**
 *
 * @param name token name
 * @param chainId chain id
 */
export const getTravaTVL = (
  name: string,
  chainId: number = CONFIG.chainId
): string => {
  const _chainId: number =
    typeof chainId === "undefined" ? CONFIG.chainId : chainId;

  const travaTVL = TRAVA_TVL_BSC[_chainId];

  // skip this check if we're in testing mode
  if (!CONFIG.testingMode) {
    if (!travaTVL)
      throw new Error(`Cannot find address for chainId: ${_chainId}.`);
    if (!travaTVL[name as keyof typeof travaTVL])
      throw new Error(
        `Cannot find address for name: ${name} (chainId: ${_chainId}).`
      );
  }

  return travaTVL[name as keyof typeof travaTVL]!;
};

export const getTokensAddress = (
  name: string,
  chainId: number = CONFIG.chainId
): string => {
  const _chainId: number =
    typeof chainId === "undefined" ? CONFIG.chainId : chainId;

  const tokensAddress = TOKEN_NAME_TO_ADDRESS[_chainId];

  // skip this check if we're in testing mode
  if (!CONFIG.testingMode) {
    if (!tokensAddress)
      throw new Error(`Cannot find address for chainId: ${_chainId}.`);
    if (!tokensAddress[name as keyof typeof tokensAddress])
      throw new Error(
        `Cannot find address for name: ${name} (chainId: ${_chainId}).`
      );
  }

  return tokensAddress[name as keyof typeof tokensAddress]!;
};

export async function getAddressToName(
  address: string,
  chainId: number = CONFIG.chainId
): Promise<string> {
  const _chainId: number =
    typeof chainId === "undefined" ? CONFIG.chainId : chainId;

  const tokensAddress = TOKEN_NAME_TO_ADDRESS[_chainId];

  // skip this check if we're in testing mode
  if (!CONFIG.testingMode) {
    if (!tokensAddress)
      throw new Error(`Cannot find address for chainId: ${_chainId}.`);
    if (!tokensAddress[address as keyof typeof tokensAddress])
      throw new Error(
        `Cannot find address for name: ${address} (chainId: ${_chainId}).`
      );
  }

  const tokenName = Object.keys(tokensAddress).find(
    (key) => tokensAddress[key as keyof typeof tokensAddress] === address
  );

  return tokenName!;
}
