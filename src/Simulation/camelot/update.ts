import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import ERC20Mock from "../../abis/ERC20Mock.json";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Address } from "ethereumjs-util";
import { uint256 } from "trava-station-sdk";
import camelotpairabi from "../../abis/camelotpairabi.json"
import { camelotstatechange } from "../../State/camelot";
import tokenpair from "./pair.json";
import { multiCall } from "../../utils/helper";
 

export async function updateCamelotState(appState1: ApplicationState , account: EthAddress,force?: boolean): Promise<ApplicationState> {
    const appState = {...appState1};
    
    let pairs : string[][] = [];
    for (let pair of tokenpair) {
        pairs.push([pair.address1, pair.address2, pair.pairAddress]);
    }

    const [reserves, liquidity, totalSupply] = await Promise.all([
        multiCall(
            camelotpairabi,
            pairs.map((pair: string[], index: number) => ({
                address: pair[2],
                name: "getReserves",
                params: [],
            })),
            appState.web3,
            appState.chainId
        ),
        multiCall(
            camelotpairabi,
            pairs.map((pair: string[], index: number) => ({
                address: pair[2],
                name: "balanceOf",
                params: [account],
            })),
            appState.web3,
            appState.chainId
        ),
        multiCall(
            camelotpairabi,
            pairs.map((pair: string[], index: number) => ({
                address: pair[2],
                name: "totalSupply",
                params: [],
            })),
            appState.web3,
            appState.chainId
        ),
    ]);
    
    
    for (let i = 0; i < pairs.length; i++) {
        let pairAddress = tokenpair[i].pairAddress;
        if(!appState.camelotstate.camelotstate.has(pairAddress) || force) {
            let camelotState: camelotstatechange = {
                token0addr : tokenpair[i].address1,
                token1addr : tokenpair[i].address2,
                pairaddr : pairAddress,
                reserves0: Number(reserves[i][0]),
                reserves1: Number(reserves[i][1]),
                liquidity: Number(liquidity[i]),
                totalSupply: Number(totalSupply[i])
                
            }
            appState.camelotstate.camelotstate.set(pairAddress, camelotState)
        }

    }
    return appState;
}