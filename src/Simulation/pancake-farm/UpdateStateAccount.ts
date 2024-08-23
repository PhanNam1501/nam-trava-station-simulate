
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import ERC20Mock from "../../abis/ERC20Mock.json";
import { Contract } from "ethers";
import _ from "lodash";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import { Address } from "ethereumjs-util";
import { uint256 } from "trava-station-sdk";
import v2wrapperabi from "../../abis/v2wrapperabi.json"
import { PancakeFarmStateChange } from "../../State/pancake-farm";




export async function updatePancakeFarmState(appState1: ApplicationState,  v2Wrapper: string, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };
    if (!appState.PancakeFarmState.PancakeFarmState.has(v2Wrapper) || force) {
        const PancakeFarmContract = new Contract (v2Wrapper, v2wrapperabi,appState.web3)
        const userInfo = await PancakeFarmContract.userInfo(appState1.smartWalletState.address)
        const stakedAmount = userInfo[0]

        const rewardPerSecond = await PancakeFarmContract.rewardPerSecond()
        const pendingReward = await PancakeFarmContract.pendingReward(appState1.smartWalletState.address)
        
        const PancakeFarmState: PancakeFarmStateChange = {
            stakedAmount: String(stakedAmount),
            rewardPerSecond: String(rewardPerSecond),
            pendingReward: String(pendingReward),
            
        }
        appState.PancakeFarmState.PancakeFarmState.set(v2Wrapper, PancakeFarmState)

    }
    return appState;
}


