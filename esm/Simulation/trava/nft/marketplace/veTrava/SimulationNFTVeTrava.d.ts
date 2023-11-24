import { ApplicationState } from "../../../../../State/ApplicationState";
import { EthAddress, uint256 } from "../../../../../utils/types";
export declare function simulateNFTVeTravaCreateSale(_appState1: ApplicationState, _NFTId: uint256, _from: EthAddress, _price: uint256, _priceTokenAddress: EthAddress): Promise<ApplicationState>;
export declare function simulateNFTVeTravaCancelSale(_appState1: ApplicationState, _NFTId: uint256, _to: EthAddress): Promise<ApplicationState>;
export declare function simulateNFTVeTravaBuy(_appState1: ApplicationState, _NFTId: uint256, _from: EthAddress, _to: EthAddress): Promise<ApplicationState>;
