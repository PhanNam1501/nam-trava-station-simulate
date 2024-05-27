
import { ApplicationState } from "../../State/ApplicationState";
import { Contract } from "ethers";
import _ from "lodash";
import { multiCall } from "orchai-combinator-bsc-simulation";
import BigNumber from "bignumber.js";
import PancakeSwapFactoryABI from "../../abis/PancakeSwapFactory.json";
import rawData from "./token_combinationsMainnet.json";
import rawDataTokens from "./addressTokenMainnet.json";
import BEP20ABI from "../../abis/BEP20.json";
import { centic_api, centic_api_key, getAddr, ZERO_ADDRESS } from "../../utils";
import { EthAddress } from "../../utils/types";
import axios from "axios";

export async function updatePancakeSwapV2(
    appState1: ApplicationState,
    force?: boolean
): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        let factoryAddress = getAddr("FactoryAddress", appState.chainId);
        const tokenPairs = rawData;
        let tokensAddress: string[][] = [];
        let tokens0Address: string[] = [];
        for (let i = 0; i < tokenPairs.length; i++) {
            let token0 = tokenPairs[i].address1;
            let token1 = tokenPairs[i].address2;
            let token = [token0, token1]
            tokens0Address.push(token0);
            tokensAddress.push(token);
        }
        let [
            pairTokensAddress,
        ] = await Promise.all([
            multiCall(
                PancakeSwapFactoryABI,
                tokens0Address.map((address: EthAddress, index: number) => ({
                    address: factoryAddress,
                    name: "getPair",
                    params: [tokensAddress[index][0], tokensAddress[index][1]],
                })),
                appState.web3,
                appState.chainId
            )
        ]);
        

        const tokens = rawDataTokens;
        function getAddressList(tokens: { address: string }[]): string[] {
            return tokens.map(token => token.address);
        }


        const addressList = getAddressList(tokens);
        let stringAddress = ""
        for (let i = 0; i < addressList.length; i++) {
            stringAddress += addressList[i] + "%2C%20";
        }
        stringAddress = stringAddress.slice(0, -6);
        let dataTokensSupported = await getDataTokenByAxios(stringAddress, "0x38");
        dataTokensSupported = dataTokensSupported["tokens"];
        
        let tokensAddressAndpairToken: string[][] = [];
        let pairTokensAddressNot0: string[] = [];

        for (let i = 0; i < tokenPairs.length; i++) {
            let token0 = tokenPairs[i].address1;
            let token1 = tokenPairs[i].address2;
            let pairAddress = pairTokensAddress[i][0];
            if (pairAddress != ZERO_ADDRESS) {
                tokensAddressAndpairToken.push([token0, token1, pairAddress]);
                pairTokensAddressNot0.push(pairAddress);
            }
        }

        let [
            tokens0InPair,
            tokens1InPair,
            tokens0Decimals,
            tokens1Decimals,
            pairTokensOfSmartWallet,
            pairTokensDecimals,
            totalSupplyPairTokens,
        ] = await Promise.all([
            multiCall(
                BEP20ABI,
                pairTokensAddressNot0.map((address: EthAddress, index: number) => ({
                    address: tokensAddressAndpairToken[index][0],
                    name: "balanceOf",
                    params: [address],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                BEP20ABI,
                pairTokensAddressNot0.map((address: EthAddress, index: number) => ({
                    address: tokensAddressAndpairToken[index][1],
                    name: "balanceOf",
                    params: [address],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                BEP20ABI,
                pairTokensAddressNot0.map((address: EthAddress, index: number) => ({
                    address: tokensAddressAndpairToken[index][0],
                    name: "decimals",
                    params: [],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                BEP20ABI,
                pairTokensAddressNot0.map((address: EthAddress, index: number) => ({
                    address: tokensAddressAndpairToken[index][1],
                    name: "decimals",
                    params: [],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                BEP20ABI,
                pairTokensAddressNot0.map((address: EthAddress, index: number) => ({
                    address: address,
                    name: "balanceOf",
                    params: [appState.smartWalletState.address],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                BEP20ABI,
                pairTokensAddressNot0.map((address: EthAddress, index: number) => ({
                    address: address,
                    name: "decimals",
                    params: [],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                BEP20ABI,
                pairTokensAddressNot0.map((address: EthAddress, index: number) => ({
                    address: address,
                    name: "totalSupply",
                    params: [],
                })),
                appState.web3,
                appState.chainId
            )
        ]);

        for (let i = 0; i < pairTokensAddressNot0.length; i++){
            let token0 = tokensAddressAndpairToken[i][0];
            let token1 = tokensAddressAndpairToken[i][1];
            let pairAddress = pairTokensAddressNot0[i];

            let token0InPair = tokens0InPair[i][0];
            let token0Decimals = tokens0Decimals[i][0];

            let token1InPair = tokens1InPair[i][0];
            let token1Decimals = tokens1Decimals[i][0];

            let pairTokenOfSmartWallet = pairTokensOfSmartWallet[i][0];
            let pairTokenDecimals = pairTokensDecimals[i][0];
            let totalSupplyPairToken = totalSupplyPairTokens[i][0];
        
            let token0Price = new BigNumber(dataTokensSupported.find((token: any) => token.address == token0)["price"]);
            let token1Price = new BigNumber(dataTokensSupported.find((token: any) => token.address == token1)["price"]);
        
            let totalValue = token0Price.multipliedBy(token0InPair).dividedBy(10 ** Number(token0Decimals)).plus(token1Price.multipliedBy(token1InPair).dividedBy(10 ** Number(token1Decimals)));
            // 1000 USD
            if (totalValue.isGreaterThan(1000)) {
                appState.pancakeSwapV2Pair.pancakeV2Pairs.set(pairAddress.toLowerCase(), {
                    addressToken0: token0.toLowerCase(),
                    addressToken1: token1.toLowerCase(),
                    token0Price: Number(token0Price),
                    token1Price: Number(token1Price),
                    token0Decimals: Number(token0Decimals),
                    token1Decimals: Number(token1Decimals),
                    token0Hold: Number(token0InPair),
                    token1Hold: Number(token1InPair),
                    pairTokenDecimals: Number(pairTokenDecimals),
                    totalSupplyPairToken: Number(totalSupplyPairToken),
                    tvl: Number(totalValue),
                    pairTokenOfSmartWallet: Number(pairTokenOfSmartWallet)
                });
            }
        }
        appState.pancakeSwapV2Pair.isFetch = true;
        return appState;
    } catch (error) {
        console.error(error);
    }
    return appState;
}

async function getDataTokenByAxios(address: EthAddress, chain: string) {
    let url = `${centic_api}/v3//tokens/price?chain=${chain}&addresses=${address}`
    try {
        const response = await axios.request({
          method: "get",
          url: url,
          headers: {
            "x-apikey": centic_api_key
          }
        })
        const data = response.data;
        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}