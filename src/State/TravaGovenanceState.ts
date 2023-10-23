export interface TokenInGovernance {
    address: string;
    balances: string;
    decimals: string;
  }

export interface RewardTokenData {
    address: string;
    balances: string;
    decimals: string;
    price: string;
}

export class LockBalance {
    id: string;
    status: string;
    votingPower: string;
    tokenInGovernance: TokenInGovernance;
    unlockTime: string;
    reward: RewardTokenData;

    constructor() {
      this.id = "";
      this.status = "";
      this.votingPower = "";
      this.tokenInGovernance = {
        address: "",
        balances: "",
        decimals: "",
      };
      this.unlockTime = "";
      this.reward = {
        address: "",
        balances: "",
        decimals: "",
        price: "",
      };
    }
}

