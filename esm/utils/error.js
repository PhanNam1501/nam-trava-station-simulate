"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionByZeroError = exports.MultiplicationOverflowError = void 0;
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
