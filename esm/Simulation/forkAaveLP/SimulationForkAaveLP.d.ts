import BigNumber from "bignumber.js";
import { ApplicationState } from "../../State";
import { EthAddress } from "../../utils/types";
export declare function calculateMaxAmountForkAaveSupply(appState: ApplicationState, _entity_id: string, _tokenAddress: string, _from: EthAddress): BigNumber;
export declare function calculateMaxAmountForkAaveBorrow(appState: ApplicationState, _entity_id: string, _tokenAddress: string): BigNumber;
export declare function calculateMaxAmountForkAaveRepay(appState: ApplicationState, _entity_id: string, _tokenAddress: string, _from: EthAddress): BigNumber;
export declare function calculateMaxAmountForkAaveWithdraw(appState: ApplicationState, _entity_id: string, _tokenAddress: string): BigNumber;
export declare function SimulationSupplyForkAaveLP(appState1: ApplicationState, _from: EthAddress, _entity_id: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationWithdrawForkAaveLP(appState1: ApplicationState, _from: EthAddress, _entity_id: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationBorrowForkAaveLP(appState1: ApplicationState, _from: EthAddress, _entity_id: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
export declare function SimulationRepayForkAaveLP(appState1: ApplicationState, _from: EthAddress, _entity_id: string, _tokenAddress: EthAddress, _amount: string): Promise<ApplicationState>;
