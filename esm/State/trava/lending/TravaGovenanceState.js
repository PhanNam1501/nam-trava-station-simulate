export class TravaGovernanceState {
    constructor() {
        this.totalSupply = "",
            this.rewardTokenInfo = {
                address: "",
                decimals: "",
            };
        this.tokensInGovernance = new Map();
    }
}
export class VeTravaListState {
    constructor() {
        this.veTravaList = new Map();
        this.isFetch = false;
    }
}
