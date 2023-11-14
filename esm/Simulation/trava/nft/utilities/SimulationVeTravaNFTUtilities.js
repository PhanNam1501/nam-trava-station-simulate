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
exports.simulateNFTVeTravaTranfer = void 0;
const error_1 = require("../../../../utils/error");
const UpdateStateAccount_1 = require("../../governance/UpdateStateAccount");
const helper_1 = require("../../../../utils/helper");
const basic_1 = require("../../../basic");
function simulateNFTVeTravaTranfer(_appState1, _NFTId, _from, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState1);
        try {
            _from = _from.toLowerCase();
            _to = _to.toLowerCase();
            let tokenAddress = "";
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, UpdateStateAccount_1.updateTravaGovernanceState)(appState);
            }
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (!appState[modeFrom].veTravaListState.veTravaList.has(_NFTId)) {
                throw new error_1.NFTNotFoundError("NFT not found");
            }
            if (appState[modeFrom].veTravaListState.veTravaList.has(_NFTId)) {
                if (_to == appState.walletState.address.toLowerCase() || _to == appState.smartWalletState.address.toLowerCase()) {
                    let data = appState[modeFrom].veTravaListState.veTravaList.get(_NFTId);
                    appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
                    appState[(0, helper_1.getMode)(appState, _to)].veTravaListState.veTravaList.set(_NFTId, data);
                    tokenAddress = data.tokenInVeTrava.tokenLockOption.address;
                }
                else {
                    appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
                }
            }
            if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
                appState = yield (0, basic_1.updateTokenBalance)(appState, _from, tokenAddress);
            }
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
exports.simulateNFTVeTravaTranfer = simulateNFTVeTravaTranfer;
