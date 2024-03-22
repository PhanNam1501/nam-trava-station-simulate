import { EthAddress } from "../../../../utils/types";
import { ApplicationState } from "../../../../State/ApplicationState";
export declare function simulateTravaNFTTransfer(appState1: ApplicationState, from: EthAddress, to: EthAddress, tokenId: number | string, contract: EthAddress): Promise<ApplicationState>;
