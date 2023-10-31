var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { updateSmartWalletTokenBalance, updateUserTokenBalance } from "../../../../basic/UpdateStateAccount";
import { getAddr } from "../../../../../utils/address";
import { FEE_AUCTION_PERCENTAGE, MAX_UINT256, MINIMUM_BID_STEP_PERCENT, ZERO_ADDRESS } from '../../../../../utils/config';
import { AuthorizeError, BidPriceError, BidStepsError, BidderError, ExpireAuctionError, FromAddressError, HighestBidderError, InexpireAuctionError, NFTNotFoundError, OngoingAuctionError, OwnerAuctionError } from '../../../../../utils/error';
import { updateAuctioningNFTFromContract, updateOwnedAuctioningNFT } from "./UpdateStateAccount";
import { updateCollectionBalanceFromContract } from '../../utilities';
import { BigNumber } from 'bignumber.js';
export function findTravaNFTKnightAuctioning(_tokenId, _nftAuctioning) {
    let currentVersion = "v1";
    let curentIndex = _nftAuctioning.v1.findIndex((n) => n.id == _tokenId);
    if (curentIndex == -1) {
        curentIndex = _nftAuctioning.v2.findIndex((n) => n.id == _tokenId);
        currentVersion = "v2";
    }
    if (curentIndex == -1) {
        curentIndex = _nftAuctioning.specials.findIndex((n) => n.id == _tokenId);
        currentVersion = "specials";
    }
    if (curentIndex == -1) {
        throw new NFTNotFoundError("Token not on sale");
    }
    let currentNFT = _nftAuctioning[currentVersion][curentIndex];
    return {
        currentVersion: currentVersion,
        curentIndex: curentIndex,
        currentNFT: currentNFT
    };
}
export function simulateTravaNFTCreateAuction(appState1, _tokenId, _startingBid, _duration, _from) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let mode;
            if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                mode = "walletState";
            }
            else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                mode = "smartWalletState";
            }
            else {
                throw new FromAddressError();
            }
            if (!appState.smartWalletState.collection.isFetch) {
                appState = yield updateCollectionBalanceFromContract(appState, mode);
            }
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield updateAuctioningNFTFromContract(appState);
            }
            if (!appState.smartWalletState.auctioningState) {
                appState = yield updateOwnedAuctioningNFT(appState);
            }
            let changeAuctionKnightData = {
                newStartingBid: _startingBid
            };
            let startTime = ((_a = (yield appState.web3.getBlock('latest'))) === null || _a === void 0 ? void 0 : _a.timestamp) * 1000;
            let auctionKnightData = Object.assign(Object.assign({}, changeAuctionKnightData), { nftSeller: _from, startingBid: _startingBid, currentBidder: ZERO_ADDRESS, currentBid: _startingBid, startTime: startTime, endTime: startTime + _duration, bidSteps: 0 });
            let currentVersion = "v1";
            let currentNFT = appState[mode].collection.v1.find((n) => n.id == _tokenId);
            if (!currentNFT) {
                currentNFT = appState[mode].collection.v2.find((n) => n.id == _tokenId);
                currentVersion = "v2";
            }
            if (!currentNFT) {
                let currentNFTSpecial = appState[mode].collection.specials.find((n) => n.id == _tokenId);
                if (currentNFTSpecial) {
                    currentVersion = "specials";
                    let auctioningSpecialKnight = Object.assign(Object.assign({}, currentNFTSpecial), auctionKnightData);
                    appState.NFTAuctioningState[currentVersion].push(auctioningSpecialKnight);
                    appState.smartWalletState.auctioningState[currentVersion].push(auctioningSpecialKnight);
                    appState[mode].collection[currentVersion] = appState[mode].collection[currentVersion].filter(x => x.id != _tokenId);
                }
                else {
                    throw new NFTNotFoundError("Knight is not found!");
                }
            }
            else {
                let auctioningNormalKnight = Object.assign(Object.assign({}, currentNFT), auctionKnightData);
                appState.NFTAuctioningState[currentVersion].push(auctioningNormalKnight);
                appState.smartWalletState.auctioningState[currentVersion].push(auctioningNormalKnight);
                appState[mode].collection[currentVersion] = appState[mode].collection[currentVersion].filter(x => x.id != _tokenId);
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function simulateTravaNFTMakeBidAuction(appState1, _tokenId, _bidPrice, _from, _minimumBidStepPercent = MINIMUM_BID_STEP_PERCENT) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            let mode;
            if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
                mode = "walletState";
            }
            else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                mode = "smartWalletState";
            }
            else {
                throw new FromAddressError();
            }
            const travaAddress = getAddr("TRAVA_TOKEN", appState1.chainId).toLowerCase();
            // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
            if (!appState[mode].tokenBalances.has(travaAddress)) {
                yield updateUserTokenBalance(appState, travaAddress);
                yield updateSmartWalletTokenBalance(appState, travaAddress);
            }
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield updateAuctioningNFTFromContract(appState);
            }
            let travaBalance = appState[mode].tokenBalances.get(travaAddress);
            let bidPrice = BigNumber(_bidPrice);
            if (bidPrice.toFixed(0) == MAX_UINT256 || bidPrice.isEqualTo(MAX_UINT256)) {
                bidPrice = BigNumber(travaBalance);
            }
            let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
            let currentVersion = auctionKnight.currentVersion;
            let currentIndex = auctionKnight.curentIndex;
            let currentNFT = auctionKnight.currentNFT;
            let currentTime = ((_a = (yield appState.web3.getBlock('latest'))) === null || _a === void 0 ? void 0 : _a.timestamp) * 1000;
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
                throw new BidPriceError("Bid price too low");
            }
            else if (currentNFT.bidSteps > 0 && bidPrice.isLessThan(BigNumber(currentNFT.currentBid).multipliedBy(1 + _minimumBidStepPercent))) {
                throw new BidPriceError("Bid price too low");
            }
            const balance = appState[mode].tokenBalances.get(travaAddress);
            appState[mode].tokenBalances.set(travaAddress, BigNumber(balance).minus(bidPrice).toFixed(0));
            appState.NFTAuctioningState[currentVersion][currentIndex].currentBid = bidPrice.toFixed(0);
            appState.NFTAuctioningState[currentVersion][currentIndex].currentBidder = _from;
            appState.NFTAuctioningState[currentVersion][currentIndex].bidSteps = currentNFT.bidSteps + 1;
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function simulateTravaNFTEditAuctionPrice(appState1, _tokenId, _startingBid) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield updateAuctioningNFTFromContract(appState);
            }
            if (!appState.smartWalletState.auctioningState) {
                appState = yield updateOwnedAuctioningNFT(appState);
            }
            let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
            let currentVersion = auctionKnight.currentVersion;
            let currentIndex = auctionKnight.curentIndex;
            let currentNFT = auctionKnight.currentNFT;
            let currentTime = ((_a = (yield appState.web3.getBlock('latest'))) === null || _a === void 0 ? void 0 : _a.timestamp) * 1000;
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
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function simulateTravaNFTCancelAuction(appState1, _tokenId, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase() && !appState.walletState.collection.isFetch) {
                appState = yield updateCollectionBalanceFromContract(appState, "walletState");
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase() && !appState.smartWalletState.collection.isFetch) {
                appState = yield updateCollectionBalanceFromContract(appState, "smartWalletState");
            }
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield updateAuctioningNFTFromContract(appState);
            }
            if (!appState.smartWalletState.auctioningState) {
                appState = yield updateOwnedAuctioningNFT(appState);
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
                    appState.walletState.collection[currentVersion].push(currentNFT);
                }
                else {
                    appState.walletState.collection[currentVersion].push(currentNFT);
                }
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                if (currentVersion == "specials") {
                    appState.smartWalletState.collection[currentVersion].push(currentNFT);
                }
                else {
                    appState.smartWalletState.collection[currentVersion].push(currentNFT);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
export function simulateTravaNFTFinalizeAuction(appState1, _tokenId, _to, _feePercentage = FEE_AUCTION_PERCENTAGE) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield updateAuctioningNFTFromContract(appState);
            }
            if (!appState.smartWalletState.auctioningState) {
                appState = yield updateOwnedAuctioningNFT(appState);
            }
            let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
            let currentVersion = auctionKnight.currentVersion;
            let currentIndex = auctionKnight.curentIndex;
            let currentNFT = auctionKnight.currentNFT;
            let currentTime = ((_a = (yield appState.web3.getBlock('latest'))) === null || _a === void 0 ? void 0 : _a.timestamp) * 1000;
            if (currentTime <= currentNFT.endTime) {
                throw new InexpireAuctionError();
            }
            if (currentNFT.bidSteps == 0) {
                throw new BidStepsError();
            }
            if (currentNFT.nftSeller.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                delete appState.smartWalletState.auctioningState[currentVersion][currentIndex];
                const travaAddress = getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase();
                let hammerPrice = BigNumber(currentNFT.currentBid);
                if (currentNFT.bidSteps > 1) {
                    hammerPrice = hammerPrice.multipliedBy(1 - _feePercentage);
                }
                if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                    if (!appState.walletState.tokenBalances.has(travaAddress)) {
                        appState = yield updateUserTokenBalance(appState, travaAddress);
                    }
                    let travaBalance = appState.walletState.tokenBalances.get(travaAddress);
                    appState.walletState.tokenBalances.set(travaAddress, BigNumber(travaBalance).plus(hammerPrice).toFixed(0));
                }
                else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                    if (!appState.smartWalletState.tokenBalances.has(travaAddress)) {
                        appState = yield updateSmartWalletTokenBalance(appState, travaAddress);
                    }
                    let travaBalance = appState.smartWalletState.tokenBalances.get(travaAddress);
                    appState.smartWalletState.tokenBalances.set(travaAddress, BigNumber(travaBalance).plus(hammerPrice).toFixed(0));
                }
            }
            else {
                const baseKnight = {
                    armorTokenId: currentNFT.armorTokenId,
                    helmetTokenId: currentNFT.helmetTokenId,
                    shieldTokenId: currentNFT.shieldTokenId,
                    weaponTokenId: currentNFT.weaponTokenId,
                    rarity: currentNFT.rarity,
                    id: currentNFT.id,
                    setId: currentNFT.setId,
                    exp: currentNFT.exp,
                };
                if (currentNFT.currentBidder.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                    if (currentVersion == "specials") {
                        const auctionKnight = currentNFT;
                        const collection = Object.assign({ metadataLink: auctionKnight.metadataLink }, baseKnight);
                        if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                            if (!appState.walletState.collection.isFetch) {
                                appState = yield updateCollectionBalanceFromContract(appState, "walletState");
                            }
                            appState.walletState.collection[currentVersion].push(collection);
                        }
                        else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                            if (!appState.smartWalletState.collection.isFetch) {
                                appState = yield updateCollectionBalanceFromContract(appState, "smartWalletState");
                            }
                            appState.smartWalletState.collection[currentVersion].push(collection);
                        }
                    }
                    else {
                        const auctionKnight = currentNFT;
                        const collection = Object.assign({ armor: auctionKnight.armor, helmet: auctionKnight.helmet, shield: auctionKnight.shield, weapon: auctionKnight.weapon }, baseKnight);
                        if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                            if (!appState.walletState.collection.isFetch) {
                                appState = yield updateCollectionBalanceFromContract(appState, "walletState");
                            }
                            appState.walletState.collection[currentVersion].push(collection);
                        }
                        else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                            if (!appState.smartWalletState.collection.isFetch) {
                                appState = yield updateCollectionBalanceFromContract(appState, "smartWalletState");
                            }
                            appState.smartWalletState.collection[currentVersion].push(collection);
                        }
                    }
                }
                else {
                    throw new AuthorizeError();
                }
            }
            delete appState.NFTAuctioningState[currentVersion][currentIndex];
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
