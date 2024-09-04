"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTravaNFTKnightAuctioning = findTravaNFTKnightAuctioning;
exports.simulateTravaNFTCreateAuction = simulateTravaNFTCreateAuction;
exports.simulateTravaNFTMakeBidAuction = simulateTravaNFTMakeBidAuction;
exports.simulateTravaNFTEditAuctionPrice = simulateTravaNFTEditAuctionPrice;
exports.simulateTravaNFTCancelAuction = simulateTravaNFTCancelAuction;
exports.simulateTravaNFTFinalizeAuction = simulateTravaNFTFinalizeAuction;
const UpdateStateAccount_1 = require("../../../../basic/UpdateStateAccount");
const address_1 = require("../../../../../utils/address");
const config_1 = require("../../../../../utils/config");
const error_1 = require("../../../../../utils/error");
const UpdateStateAccount_2 = require("./UpdateStateAccount");
const utilities_1 = require("../../utilities");
const bignumber_js_1 = require("bignumber.js");
const helper_1 = require("../../../../../utils/helper");
function findTravaNFTKnightAuctioning(_tokenId, _nftAuctioning) {
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
        throw new error_1.NFTNotFoundError("Token not on sale");
    }
    let currentNFT = _nftAuctioning[currentVersion][curentIndex];
    return {
        currentVersion: currentVersion,
        curentIndex: curentIndex,
        currentNFT: currentNFT
    };
}
function simulateTravaNFTCreateAuction(appState1, _tokenId, _startingBid, _duration, _from) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let appState = Object.assign({}, appState1);
        try {
            let mode = (0, helper_1.getMode)(appState, _from);
            if (!appState[mode].collection.isFetch) {
                appState = yield (0, utilities_1.updateCollectionBalanceFromContract)(appState, mode);
            }
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield (0, UpdateStateAccount_2.updateAuctioningNFTFromContract)(appState);
            }
            if (!appState.smartWalletState.auctioningState) {
                appState = yield (0, UpdateStateAccount_2.updateOwnedAuctioningNFT)(appState);
            }
            let changeAuctionKnightData = {
                newStartingBid: _startingBid
            };
            let startTime = ((_a = (yield appState.web3.getBlock('latest'))) === null || _a === void 0 ? void 0 : _a.timestamp) * 1000;
            let auctionKnightData = Object.assign(Object.assign({}, changeAuctionKnightData), { nftSeller: _from, startingBid: _startingBid, currentBidder: config_1.ZERO_ADDRESS, currentBid: _startingBid, startTime: startTime, endTime: startTime + _duration, bidSteps: 0 });
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
                    throw new error_1.NFTNotFoundError("Knight is not found!");
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
function simulateTravaNFTMakeBidAuction(appState1_1, _tokenId_1, _bidPrice_1, _from_1) {
    return __awaiter(this, arguments, void 0, function* (appState1, _tokenId, _bidPrice, _from, _minimumBidStepPercent = config_1.MINIMUM_BID_STEP_PERCENT) {
        var _a;
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
                throw new error_1.FromAddressError();
            }
            const travaAddress = (0, address_1.getAddr)("TRAVA_TOKEN", appState1.chainId).toLowerCase();
            // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
            if (!appState[mode].tokenBalances.has(travaAddress)) {
                yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, travaAddress);
                yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, travaAddress);
            }
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield (0, UpdateStateAccount_2.updateAuctioningNFTFromContract)(appState);
            }
            let travaBalance = appState[mode].tokenBalances.get(travaAddress);
            let bidPrice = (0, bignumber_js_1.BigNumber)(_bidPrice);
            if (bidPrice.toFixed(0) == config_1.MAX_UINT256 || bidPrice.isEqualTo(config_1.MAX_UINT256)) {
                bidPrice = (0, bignumber_js_1.BigNumber)(travaBalance);
            }
            let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
            let currentVersion = auctionKnight.currentVersion;
            let currentIndex = auctionKnight.curentIndex;
            let currentNFT = auctionKnight.currentNFT;
            let currentTime = ((_a = (yield appState.web3.getBlock('latest'))) === null || _a === void 0 ? void 0 : _a.timestamp) * 1000;
            if (currentTime > currentNFT.endTime) {
                throw new error_1.ExpireAuctionError();
            }
            if (currentNFT.currentBidder.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                throw new error_1.HighestBidderError();
            }
            if (currentNFT.nftSeller.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                throw new error_1.BidderError();
            }
            if (currentNFT.bidSteps == 0 && bidPrice.isLessThan(currentNFT.currentBid)) {
                throw new error_1.BidPriceError("Bid price too low");
            }
            else if (currentNFT.bidSteps > 0 && bidPrice.isLessThan((0, bignumber_js_1.BigNumber)(currentNFT.currentBid).multipliedBy(1 + _minimumBidStepPercent))) {
                throw new error_1.BidPriceError("Bid price too low");
            }
            const balance = appState[mode].tokenBalances.get(travaAddress);
            appState[mode].tokenBalances.set(travaAddress, (0, bignumber_js_1.BigNumber)(balance).minus(bidPrice).toFixed(0));
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
function simulateTravaNFTEditAuctionPrice(appState1, _tokenId, _startingBid) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let appState = Object.assign({}, appState1);
        try {
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield (0, UpdateStateAccount_2.updateAuctioningNFTFromContract)(appState);
            }
            if (!appState.smartWalletState.auctioningState) {
                appState = yield (0, UpdateStateAccount_2.updateOwnedAuctioningNFT)(appState);
            }
            let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
            let currentVersion = auctionKnight.currentVersion;
            let currentIndex = auctionKnight.curentIndex;
            let currentNFT = auctionKnight.currentNFT;
            let currentTime = ((_a = (yield appState.web3.getBlock('latest'))) === null || _a === void 0 ? void 0 : _a.timestamp) * 1000;
            if (currentTime > currentNFT.endTime) {
                throw new error_1.ExpireAuctionError();
            }
            if (currentNFT.nftSeller.toLowerCase() != appState.smartWalletState.address.toLowerCase()) {
                throw new error_1.OwnerAuctionError();
            }
            if (currentNFT.bidSteps != 0) {
                throw new error_1.OngoingAuctionError();
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
function simulateTravaNFTCancelAuction(appState1, _tokenId, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, appState1);
        try {
            if (_to.toLowerCase() == appState.walletState.address.toLowerCase() && !appState.walletState.collection.isFetch) {
                appState = yield (0, utilities_1.updateCollectionBalanceFromContract)(appState, "walletState");
            }
            else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase() && !appState.smartWalletState.collection.isFetch) {
                appState = yield (0, utilities_1.updateCollectionBalanceFromContract)(appState, "smartWalletState");
            }
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield (0, UpdateStateAccount_2.updateAuctioningNFTFromContract)(appState);
            }
            if (!appState.smartWalletState.auctioningState) {
                appState = yield (0, UpdateStateAccount_2.updateOwnedAuctioningNFT)(appState);
            }
            let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
            let currentVersion = auctionKnight.currentVersion;
            let currentIndex = auctionKnight.curentIndex;
            let currentNFT = auctionKnight.currentNFT;
            if (currentNFT.nftSeller.toLowerCase() != appState.smartWalletState.address.toLowerCase()) {
                throw new error_1.OwnerAuctionError();
            }
            if (currentNFT.bidSteps != 0) {
                throw new error_1.OngoingAuctionError();
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
function simulateTravaNFTFinalizeAuction(appState1_1, _tokenId_1, _to_1) {
    return __awaiter(this, arguments, void 0, function* (appState1, _tokenId, _to, _feePercentage = config_1.FEE_AUCTION_PERCENTAGE) {
        var _a;
        let appState = Object.assign({}, appState1);
        try {
            if (!appState.NFTAuctioningState.isFetch) {
                appState = yield (0, UpdateStateAccount_2.updateAuctioningNFTFromContract)(appState);
            }
            if (!appState.smartWalletState.auctioningState) {
                appState = yield (0, UpdateStateAccount_2.updateOwnedAuctioningNFT)(appState);
            }
            let auctionKnight = findTravaNFTKnightAuctioning(_tokenId, appState.NFTAuctioningState);
            let currentVersion = auctionKnight.currentVersion;
            let currentIndex = auctionKnight.curentIndex;
            let currentNFT = auctionKnight.currentNFT;
            let currentTime = ((_a = (yield appState.web3.getBlock('latest'))) === null || _a === void 0 ? void 0 : _a.timestamp) * 1000;
            if (currentTime <= currentNFT.endTime) {
                throw new error_1.InexpireAuctionError();
            }
            if (currentNFT.bidSteps == 0) {
                throw new error_1.BidStepsError();
            }
            if (currentNFT.nftSeller.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                delete appState.smartWalletState.auctioningState[currentVersion][currentIndex];
                const travaAddress = (0, address_1.getAddr)("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase();
                let hammerPrice = (0, bignumber_js_1.BigNumber)(currentNFT.currentBid);
                if (currentNFT.bidSteps > 1) {
                    hammerPrice = hammerPrice.multipliedBy(1 - _feePercentage);
                }
                if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                    if (!appState.walletState.tokenBalances.has(travaAddress)) {
                        appState = yield (0, UpdateStateAccount_1.updateUserTokenBalance)(appState, travaAddress);
                    }
                    let travaBalance = appState.walletState.tokenBalances.get(travaAddress);
                    appState.walletState.tokenBalances.set(travaAddress, (0, bignumber_js_1.BigNumber)(travaBalance).plus(hammerPrice).toFixed(0));
                }
                else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                    if (!appState.smartWalletState.tokenBalances.has(travaAddress)) {
                        appState = yield (0, UpdateStateAccount_1.updateSmartWalletTokenBalance)(appState, travaAddress);
                    }
                    let travaBalance = appState.smartWalletState.tokenBalances.get(travaAddress);
                    appState.smartWalletState.tokenBalances.set(travaAddress, (0, bignumber_js_1.BigNumber)(travaBalance).plus(hammerPrice).toFixed(0));
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
                                appState = yield (0, utilities_1.updateCollectionBalanceFromContract)(appState, "walletState");
                            }
                            appState.walletState.collection[currentVersion].push(collection);
                        }
                        else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                            if (!appState.smartWalletState.collection.isFetch) {
                                appState = yield (0, utilities_1.updateCollectionBalanceFromContract)(appState, "smartWalletState");
                            }
                            appState.smartWalletState.collection[currentVersion].push(collection);
                        }
                    }
                    else {
                        const auctionKnight = currentNFT;
                        const collection = Object.assign({ armor: auctionKnight.armor, helmet: auctionKnight.helmet, shield: auctionKnight.shield, weapon: auctionKnight.weapon }, baseKnight);
                        if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                            if (!appState.walletState.collection.isFetch) {
                                appState = yield (0, utilities_1.updateCollectionBalanceFromContract)(appState, "walletState");
                            }
                            appState.walletState.collection[currentVersion].push(collection);
                        }
                        else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                            if (!appState.smartWalletState.collection.isFetch) {
                                appState = yield (0, utilities_1.updateCollectionBalanceFromContract)(appState, "smartWalletState");
                            }
                            appState.smartWalletState.collection[currentVersion].push(collection);
                        }
                    }
                }
                else {
                    throw new error_1.AuthorizeError();
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
