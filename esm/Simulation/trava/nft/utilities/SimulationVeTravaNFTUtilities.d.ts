import { ApplicationState } from "../../../../State/ApplicationState";
import { EthAddress, uint256 } from "../../../../utils/types";
export declare function simulateNFTVeTravaTranfer(_appState1: ApplicationState, _NFTId: uint256, _from: EthAddress, _to: EthAddress): Promise<ApplicationState>;
