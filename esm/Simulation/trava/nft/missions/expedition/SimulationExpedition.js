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
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateExpeditionWithdraw = exports.simulateExpeditionAbandon = exports.simulateExpeditionDeploy = void 0;
function simulateExpeditionDeploy(appState1, _vault, _kinghtId, _buffWinRateTickets, _buffExpTickets, _fromKnight, _fromFee, _fromTicket) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateExpeditionDeploy = simulateExpeditionDeploy;
function simulateExpeditionAbandon(appState1, _vault, _knightId, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateExpeditionAbandon = simulateExpeditionAbandon;
function simulateExpeditionWithdraw(appState1, _vault, _knightId, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = appState1;
        try {
        }
        catch (err) {
            console.log(err);
        }
        return appState;
    });
}
exports.simulateExpeditionWithdraw = simulateExpeditionWithdraw;
