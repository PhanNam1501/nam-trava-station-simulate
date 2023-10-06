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
