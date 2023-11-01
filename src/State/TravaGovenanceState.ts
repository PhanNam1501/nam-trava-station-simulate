import { EthAddress, uint256 } from "trava-station-sdk";
import { TokenLockOption } from './../Simulation/trava/governance/travaGovernanceConfig';

export class TravaGovernanceState {
  totalSupply: uint256;
  rewardTokenInfo: rewardTokenInfo;
  tokensInGovernance: Map<string, TokenLockOption>;
  constructor() {
    this.totalSupply = ""
    this.rewardTokenInfo = {
      address: "",
      decimals: ""
    }
    this.tokensInGovernance = new Map()
  }
}


export interface TokenInVeTrava {
  balances: uint256;
  address: EthAddress;
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

export class VeTravaState {
  id: uint256;
  votingPower: uint256;
  tokenInVeTrava: TokenInVeTrava;
  unlockTime: uint256;
  rewardTokenBalance: RewardTokenBalance;

  constructor() {
    this.id = "";
    this.votingPower = "";
    this.tokenInVeTrava = {
      address: "",
      balances: "",
    };
    this.unlockTime = "";
    this.rewardTokenBalance = {
      compoundAbleRewards: "",
      compoundedRewards: "",
      balances: ""
    };
  }
}

