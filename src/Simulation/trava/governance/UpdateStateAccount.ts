import { Contract, Interface } from "ethers";
import { getAddr } from "../../../utils/address";
import MultiCallABI from "../../../abis/Multicall.json";
import VeABI from "../../../abis/Ve.json";

import { LockBalance } from "../../../State/TravaGovenanceState";

import { listStakingVault } from "../../../utils/stakingVaultConfig";
import { ApplicationState } from "../../../State/ApplicationState";

export async function updateAllLockBalance(appState1: ApplicationState) {
    const vaultConfigList = listStakingVault[appState1.chainId];
    let appState = { ...appState1 };

    // id: string;
    // status: string;
    // votingPower: string;
    // tokenInGovernance: TokenInGovernance;
    // unlockTime: string;
    // reward: RewardTokenData;
    //0xAe68A6Aa889DddDB27B458bc9038aBD308ff147C
    
    let underlyingAddress = new Array<string>;
    let priceUnderlyingAddress = new Array<string>
    let lpAddress = new Array<string>;
    let stakedTokenAddress = new Array<string>;
    let rewardTokenAddress = new Array<string>;
    for (let i = 0; i < vaultConfigList.length; i++) {
      underlyingAddress.push(vaultConfigList[i].underlyingAddress);
      priceUnderlyingAddress.push(vaultConfigList[i].priceUnderlyingAddress);
      lpAddress.push(vaultConfigList[i].lpAddress)
      stakedTokenAddress.push(vaultConfigList[i].stakedTokenAddress);
      rewardTokenAddress.push(vaultConfigList[i].rewardToken.address)
    }
    let [
      id, // data of total deposit in all vaults
    ] = await Promise.all([
      multiCall(
        VeABI,
        stakedTokenAddress.map((address: string, _: number) => ({
          address: address,
          name: "tokenURI",
          params: [appState.smartWalletState.address],
        })),
        appState.web3,
        appState.chainId
      ),
      
    ]);
}






const multiCall = async (abi: any, calls: any, provider: any, chainId: any) => {
    let _provider = provider;
    const multi = new Contract(
      getAddr("MULTI_CALL_ADDRESS", chainId),
      MultiCallABI,
      _provider
    );
    const itf = new Interface(abi);
  
    const callData = calls.map((call: any) => [
      call.address.toLowerCase(),
      itf.encodeFunctionData(call.name as string, call.params),
    ]);
    const { returnData } = await multi.aggregate(callData);
    return returnData.map((call: any, i: any) =>
      itf.decodeFunctionResult(calls[i].name, call)
    );
  };