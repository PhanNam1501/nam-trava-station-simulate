import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function simulateTravaNFTBuy(appState1: ApplicationState, tokenId: number | string, from: EthAddress, to: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaNFTSell(appState1: ApplicationState, tokenId: number | string, price: number | string, from: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaNFTTransfer(appState1: ApplicationState, from: EthAddress, to: EthAddress, tokenId: number | string, contract: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaNFTCancelSale(appState1: ApplicationState, to: EthAddress, tokenId: number | string): Promise<ApplicationState>;
