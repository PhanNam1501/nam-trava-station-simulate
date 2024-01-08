import { uint256 } from "../../../utils/types";
import { BaseAccountVault } from "../lending";

export class LiquidityCampainState {
    liquidityCampainList: Map<string, LiquidityCampain>;
    isFetch: boolean;
    constructor() {
        this.liquidityCampainList = new Map();
        this.isFetch = false;
    }
}

export interface LiquidityCampain extends BaseAccountVault{
    lockTime: uint256;
    maxTotalDeposit: uint256;
}