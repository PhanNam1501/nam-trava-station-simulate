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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCS251State = updateCS251State;
const ethers_1 = require("ethers");
const exchangeabi_json_1 = __importDefault(require("../../abis/exchangeabi.json"));
function updateCS251State(appState1, exchange, force) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        console.log(1);
        if (!appState.cs251state.cs251state.has(exchange) || force) {
            const exchangeContract = new ethers_1.Contract(exchange, exchangeabi_json_1.default, appState.web3);
            console.log(3);
            const totalshare = yield exchangeContract.getTotalShares();
            console.log(4);
            const lp = yield exchangeContract.getlps();
            console.log(5);
            const reserve = yield exchangeContract.getLiquidity();
            console.log(6);
            const token_reserve = reserve[0];
            const eth_reserve = reserve[1];
            console.log(2);
            const exchangeState = {
                eth_reserve: String(eth_reserve),
                token_reserve: String(token_reserve),
                total_shares: String(totalshare),
                lps: String(lp)
            };
            appState.cs251state.cs251state.set(exchange, exchangeState);
        }
        return appState;
    });
}
