export class AuthorizeError extends Error {
    constructor() {
        super("Unauthorized!");
        this.name = 'AuthorizeError';
    }
}
// Custom error classes
export class MultiplicationOverflowError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MultiplicationOverflowError';
    }
}
export class DivisionByZeroError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DivisionByZeroError';
    }
}
export class NotEnoughBalanceError extends Error {
    constructor() {
        super("Not enough balance!");
        this.name = 'NotEnoughBalanceError';
    }
}
export class FromAddressError extends Error {
    constructor() {
        super("Invalid from address!");
        this.name = 'FromAddressError';
    }
}
export class ExpireAuctionError extends Error {
    constructor() {
        super("Auction has closed");
        this.name = 'ExpireAuctionError';
    }
}
export class InexpireAuctionError extends Error {
    constructor() {
        super("This auction cannot be finalized");
        this.name = 'InexpireAuctionError';
    }
}
export class HighestBidderError extends Error {
    constructor() {
        super("Already highest bidder");
        this.name = 'HighestBidderError';
    }
}
export class BidderError extends Error {
    constructor() {
        super("Bider is not owner");
        this.name = 'BidderError';
    }
}
export class OwnerAuctionError extends Error {
    constructor() {
        super("Only NFT owner can edit sale");
        this.name = 'OwnerAuctionError';
    }
}
export class OngoingAuctionError extends Error {
    constructor() {
        super("Cannot edit ongoing auction");
        this.name = 'OngoingAuctionError';
    }
}
export class BidPriceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BidPriceError';
    }
}
export class BidStepsError extends Error {
    constructor() {
        super("No one has bid");
        this.name = 'BidStepsError';
    }
}
export class NFTNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NFTNotFoundError';
    }
}
export class NFTIsNotOnGoingError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NFTIsNotOnGoing';
    }
}
export class ExpeditionNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExpeditionNotFound';
    }
}
