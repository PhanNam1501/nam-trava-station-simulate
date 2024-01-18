"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeTravaListState = exports.TravaGovernanceState = void 0;
class TravaGovernanceState {
    constructor() {
        this.totalSupply = "",
            this.rewardTokenInfo = {
                address: "",
                decimals: "",
            };
        this.tokensInGovernance = new Map();
    }
}
exports.TravaGovernanceState = TravaGovernanceState;
class VeTravaListState {
    constructor() {
        this.veTravaList = new Map();
        this.isFetch = false;
    }
}
exports.VeTravaListState = VeTravaListState;
