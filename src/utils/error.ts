// Custom error classes
export class MultiplicationOverflowError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MultiplicationOverflowError';
    }
}

export class DivisionByZeroError extends Error {
    constructor(message: string) {
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
        super("Invalid from balance!");
        this.name = 'FromAddressError';
    }
}

export class NFTNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NFTNotFoundError';
    }
}

export class NFTIsNotOnGoingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NFTIsNotOnGoing';
    }
}
