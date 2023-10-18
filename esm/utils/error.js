"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotEnoughBalanceError = exports.DivisionByZeroError = exports.MultiplicationOverflowError = void 0;
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
