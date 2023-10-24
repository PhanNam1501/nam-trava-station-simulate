
import { EthAddress, knight_version, uint256, wallet_mode } from '../../../../../utils/types';
import { AuctionKnightData, AuctioningNormalKnight, AuctioningSpecialKinght, ChangeAuctionKnightData, NormalKnight, SpecialKnight } from '../../helpers/global';
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../../../../basic/UpdateStateAccount";
import { ApplicationState } from './../../../../../State/ApplicationState';
import { getAddr } from "../../../../../utils/address";
import BigNumber from 'bignumber.js';
import { MAX_UINT256, ZERO_ADDRESS } from '../../../../../utils/config';
import { FromAddressError, NFTIsNotOnGoingError, NFTNotFoundError } from '../../../../../utils/error';
import { NFTAuctioningState } from '../../../../../State/TravaNFTState';
import { isAuctionOngoing } from "./UpdateStateAccount";

export function findTravaNFTKnightAuctioning(
    _tokenId: number | uint256,
    _nftAuctioning: NFTAuctioningState
) {
    let currentVersion: knight_version = "v1";
    let curentIndex = _nftAuctioning.v1.findIndex(
        (n) => n.id == _tokenId
    );
    if (curentIndex == -1) {
        curentIndex = _nftAuctioning.v2.findIndex(
            (n) => n.id == _tokenId
        )
        currentVersion = "v2";
    }
    if (curentIndex == -1) {
        curentIndex = _nftAuctioning.specials.findIndex(
            (n) => n.id == _tokenId
        )
        currentVersion = "specials";


    }

    if (curentIndex == -1) {
        throw new NFTNotFoundError("Knight is not in auctioned!")
    }

    let currentNFT = _nftAuctioning[currentVersion][curentIndex]!


    return {
        currentVersion: currentVersion,
        curentIndex: curentIndex,
        currentNFT: currentNFT
    }

}
export async function simulateTravaNFTCreateAuction(
    appState1: ApplicationState,
    _tokenId: number,
    _startingBid: uint256,
    _duration: number,
    _from: EthAddress
): Promise<ApplicationState> {
    const appState = { ...appState1 };
    try {
        let mode: wallet_mode;
        if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
            mode = "walletState"
        } else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            mode = "smartWalletState"
        }
        else {
            throw new FromAddressError()
        }

        let changeAuctionKnightData: ChangeAuctionKnightData = {
            newStartingBid: "",
            newEndTime: ""
        }

        let startTime = (await appState.web3.getBlock('latest'))?.timestamp! * 1000;
        let auctionKnightData: AuctionKnightData = {
            ...changeAuctionKnightData,
            nftSeller: _from,
            startingBid: _startingBid,
            currentBidder: ZERO_ADDRESS,
            currentBid: _startingBid,
            startTime: startTime,
            endTime: startTime + _duration,
            bidSteps: 0
        }


        let currentVersion: knight_version = "v1";
        let currentNFT: NormalKnight | undefined = appState[mode].collection.v1.find((n) => n.id == _tokenId);
        if (!currentNFT) {
            currentNFT = appState[mode].collection.v2.find((n) => n.id == _tokenId)
            currentVersion = "v2";
        }
        if (!currentNFT) {
            let currentNFTSpecial: SpecialKnight | undefined = appState[mode].collection.specials.find((n) => n.id == _tokenId)
            if (currentNFTSpecial) {
                currentVersion = "specials";
                let auctioningSpecialKinght: AuctioningSpecialKinght = {
                    ...currentNFTSpecial,
                    ...auctionKnightData
                }
                appState.NFTAuctioningState[currentVersion].push(auctioningSpecialKinght)
            } else {
                throw new NFTNotFoundError("Knight is not found!")
            }

            appState[mode].collection[currentVersion] = appState[mode].collection[currentVersion].filter(x => x.id != _tokenId)
        }
        else {
            let auctioningNormalKnight: AuctioningNormalKnight = {
                ...currentNFT,
                ...auctionKnightData
            }
            appState.NFTAuctioningState[currentVersion].push(auctioningNormalKnight)

            appState[mode].collection[currentVersion] = appState[mode].collection[currentVersion].filter(x => x.id != _tokenId)
        }

    } catch (err) {
        console.log(err)
    }
    return appState
}

export async function simulateTravaNFTMakeBidAuction(
    appState1: ApplicationState,
    _tokenId: uint256,
    _bidPrice: uint256,
    _from: EthAddress
): Promise<ApplicationState> {
    const appState = { ...appState1 };
    try {
        let mode: wallet_mode = "walletState"
        if (_from == appState.smartWalletState.address) {
            mode = "smartWalletState"
        } else {
            throw new FromAddressError()
        }

        const travaAddress = getAddr("TRAVA_TOKEN", appState1.chainId).toLowerCase();

        // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
        if (!appState[mode].tokenBalances.has(travaAddress)) {
            await updateUserTokenBalance(appState, travaAddress);
            await updateSmartWalletTokenBalance(appState, travaAddress);
        }

        let travaBalance = appState[mode].tokenBalances.get(travaAddress)!;

        let bidPrice = BigNumber(_bidPrice);
        if (
            bidPrice.toFixed(0) == MAX_UINT256 || bidPrice.isEqualTo(MAX_UINT256)
        ) {
            bidPrice = BigNumber(travaBalance)
        }

        let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
        let currentVersion = auctionKnight.currentVersion;
        let currentIndex = auctionKnight.curentIndex;
        let currentNFT = auctionKnight.currentNFT;

        let currentTime = (await appState.web3.getBlock('latest'))?.timestamp! * 1000;

        if (currentTime > currentNFT.endTime) {
            throw new Error("Auction has closed")
        }

        if (currentNFT.currentBidder.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            throw new Error("Already highest bidder")
        }

        if (currentNFT.nftSeller.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            throw new Error("Bider is not seller")
        }

        if (bidPrice.isLessThanOrEqualTo(currentNFT.currentBid)) {
            throw new Error("Bid price is not less than or equal current price")
        }

        appState.NFTAuctioningState[currentVersion][currentIndex].currentBid = bidPrice.toFixed(0);
        appState.NFTAuctioningState[currentVersion][currentIndex].currentBidder = _from;
    } catch (err) {
        console.log(err)
    }
    return appState
}
