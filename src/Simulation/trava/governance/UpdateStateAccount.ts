import { Contract, Interface, id } from "ethers";
import { getAddr } from "../../../utils/address";
import MultiCallABI from "../../../abis/Multicall.json";
import VeABI from "../../../abis/Ve.json";

import { LockBalance } from "../../../State/TravaGovenanceState";

import { listStakingVault } from "../../../utils/stakingVaultConfig";
import { ApplicationState } from "../../../State/ApplicationState";
import { Address } from "ethereumjs-util";
import { ethers } from "ethers" ;
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
    
    let VeAddress = "0x7E41803de7781f53D1901A3d70A3D3747b3B3B63"
    console.log("-------------------Huhu--------------------");
    let [
      ids, // data of total deposit in all vaults
      votingPowers,
    ] = await Promise.all([
      multiCall(
        VeABI,
        [VeAddress].map((address: string, _: number) => ({
          address: address,
          name: "getveNFTOfUser",
          params: [appState.walletState.address],
        })),
        appState.web3,
        appState.chainId
      ),
      multiCall(
        VeABI,
        [VeAddress].map((address: string, _: number) => ({
          address: address,
          name: "balanceOfNFT",
          params: [],
        })),
        appState.web3,
        appState.chainId
      ),
    ]);

    console.log("-------------------Haha--------------------");
    console.log(ids);
    console.log(votingPowers);
    return appState;
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