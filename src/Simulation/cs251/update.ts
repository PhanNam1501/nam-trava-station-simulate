import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import ERC20Mock from "../../abis/ERC20Mock.json";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Address } from "ethereumjs-util";
import { uint256 } from "trava-station-sdk";
import exchangeabi from "../../abis/exchangeabi.json"
import { cs251statechange } from "../../State/cs251";
import { multiCall } from "../../utils/helper"; // Import multiCall

export async function updateCS251State(appState1: ApplicationState, exchange: string, force?: boolean): Promise<ApplicationState> {
    const appState = {...appState1};
    let tokenAddr;
    if(!appState.cs251state.cs251state.has(exchange) || force) {
        const exchangeContract = new Contract(exchange,exchangeabi,appState.web3);
       /* This code snippet is fetching data from a smart contract represented by the
       `exchangeContract` instance. Here's a breakdown of what each line is doing: */
        // const totalshare = await exchangeContract.getTotalShares()
        // console.log(totalshare)
        // const lp = await exchangeContract.getlps()
        // const reserve = await exchangeContract.getLiquidity()
        // console.log(reserve);
        // const token_reserve = reserve[0]
        // const eth_reserve = reserve[1]
        // console.log(token_reserve);
        // console.log(typeof(eth_reserve));
        tokenAddr = await exchangeContract.token();
        const exchangeAddr = [];
        exchangeAddr.push(exchange);

        const [totalshare, lp, reserve] = await Promise.all([
            multiCall(
                exchangeabi,
                exchangeAddr.map((address: EthAddress, index: number) => ({
                    address: exchange,
                    name: "getTotalShares",
                    params: [],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                exchangeabi,
                exchangeAddr.map((address: EthAddress, index: number) => ({
                    address: exchange,
                    name: "getlps",
                    params: [],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                exchangeabi,
                exchangeAddr.map((address: EthAddress, index: number) => ({
                    address: exchange,
                    name: "getLiquidity",
                    params: [],
                })),
                appState.web3,
                appState.chainId
            )
        ]);

        const token_reserve = reserve[0][0]
        const eth_reserve = reserve[0][1]
        const total_shares = totalshare[0]
        const lps = lp[0]
        


        
        const exchangeState: cs251statechange = {
            eth_reserve: Number(eth_reserve),
            token_reserve: Number(token_reserve),
            total_shares: Number(total_shares),
            lps: Number(lps),
            tokenAddr : tokenAddr,
        }
        appState.cs251state.cs251state.set(exchange, exchangeState)
        
    }
    return appState;
    
    }
    