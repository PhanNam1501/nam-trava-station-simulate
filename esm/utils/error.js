"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpeditionNotFoundError = exports.NFTIsNotOnGoingError = exports.NFTNotFoundError = exports.BidStepsError = exports.BidPriceError = exports.OngoingAuctionError = exports.OwnerAuctionError = exports.BidderError = exports.HighestBidderError = exports.InexpireAuctionError = exports.ExpireAuctionError = exports.FromAddressError = exports.NotEnoughBalanceError = exports.DivisionByZeroError = exports.MultiplicationOverflowError = exports.AuthorizeError = void 0;
class AuthorizeError extends Error {
    constructor() {
        super("Unauthorized!");
        this.name = 'AuthorizeError';
    }
}
exports.AuthorizeError = AuthorizeError;
// Custom error classes
class MultiplicationOverflowError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MultiplicationOverflowError';
    }
}
exports.MultiplicationOverflowError = MultiplicationOverflowError;
class DivisionByZeroError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DivisionByZeroError';
    }
}
exports.DivisionByZeroError = DivisionByZeroError;
class NotEnoughBalanceError extends Error {
    constructor() {
        super("Not enough balance!");
        this.name = 'NotEnoughBalanceError';
    }
}
exports.NotEnoughBalanceError = NotEnoughBalanceError;
class FromAddressError extends Error {
    constructor() {
        super("Invalid from address!");
        this.name = 'FromAddressError';
    }
}
exports.FromAddressError = FromAddressError;
class ExpireAuctionError extends Error {
    constructor() {
        super("Auction has closed");
        this.name = 'ExpireAuctionError';
    }
}
exports.ExpireAuctionError = ExpireAuctionError;
class InexpireAuctionError extends Error {
    constructor() {
        super("This auction cannot be finalized");
        this.name = 'InexpireAuctionError';
    }
}
exports.InexpireAuctionError = InexpireAuctionError;
class HighestBidderError extends Error {
    constructor() {
        super("Already highest bidder");
        this.name = 'HighestBidderError';
    }
}
exports.HighestBidderError = HighestBidderError;
class BidderError extends Error {
    constructor() {
        super("Bider is not owner");
        this.name = 'BidderError';
    }
}
exports.BidderError = BidderError;
class OwnerAuctionError extends Error {
    constructor() {
        super("Only NFT owner can edit sale");
        this.name = 'OwnerAuctionError';
    }
}
exports.OwnerAuctionError = OwnerAuctionError;
class OngoingAuctionError extends Error {
    constructor() {
        super("Cannot edit ongoing auction");
        this.name = 'OngoingAuctionError';
    }
}
exports.OngoingAuctionError = OngoingAuctionError;
class BidPriceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BidPriceError';
    }
}
exports.BidPriceError = BidPriceError;
class BidStepsError extends Error {
    constructor() {
        super("No one has bid");
        this.name = 'BidStepsError';
    }
}
exports.BidStepsError = BidStepsError;
class NFTNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NFTNotFoundError';
    }
}
exports.NFTNotFoundError = NFTNotFoundError;
class NFTIsNotOnGoingError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NFTIsNotOnGoing';
    }
}
exports.NFTIsNotOnGoingError = NFTIsNotOnGoingError;
class ExpeditionNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExpeditionNotFound';
    }
}
exports.ExpeditionNotFoundError = ExpeditionNotFoundError;
