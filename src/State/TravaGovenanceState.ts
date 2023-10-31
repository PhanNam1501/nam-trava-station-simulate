export interface TokenInGovernance {
    address: string;
    balances: string;
    decimals: string;
  }

export interface RewardTokenData {
    address: string;
    compoundAbleRewards: string;
    compoundedRewards: string;
    balances: string;
    decimals: string;
}

export class LockBalance {
    id: string;
    votingPower: string;
    tokenInGovernance: TokenInGovernance;
    unlockTime: string;
    reward: RewardTokenData;

    constructor() {
      this.id = "";
      this.votingPower = "";
      this.tokenInGovernance = {
        address: "",
        balances: "",
        decimals: "",
      };
      this.unlockTime = "";
      this.reward = {
        address: "",
        compoundAbleRewards: "",
        compoundedRewards: "",
        balances: "",
        decimals: "",
      };
    }
}

