import { uint256 } from "../../../utils/types";
import { BaseAccountVault } from "../lending";
export declare class LiquidityCampainState {
    liquidityCampainList: Map<string, LiquidityCampain>;
    isFetch: boolean;
    constructor();
}
export interface LiquidityCampain extends BaseAccountVault {
    lockTime: uint256;
    maxTotalDeposit: uint256;
}
