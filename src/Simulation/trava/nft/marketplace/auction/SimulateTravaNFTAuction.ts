
import { EthAddress, knight_version, uint256, wallet_mode } from '../../../../../utils/types';
import { AuctionKnightData, AuctioningNormalKnight, AuctioningSpecialKnight, BaseKnight, ChangeAuctionKnightData, NormalKnight, SpecialKnight } from '../../helpers/global';
import { updateSmartWalletTokenBalance, updateUserEthBalance, updateUserTokenBalance } from "../../../../basic/UpdateStateAccount";
import { ApplicationState } from './../../../../../State/ApplicationState';
import { getAddr } from "../../../../../utils/address";
import { FEE_AUCTION_PERCENTAGE, MAX_UINT256, MINIMUM_BID_STEP_PERCENT, ZERO_ADDRESS } from '../../../../../utils/config';
import { AuthorizeError, BidPriceError, BidStepsError, BidderError, ExpireAuctionError, FromAddressError, HighestBidderError, InexpireAuctionError, NFTIsNotOnGoingError, NFTNotFoundError, OngoingAuctionError, OwnerAuctionError } from '../../../../../utils/error';
import { NFTAuctioningState } from '../../../../../State/trava/nft/TravaNFTState';
import { isAuctionOngoing, updateAuctioningNFTFromContract, updateOwnedAuctioningNFT } from "./UpdateStateAccount";
import { updateCollectionBalanceFromContract } from '../../utilities';
import { BigNumber } from 'bignumber.js';
import { getMode } from '../../../../../utils/helper';

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
        throw new NFTNotFoundError("Token not on sale")
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
    let appState = { ...appState1 };
    try {
        let mode = getMode(appState, _from);

        if (!appState[mode].collection.isFetch) {
            appState = await updateCollectionBalanceFromContract(appState, mode);
        }

        if (!appState.NFTAuctioningState.isFetch) {
            appState = await updateAuctioningNFTFromContract(appState);
        }

        if (!appState.smartWalletState.auctioningState) {
            appState = await updateOwnedAuctioningNFT(appState);
        }

        let changeAuctionKnightData: ChangeAuctionKnightData = {
            newStartingBid: _startingBid
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
                let auctioningSpecialKnight: AuctioningSpecialKnight = {
                    ...currentNFTSpecial,
                    ...auctionKnightData
                }
                appState.NFTAuctioningState[currentVersion].push(auctioningSpecialKnight)
                appState.smartWalletState.auctioningState[currentVersion].push(auctioningSpecialKnight);
                appState[mode].collection[currentVersion] = appState[mode].collection[currentVersion].filter(x => x.id != _tokenId)
            } else {
                throw new NFTNotFoundError("Knight is not found!")
            }
        }
        else {
            let auctioningNormalKnight: AuctioningNormalKnight = {
                ...currentNFT,
                ...auctionKnightData
            }
            appState.NFTAuctioningState[currentVersion].push(auctioningNormalKnight)
            appState.smartWalletState.auctioningState[currentVersion].push(auctioningNormalKnight);
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
    _from: EthAddress,
    _minimumBidStepPercent = MINIMUM_BID_STEP_PERCENT
): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        let mode: wallet_mode;
        if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
            mode = "walletState"
        } else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
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

        if (!appState.NFTAuctioningState.isFetch) {
            appState = await updateAuctioningNFTFromContract(appState);
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
            throw new ExpireAuctionError();
        }

        if (currentNFT.currentBidder.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            throw new HighestBidderError();
        }

        if (currentNFT.nftSeller.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            throw new BidderError();
        }

        if (currentNFT.bidSteps == 0 && bidPrice.isLessThan(currentNFT.currentBid)) {
            throw new BidPriceError("Bid price too low")
        } else if (currentNFT.bidSteps > 0 && bidPrice.isLessThan(BigNumber(currentNFT.currentBid).multipliedBy(1 + _minimumBidStepPercent))) {
            throw new BidPriceError("Bid price too low")
        }

        const balance = appState[mode].tokenBalances.get(travaAddress)!
        
        appState[mode].tokenBalances.set(travaAddress, BigNumber(balance).minus(bidPrice).toFixed(0))
        appState.NFTAuctioningState[currentVersion][currentIndex].currentBid = bidPrice.toFixed(0);
        appState.NFTAuctioningState[currentVersion][currentIndex].currentBidder = _from;
        appState.NFTAuctioningState[currentVersion][currentIndex].bidSteps = currentNFT.bidSteps + 1;
        

    } catch (err) {
        console.log(err)
    }
    return appState
}

export async function simulateTravaNFTEditAuctionPrice(
    appState1: ApplicationState,
    _tokenId: uint256,
    _startingBid: uint256
): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {
        if (!appState.NFTAuctioningState.isFetch) {
            appState = await updateAuctioningNFTFromContract(appState);
        }

        if (!appState.smartWalletState.auctioningState) {
            appState = await updateOwnedAuctioningNFT(appState);
        }

        let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
        let currentVersion = auctionKnight.currentVersion;
        let currentIndex = auctionKnight.curentIndex;
        let currentNFT = auctionKnight.currentNFT;

        let currentTime = (await appState.web3.getBlock('latest'))?.timestamp! * 1000;

        if (currentTime > currentNFT.endTime) {
            throw new ExpireAuctionError();
        }

        if (currentNFT.nftSeller.toLowerCase() != appState.smartWalletState.address.toLowerCase()) {
            throw new OwnerAuctionError();
        }

        if (currentNFT.bidSteps != 0) {
            throw new OngoingAuctionError();
        }

        appState.NFTAuctioningState[currentVersion][currentIndex].newStartingBid = _startingBid;
        appState.smartWalletState.auctioningState[currentVersion][currentIndex].newStartingBid = _startingBid;
    } catch (err) {
        console.log(err)
    }
    return appState
}

export async function simulateTravaNFTCancelAuction(
    appState1: ApplicationState,
    _tokenId: uint256,
    _to: EthAddress
): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {

        if (_to.toLowerCase() == appState.walletState.address.toLowerCase() && !appState.walletState.collection.isFetch) {
            appState = await updateCollectionBalanceFromContract(appState, "walletState");
        } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase() && !appState.smartWalletState.collection.isFetch) {
            appState = await updateCollectionBalanceFromContract(appState, "smartWalletState");
        }

        if (!appState.NFTAuctioningState.isFetch) {
            appState = await updateAuctioningNFTFromContract(appState);
        }

        if (!appState.smartWalletState.auctioningState) {
            appState = await updateOwnedAuctioningNFT(appState);
        }

        let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
        let currentVersion = auctionKnight.currentVersion;
        let currentIndex = auctionKnight.curentIndex;
        let currentNFT = auctionKnight.currentNFT;

        if (currentNFT.nftSeller.toLowerCase() != appState.smartWalletState.address.toLowerCase()) {
            throw new OwnerAuctionError();
        }

        if (currentNFT.bidSteps != 0) {
            throw new OngoingAuctionError();
        }

        delete appState.NFTAuctioningState[currentVersion][currentIndex];
        delete appState.smartWalletState.auctioningState[currentVersion][currentIndex];

        if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
            if (currentVersion == "specials") {
                appState.walletState.collection[currentVersion].push(currentNFT as AuctioningSpecialKnight)
            } else {
                appState.walletState.collection[currentVersion].push(currentNFT as AuctioningNormalKnight)
            }
        } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            if (currentVersion == "specials") {
                appState.smartWalletState.collection[currentVersion].push(currentNFT as AuctioningSpecialKnight)
            } else {
                appState.smartWalletState.collection[currentVersion].push(currentNFT as AuctioningNormalKnight)
            }
        }
    } catch (err) {
        console.log(err)
    }
    return appState
}

export async function simulateTravaNFTFinalizeAuction(
    appState1: ApplicationState,
    _tokenId: uint256,
    _to: EthAddress,
    _feePercentage = FEE_AUCTION_PERCENTAGE
): Promise<ApplicationState> {
    let appState = { ...appState1 };
    try {

        if (!appState.NFTAuctioningState.isFetch) {
            appState = await updateAuctioningNFTFromContract(appState);
        }

        if (!appState.smartWalletState.auctioningState) {
            appState = await updateOwnedAuctioningNFT(appState);
        }

        let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
        let currentVersion = auctionKnight.currentVersion;
        let currentIndex = auctionKnight.curentIndex;
        let currentNFT = auctionKnight.currentNFT;

        let currentTime = (await appState.web3.getBlock('latest'))?.timestamp! * 1000;

        if (currentTime <= currentNFT.endTime) {
            throw new InexpireAuctionError();
        }

        if (currentNFT.bidSteps == 0) {
            throw new BidStepsError();
        }

        if (currentNFT.nftSeller.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            delete appState.smartWalletState.auctioningState[currentVersion][currentIndex];
            const travaAddress = getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase();

            let hammerPrice = BigNumber(currentNFT.currentBid)
            if (currentNFT.bidSteps > 1) {
                hammerPrice = hammerPrice.multipliedBy(1 - _feePercentage)
            }

            if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                if (!appState.walletState.tokenBalances.has(travaAddress)) {
                    appState = await updateUserTokenBalance(appState, travaAddress);
                }
                let travaBalance = appState.walletState.tokenBalances.get(travaAddress)!;
                appState.walletState.tokenBalances.set(travaAddress, BigNumber(travaBalance).plus(hammerPrice).toFixed(0))
            } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                if (!appState.smartWalletState.tokenBalances.has(travaAddress)) {
                    appState = await updateSmartWalletTokenBalance(appState, travaAddress);
                }
                let travaBalance = appState.smartWalletState.tokenBalances.get(travaAddress)!;
                appState.smartWalletState.tokenBalances.set(travaAddress, BigNumber(travaBalance).plus(hammerPrice).toFixed(0))
            }
        } else {
            const baseKnight: BaseKnight = {
                armorTokenId: currentNFT.armorTokenId,
                helmetTokenId: currentNFT.helmetTokenId,
                shieldTokenId: currentNFT.shieldTokenId,
                weaponTokenId: currentNFT.weaponTokenId,
                rarity: currentNFT.rarity,
                id: currentNFT.id,
                setId: currentNFT.setId,
                exp: currentNFT.exp,
            }
            if (currentNFT.currentBidder.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {

                if (currentVersion == "specials") {
                    const auctionKnight: AuctioningSpecialKnight = currentNFT as AuctioningSpecialKnight;
                    const collection: SpecialKnight = {
                        metadataLink: auctionKnight.metadataLink,
                        ...baseKnight
                    }
                    if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                        if (!appState.walletState.collection.isFetch) {
                            appState = await updateCollectionBalanceFromContract(appState, "walletState");
                        }

                        appState.walletState.collection[currentVersion].push(collection)
                    } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                        if (!appState.smartWalletState.collection.isFetch) {
                            appState = await updateCollectionBalanceFromContract(appState, "smartWalletState");
                        }

                        appState.smartWalletState.collection[currentVersion].push(collection)
                    }
                } else {
                    const auctionKnight: AuctioningNormalKnight = currentNFT as AuctioningNormalKnight;
                    const collection: NormalKnight = {
                        armor: auctionKnight.armor,
                        helmet: auctionKnight.helmet,
                        shield: auctionKnight.shield,
                        weapon: auctionKnight.weapon,
                        ...baseKnight
                    }
                    if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                        if (!appState.walletState.collection.isFetch) {
                            appState = await updateCollectionBalanceFromContract(appState, "walletState");
                        }

                        appState.walletState.collection[currentVersion].push(collection)
                    } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                        if (!appState.smartWalletState.collection.isFetch) {
                            appState = await updateCollectionBalanceFromContract(appState, "smartWalletState");
                        }

                        appState.smartWalletState.collection[currentVersion].push(collection)
                    }
                }

            } else {
                throw new AuthorizeError();
            }
        }

        delete appState.NFTAuctioningState[currentVersion][currentIndex];


    } catch (err) {
        console.log(err)
    }
    return appState
}