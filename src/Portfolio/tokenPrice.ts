import { getJsonProvider, multiCall } from "../utils/helper";
import { EthAddress, uint256 } from "../utils/types";
import { BASE_E18, BASE_E8, bnb, convertHexStringToAddress, getAddr, ZERO_ADDRESS } from "../utils";
import BEP20Abi from "../abis/BEP20.json";
import RouterAbi from "../abis/PancakeSwapRouter.json";
import FactoryAbi from "../abis/PancakeSwapFactory.json"
import PairAbi from "../abis/PancakeSwapPair.json"
import OracleAbi from "../abis/AaveOracle.json";
import BigNumber from "bignumber.js";
import { JsonRpcProvider } from "ethers";

export function isBNBToken(token: EthAddress, _chainId: number | string) {
    if (token.toLowerCase() == bnb || token.toLowerCase() == getAddr("WBNB_ADDRESS", _chainId).toLowerCase()) {
        return true;
    }
    return false
}

export function isUSDTToken(token: EthAddress, _chainId: number | string) {
    if (token.toLowerCase() == getAddr("USDT_ADDRESS", _chainId).toLowerCase()) {
        return true;
    }
    return false
}

export function isSpecialToken(token: EthAddress, _chainId: number | string) {
    if (token.toLowerCase() == bnb) {
        return true;
    }
    return false
}

export function getSpecialToken(token: EthAddress, _chainId: number | string) {
    const web3 = getJsonProvider(_chainId)

    if (token.toLowerCase() == bnb) {
        return getAddr("WBNB_ADDRESS", _chainId)
    }
    return convertHexStringToAddress(token);
}

export function convertTokens(_listTokens: Array<EthAddress>, _chainId: number | string) {
    const listTokens: Array<EthAddress> = new Array();
    for (let i = 0; i < _listTokens.length; i++) {
        if (isSpecialToken(_listTokens[i], _chainId)) {
            listTokens.push(getSpecialToken(_listTokens[i], _chainId))
        } else {
            listTokens.push(convertHexStringToAddress(_listTokens[i]));
        }
    }
    return listTokens;
}
export async function getTokenPrice(_listTokens: Array<EthAddress>, _chainId: number | string, _web3?: JsonRpcProvider) {
    const listTokenPrices: Array<uint256> = new Array();
    const web3 = _web3 ? _web3 : getJsonProvider(_chainId)

    const usdtAddress = getAddr("USDT_ADDRESS", _chainId);
    const wbnbAddress = getAddr("WBNB_ADDRESS", _chainId);

    const routerAddress = getAddr("RouterAddress", _chainId)

    let listTokensAfterFilter = _listTokens.filter(e => !isUSDTToken(e, _chainId));
    listTokensAfterFilter = convertTokens(listTokensAfterFilter, _chainId);
    const listPathTokensAfterFilter = listTokensAfterFilter.map(e => isBNBToken(e, _chainId) ? [wbnbAddress, usdtAddress] : [e, wbnbAddress, usdtAddress]);
    const mockupAmount = BASE_E18
    const [     
        decimals,
        amountOut,
        usdtPrice
    ] = await Promise.all(
        [
            multiCall(
                BEP20Abi,
                [...listTokensAfterFilter, usdtAddress].map((_tokenAddress: any, _: number) => ({
                    address: _tokenAddress,
                    name: "decimals",
                    params: []
                })),
                web3,
                _chainId
            ),
            multiCall(
                RouterAbi,
                [...listPathTokensAfterFilter].map((_path: any, _: number) => ({
                    address: routerAddress,
                    name: "getAmountsOut",
                    params: [mockupAmount, _path]
                })),
                web3,
                _chainId
            ),
            multiCall(
                OracleAbi,
                [usdtAddress].map((address: string, _: number) => ({
                    address: getAddr("ORACLE_ADDRESS", _chainId),
                    name: "getAssetPrice",
                    params: [address],
                })),
                web3,
                _chainId
            ),
        ]
    )
    const usdtPriceUSD = BigNumber(usdtPrice).div(BASE_E8).toFixed()

    let cnt = 0;
    for (let i = 0; i < _listTokens.length; i++) {

        if (isUSDTToken(_listTokens[i], _chainId)) {
            listTokenPrices.push(usdtPriceUSD)
        }
        else {
            let amount = isBNBToken(_listTokens[i], _chainId) ? String(amountOut[cnt][0][1]) : String(amountOut[cnt][0][2])
            // let convertPrice = (await getSpecialTokenPrice(_listTokens[i], _chainId, amount))!
            let price = BigNumber(amount)
                        .multipliedBy(usdtPriceUSD)
                        .div(mockupAmount)
                        .multipliedBy(BigNumber(10).pow(decimals[cnt]))
                        .div(BigNumber(10).pow(decimals[decimals.length - 1]))
                        .toFixed()
            listTokenPrices.push(price);
            cnt++;
        }
    }
    return listTokenPrices;
}

export async function getLPTokenPrice(_listLPTokens: Array<EthAddress>, _chainId: number | string, _web3?: JsonRpcProvider) {
    const web3 = _web3 ? _web3 : getJsonProvider(_chainId)

    const usdtAddress = getAddr("USDT_ADDRESS", _chainId);
    const wbnbAddress = getAddr("WBNB_ADDRESS", _chainId);

    const listLPTokens = _listLPTokens.map(e => convertHexStringToAddress(e));
    const factoryAddr = getAddr("FactoryAddress", _chainId)

    const [
        listToken0Addresses, 
        listToken1Addresses, 
        listTotalSupplies, 
        listDecimalsLP
    ] = await Promise.all(
        [
            multiCall(
                PairAbi,
                listLPTokens.map((_tokenAddress: any, _: number) => ({
                    address: _tokenAddress,
                    name: "token0",
                    params: []
                })),
                web3,
                _chainId
            ),
            multiCall(
                PairAbi,
                listLPTokens.map((_tokenAddress: any, _: number) => ({
                    address: _tokenAddress,
                    name: "token1",
                    params: []
                })),
                web3,
                _chainId
            ),
            multiCall(
                PairAbi,
                listLPTokens.map((_tokenAddress: any, _: number) => ({
                    address: _tokenAddress,
                    name: "totalSupply",
                    params: [],
                })),
                web3,
                _chainId
            ),
            multiCall(
                PairAbi,
                listLPTokens.map((_tokenAddress: any, _: number) => ({
                    address: _tokenAddress,
                    name: "decimals",
                    params: [],
                })),
                web3,
                _chainId
            )
        ]
    )

    const [
        listPair0,
        listPair1,
        listDecimals0,
        listDecimals1,
        listBalance0,
        listBalance1
    ] = await Promise.all(
        [
            multiCall(
                FactoryAbi,
                listToken0Addresses.map((_tokenAddress: any, _: number) => ({
                    address: factoryAddr,
                    name: "getPair",
                    params: [String(_tokenAddress), wbnbAddress]
                })),
                web3,
                _chainId
            ),
            multiCall(
                FactoryAbi,
                listToken1Addresses.map((_tokenAddress: any, _: number) => ({
                    address: factoryAddr,
                    name: "getPair",
                    params: [String(_tokenAddress), wbnbAddress]
                })),
                web3,
                _chainId
            ),
            multiCall(
                BEP20Abi,
                listToken0Addresses.map((_tokenAddress: any, _: number) => ({
                    address: String(_tokenAddress),
                    name: "decimals",
                    params: [],
                })),
                web3,
                _chainId
            ),
            multiCall(
                BEP20Abi,
                listToken1Addresses.map((_tokenAddress: any, _: number) => ({
                    address: String(_tokenAddress),
                    name: "decimals",
                    params: [],
                })),
                web3,
                _chainId
            ),
            multiCall(
                BEP20Abi,
                listToken0Addresses.map((_tokenAddress: any, i: number) => ({
                    address: String(_tokenAddress),
                    name: "balanceOf",
                    params: [listLPTokens[i]],
                })),
                web3,
                _chainId
            ),
            multiCall(
                BEP20Abi,
                listToken1Addresses.map((_tokenAddress: any, i: number) => ({
                    address: String(_tokenAddress),
                    name: "balanceOf",
                    params: [listLPTokens[i]],
                })),
                web3,
                _chainId
            )
        ]
    )

    // get tvl pool
    const listAmountToken: Array<uint256> = new Array(_listLPTokens.length)
    const listTokenPriceAddresses: Array<EthAddress>  = new Array(_listLPTokens.length)
    
    for(let i = 0; i < _listLPTokens.length; i++) {
        if(String(listPair0[i]) != ZERO_ADDRESS || isBNBToken(String(listToken0Addresses[i]), _chainId)) {
            listAmountToken[i] = BigNumber(String(listBalance0[i])).div(BigNumber(10).pow(String(listDecimals0[i]))).toFixed()
            listTokenPriceAddresses[i] = String(listToken0Addresses[i])
        } else if(String(listPair1[i]) != ZERO_ADDRESS || isBNBToken(String(listToken1Addresses[i]), _chainId)) {
            listAmountToken[i] = BigNumber(String(listBalance1[i])).div(BigNumber(10).pow(String(listDecimals1[i]))).toFixed()
            listTokenPriceAddresses[i] = String(listToken1Addresses[i])
        } else {
            listAmountToken[i] = "0"
            listTokenPriceAddresses[i] = ZERO_ADDRESS
        }
    }

    const listTokenPrices = await getTokenPrice(listTokenPriceAddresses, _chainId, _web3)
    let listLPTokenPrices: Array<uint256> = new Array(_listLPTokens.length)
    for(let i = 0; i < _listLPTokens.length; i++) {
        // lp price * lp amount = amount0 * price0 + amount1 * price1 = 2 * amount0 * price0 = 2 * amount1 * price1
        listLPTokenPrices[i] = BigNumber(2).multipliedBy(listAmountToken[i]).multipliedBy(listTokenPrices[i])
                                .div(BigNumber(String(listTotalSupplies[i])).div(BigNumber(10).pow(String(listDecimalsLP[i]))))
                                .toFixed()
    }
    return listLPTokenPrices
}