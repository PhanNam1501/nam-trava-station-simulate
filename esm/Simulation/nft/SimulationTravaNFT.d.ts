import { EthAddress } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
export declare function simulateTravaNFTBuy(appState: ApplicationState, tokenId: number | string, from: EthAddress, to: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaNFTSell(appState: ApplicationState, tokenId: number | string, price: number | string, from: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaNFTTransfer(appState: ApplicationState, from: EthAddress, to: EthAddress, tokenId: number | string, contract: EthAddress): Promise<ApplicationState>;
