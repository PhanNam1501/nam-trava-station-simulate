import { ApplicationState } from "../../State";
import { EthAddress } from "../../utils/types";
export declare function SimulationSupplyForkAaveLP(appState1: ApplicationState, _from: EthAddress, _idLP: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationWithdrawForkAaveLP(appState1: ApplicationState, _from: EthAddress, _idLP: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationBorrowForkAaveLP(appState1: ApplicationState, _from: EthAddress, _idLP: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationRepayForkAaveLP(appState1: ApplicationState, _from: EthAddress, _idLP: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
