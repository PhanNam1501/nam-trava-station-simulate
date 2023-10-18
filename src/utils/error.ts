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