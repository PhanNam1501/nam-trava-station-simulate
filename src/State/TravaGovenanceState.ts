import { EthAddress, uint256 } from "trava-station-sdk";
import { TokenLockOption } from './../Simulation/trava/governance/travaGovernanceConfig';

export interface TravaGovernanceState {
  totalSupply: uint256;
  rewardTokenInfo: rewardTokenInfo;
  tokensInGovernance: Map<string, TokenLockOption>;
}


export interface TokenInVeTrava {
  balances: uint256;
  tokenLockOption: TokenLockOption;
}

export interface RewardTokenBalance {
  compoundAbleRewards: uint256;
  compoundedRewards: uint256;
  balances: uint256;
}

export interface rewardTokenInfo {
  address: EthAddress;
  decimals: uint256;
}

export interface VeTravaState {
  id: uint256;
  votingPower: uint256;
  tokenInVeTrava: TokenInVeTrava;
  unlockTime: uint256;
  rewardTokenBalance: RewardTokenBalance;
}

