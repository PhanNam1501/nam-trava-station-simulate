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

export async function updateCS251State(appState1: ApplicationState, exchange: string, force?: boolean): Promise<ApplicationState> {
    const appState = {...appState1};
    console.log(1)
    if(!appState.cs251state.cs251state.has(exchange) || force) {
        const exchangeContract = new Contract(exchange,exchangeabi,appState.web3);
        console.log(3)
        const totalshare = await exchangeContract.getTotalShares()
        console.log(4)
        const lp = await exchangeContract.getlps()
        console.log(5)
        const reserve = await exchangeContract.getLiquidity()
        console.log(6)
        const token_reserve = reserve[0]
        const eth_reserve = reserve[1]
        console.log(2)
        
        const exchangeState: cs251statechange = {
            eth_reserve: String(eth_reserve),
            token_reserve: String(token_reserve),
            total_shares: String(totalshare),
            lps: String(lp)
        }
        appState.cs251state.cs251state.set(exchange, exchangeState)

    }
    return appState;
}