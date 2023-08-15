import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function SimulationSupply(appState: ApplicationState, tokenAddress: EthAddress, amount: string): Promise<void>;
export declare function SimulationBorrow(appState: ApplicationState, tokenAddress: EthAddress, amount: string): Promise<void>;
export declare function SimulationRepay(appState: ApplicationState, tokenAddress: EthAddress, amount: string): Promise<void>;
export declare function SimulationWithdraw(appState: ApplicationState, tokenAddress: EthAddress, amount: string): Promise<void>;
