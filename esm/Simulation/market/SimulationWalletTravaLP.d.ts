import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function SimulationSupply(appState1: ApplicationState, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationBorrow(appState1: ApplicationState, _to: EthAddress, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationRepay(appState1: ApplicationState, _from: EthAddress, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationWithdraw(appState1: ApplicationState, _to: EthAddress, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationClaimReward(appState1: ApplicationState, amount: string): Promise<ApplicationState>;
export declare function SimulationConvertReward(appState1: ApplicationState, to: EthAddress, amount: string): Promise<ApplicationState>;
