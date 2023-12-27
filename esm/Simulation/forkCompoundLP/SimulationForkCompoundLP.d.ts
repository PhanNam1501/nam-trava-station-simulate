import { ApplicationState } from "../../State";
import { EthAddress } from "../../utils/types";
export declare function SimulationSupplyForkCompoundLP(appState1: ApplicationState, _from: EthAddress, _idLP: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationWithdrawForkCompoundLP(appState1: ApplicationState, _from: EthAddress, _idLP: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationBorrowForkCompoundLP(appState1: ApplicationState, _from: EthAddress, _idLP: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationRepayForkCompoundLP(appState1: ApplicationState, _from: EthAddress, _idLP: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
