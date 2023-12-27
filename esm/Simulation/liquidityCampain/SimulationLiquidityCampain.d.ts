import { ApplicationState } from "../../State";
import { EthAddress } from "../../utils/types";
export declare function SimulationJoinLiquidity(_appState: ApplicationState, _liquidity: EthAddress, _from: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationWithdrawLiquidity(_appState: ApplicationState, _liquidity: EthAddress, _to: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationClaimRewardLiquidity(_appState: ApplicationState, _liquidity: EthAddress, _to: EthAddress, _amount: EthAddress): Promise<ApplicationState>;
