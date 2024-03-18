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
exports.simulateExecute = void 0;
const axios_1 = __importDefault(require("axios"));
function simulateExecute(appState, tokensApprove, executeData) {
    return __awaiter(this, void 0, void 0, function* () {
        let executeRequest = {
            method: "post",
            url: appState.simulatorUrl + "execute",
            approve: tokensApprove,
            data: {
                chainId: appState.chainId.toString(),
                EOAAddress: appState.walletState.address,
                smartWalletAddress: appState.smartWalletState.address,
                execute: executeData
            }
        };
        let res = yield axios_1.default.request(executeRequest);
        if (String(res.data.error) != "undefined") {
            throw new Error(String(res.data.error));
        }
    });
}
exports.simulateExecute = simulateExecute;
