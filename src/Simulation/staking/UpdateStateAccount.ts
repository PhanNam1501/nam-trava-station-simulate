import { Contract, JsonRpcApiProvider } from "ethers";
import { ApplicationState } from "../../State/ApplicationState";
import StakedTokenAbi from "../../abis/StakedToken.json";
import VestingTokenAbi from "../../abis/VestingTrava.json";
import {getAddr} from "../../utils/address";
import { VAULT_TYPES, listStakingVault } from "../../utils/stakingVaultConfig";
import { NETWORKS } from "../../utils/config";
import { EthAddress } from "../../utils/types";
import { BaseAccountVault } from "../../State/TravaDeFiState";
export async function fetchAllAccountVault(appState1: ApplicationState){
  const vaultConfigList = listStakingVault[appState1.chainId];
  const appState = {...appState1};
  const promises = vaultConfigList.map(async (vaultConfig) => {
    return fetchAccountVault(appState1.smartWalletState.address,appState1.web3,vaultConfig,appState1.chainId)
  })
  const accountVaults = await Promise.all(promises);
  appState.smartWalletState.travaLPStakingStateList = accountVaults;
  return appState;
}
export async function fetchAccountVault(accountAddress:EthAddress,web3Reader:JsonRpcApiProvider,vaultConfig:any,chainId:number) : Promise<BaseAccountVault>
{
    const { id: vaultId, stakedTokenAddress } = vaultConfig;
    const stakedCR = new Contract(stakedTokenAddress,StakedTokenAbi,web3Reader);
  
    // rewards
    const { claimableReward, claimedReward, totalReward, rewardConfig } = await fetchReward(accountAddress,web3Reader,vaultConfig,chainId);
    //const reward = is3RewardVault(vaultConfig) ? claimableReward : totalReward;
  
    // deposited
    const depositedRaw = await stakedCR.balanceOf(accountAddress);
    const deposited = String(BigInt(depositedRaw));
  
    return {
      ...vaultConfig,
      claimableReward,
      claimedReward,
      deposited,
    };
}
function is3RewardVault(vault :any){
    return vault.vaultType === VAULT_TYPES.BASE || vault.vaultType === VAULT_TYPES.REWARD_ON_FTM;
}
function isNative(chainId : number ,vaultId : string){
    return ((chainId== Number(NETWORKS.bsc.chainId) || chainId == Number(NETWORKS.bscMainnet.chainId) ) && vaultId == "bsc")
}
export async function fetchReward(accountAddress :EthAddress,web3Reader: JsonRpcApiProvider,vaultConfig : any,chainId:number){
  const { id: vaultId, underlyingAddress, stakedTokenAddress, reserveDecimals } = vaultConfig;
  const stakedCR = new Contract(stakedTokenAddress,StakedTokenAbi,web3Reader);
  let vestingCR;
  const normalVestingCR = new Contract(getAddr("VESTING_TRAVA_ADDRESS",chainId),VestingTokenAbi,web3Reader);

  vestingCR = normalVestingCR;
  // claimable
  let claimableReward = "0";
  // claimed
  let claimedReward = "0";

  if (is3RewardVault(vaultConfig)) {
    const claimableRewardRaw = await vestingCR.getClaimableReward(accountAddress, underlyingAddress)
    claimableReward = String(BigInt(claimableRewardRaw));

    const claimedRewardRaw = await vestingCR.getClaimedReward(accountAddress, underlyingAddress)
    claimedReward = String(BigInt(claimedRewardRaw));
  }

  // totalReward
  let totalReward ="0";
  let rewardConfig="0";
  if (vaultId === "busd" || vaultId === "bnb") {
    const totalRewardRaw = await normalVestingCR.getTotalReward(accountAddress, underlyingAddress)
    totalReward = String(BigInt(totalRewardRaw));
  } else {
    const totalRewardRaw = await stakedCR.getTotalRewardsBalance(accountAddress)
    totalReward = String(BigInt(totalRewardRaw));
    
  }
  return {
    ...vaultConfig,
    claimableReward,
    claimedReward,
    totalReward,
    rewardConfig,
  };

}