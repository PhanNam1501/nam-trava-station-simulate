export declare class AuthorizeError extends Error {
    constructor();
}
export declare class MultiplicationOverflowError extends Error {
    constructor(message: string);
}
export declare class DivisionByZeroError extends Error {
    constructor(message: string);
}
export declare class NotEnoughBalanceError extends Error {
    constructor();
}
export declare class FromAddressError extends Error {
    constructor();
}
export declare class ExpireAuctionError extends Error {
    constructor();
}
export declare class InexpireAuctionError extends Error {
    constructor();
}
export declare class HighestBidderError extends Error {
    constructor();
}
export declare class BidderError extends Error {
    constructor();
}
export declare class OwnerAuctionError extends Error {
    constructor();
}
export declare class OngoingAuctionError extends Error {
    constructor();
}
export declare class BidPriceError extends Error {
    constructor(message: string);
}
export declare class BidStepsError extends Error {
    constructor();
}
export declare class NFTNotFoundError extends Error {
    constructor(message: string);
}
export declare class NFTIsNotOnGoingError extends Error {
    constructor(message: string);
}
