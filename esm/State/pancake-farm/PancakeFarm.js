"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPancakeFarmState = exports.PancakeFarmState = void 0;
class PancakeFarmState {
    constructor() {
        this.PancakeFarmState = new Map();
        this.isFetch = false;
    }
}
exports.PancakeFarmState = PancakeFarmState;
class UserPancakeFarmState {
    constructor() {
        this.userPancakeFarmState = new Map();
        this.isFetch = false;
    }
}
exports.UserPancakeFarmState = UserPancakeFarmState;
