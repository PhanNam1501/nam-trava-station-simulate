
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import _ from "lodash";
import { PancakeFarmStateChange, UserPancakeFarmStateChange } from "../../State/pancake-farm";
import { listFarmingV2List } from "../../utils";
import { getMode, multiCall } from "../../utils/helper";
import v2wrapperabi from "../../abis/v2wrapperabi.json"
import BEP20Abi from "../../abis/BEP20.json";
import { getLPTokenPrice, getTokenPrice } from "../../Portfolio";




export async function updatePancakeFarmState(appState1: ApplicationState, address: EthAddress, force?: boolean): Promise<ApplicationState> {
    const appState = { ...appState1 };
    const farmConfig = listFarmingV2List[appState.chainId];
    const modeFrom = getMode(appState1, address)
    if (!appState.PancakeFarmState.isFetch || !appState[modeFrom].pancakeFarmState.isFetch || force) {
        const listStakedToken: Array<EthAddress> = new Array(farmConfig.length)
        const listRewardTokens: Array<EthAddress> = new Array(farmConfig.length)

        for(let i = 0; i < farmConfig.length; i++) {
            listStakedToken[i] = farmConfig[i].stakedToken.address.toLowerCase()
            listRewardTokens[i] = farmConfig[i].rewardToken.address.toLowerCase()
        }

        const stakedTokenPrices = await getLPTokenPrice(listStakedToken, appState.chainId, appState.web3)
        const rewardTokenPrices = await getTokenPrice(listRewardTokens, appState.chainId, appState.web3)

        let [
            userInfos,
            rewardPerSeconds,
            pendingRewards,
            totalStakeAmount
        ] = await Promise.all([
            multiCall(
                v2wrapperabi,
                farmConfig.map((_: any, i: number) => ({
                    address: farmConfig[i].v2WrapperAddress,
                    name: "userInfo",
                    params: [appState[modeFrom].address],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                v2wrapperabi,
                farmConfig.map((_: any, i: number) => ({
                    address: farmConfig[i].v2WrapperAddress,
                    name: "rewardPerSecond",
                    params: [],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                v2wrapperabi,
                farmConfig.map((_: any, i: number) => ({
                    address: farmConfig[i].v2WrapperAddress,
                    name: "pendingReward",
                    params: [appState[modeFrom].address],
                })),
                appState.web3,
                appState.chainId
            ),
            multiCall(
                BEP20Abi,
                farmConfig.map((_: any, i: number) => ({
                    address: farmConfig[i].stakedToken.address,
                    name: "balanceOf",
                    params: [farmConfig[i].v2WrapperAddress],
                })),
                appState.web3,
                appState.chainId
            )
        ]);
        let userPancakeFarmState: UserPancakeFarmStateChange;
        let pancakeFarmState: PancakeFarmStateChange;
        for(let i = 0; i < farmConfig.length; i++) {
            userPancakeFarmState = {
                stakedAmount: String(userInfos[i][0]),
                pendingReward: String(pendingRewards[i])
            }
            pancakeFarmState = {
                rewardPerSecond: String(rewardPerSeconds[i]),
                totalStakeAmount: String(totalStakeAmount[i]),
                rewardToken: {
                    ...farmConfig[i].rewardToken,
                    address: listRewardTokens[i]
                },
                stakedToken: {
                    ...farmConfig[i].rewardToken,
                    address: listStakedToken[i]
                }

            }
            if(appState[modeFrom].pancakeFarmState.isFetch == false) {
                appState[modeFrom].pancakeFarmState.userPancakeFarmState.set(farmConfig[i].v2WrapperAddress.toLowerCase(), userPancakeFarmState)
            }
            if(appState.PancakeFarmState.isFetch == false) {
                appState.PancakeFarmState.PancakeFarmState.set(farmConfig[i].v2WrapperAddress.toLowerCase(), pancakeFarmState)
            }

            if(!appState.tokenPrice.has(listStakedToken[i])) {
                appState.tokenPrice.set(listStakedToken[i], stakedTokenPrices[i])
            } 

            if(!appState.tokenPrice.has(listRewardTokens[i])) {
                appState.tokenPrice.set(listRewardTokens[i], rewardTokenPrices[i])
            }

        }
        appState[modeFrom].pancakeFarmState.isFetch = true;
        appState.PancakeFarmState.isFetch = true;

    }
    return appState;
}


