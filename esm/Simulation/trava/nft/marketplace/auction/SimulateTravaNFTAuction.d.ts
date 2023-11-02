import { EthAddress, knight_version, uint256 } from '../../../../../utils/types';
import { AuctioningNormalKnight, AuctioningSpecialKnight } from '../../helpers/global';
import { ApplicationState } from './../../../../../State/ApplicationState';
import { NFTAuctioningState } from '../../../../../State/TravaNFTState';
export declare function findTravaNFTKnightAuctioning(_tokenId: number | uint256, _nftAuctioning: NFTAuctioningState): {
    currentVersion: knight_version;
    curentIndex: number;
    currentNFT: AuctioningNormalKnight | AuctioningSpecialKnight;
};
export declare function simulateTravaNFTCreateAuction(appState1: ApplicationState, _tokenId: number, _startingBid: uint256, _duration: number, _from: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaNFTMakeBidAuction(appState1: ApplicationState, _tokenId: uint256, _bidPrice: uint256, _from: EthAddress, _minimumBidStepPercent?: number): Promise<ApplicationState>;
export declare function simulateTravaNFTEditAuctionPrice(appState1: ApplicationState, _tokenId: uint256, _startingBid: uint256): Promise<ApplicationState>;
export declare function simulateTravaNFTCancelAuction(appState1: ApplicationState, _tokenId: uint256, _to: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaNFTFinalizeAuction(appState1: ApplicationState, _tokenId: uint256, _to: EthAddress, _feePercentage?: number): Promise<ApplicationState>;
