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
exports.simulateNFTVeTravaBuy = exports.simulateNFTVeTravaCancelSale = exports.simulateNFTVeTravaCreateSale = void 0;
const helper_1 = require("../../../../../utils/helper");
const governance_1 = require("../../../governance");
const UpdateStateAccount_1 = require("./UpdateStateAccount");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const basic_1 = require("../../../../basic");
const error_1 = require("../../../../../utils/error");
const SimulationVeTravaNFTUtilities_1 = require("../../utilities/SimulationVeTravaNFTUtilities");
function simulateNFTVeTravaCreateSale(_appState1, _NFTId, _from, _price, _priceTokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState1);
        try {
            _priceTokenAddress = _priceTokenAddress.toLowerCase();
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, governance_1.updateTravaGovernanceState)(appState);
            }
            if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateSellingVeTrava)(appState);
            }
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (!appState[modeFrom].veTravaListState.veTravaList.has(_NFTId)) {
                throw new error_1.NFTNotFoundError("NFT not found");
            }
            if (appState[modeFrom].veTravaListState.veTravaList.has(_NFTId)) {
                let data = appState[modeFrom].veTravaListState.veTravaList.get(_NFTId);
                let priceToken = {
                    address: _priceTokenAddress,
                    amount: _price,
                };
                let tokenLocked = {
                    address: data.tokenInVeTrava.tokenLockOption.address,
                    amount: data.tokenInVeTrava.balances,
                };
                let sellVeToken = {
                    id: _NFTId,
                    rwAmount: data.rewardTokenBalance.compoundAbleRewards,
                    end: data.unlockTime,
                    lockedToken: tokenLocked,
                    votingPower: data.votingPower,
                    seller: _from,
                    priceToken: priceToken,
                };
                appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
                appState.NFTVeTravaMarketSellingState.sellingVeTrava.push(sellVeToken);
            }
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
exports.simulateNFTVeTravaCreateSale = simulateNFTVeTravaCreateSale;
function simulateNFTVeTravaCancelSale(_appState1, _NFTId, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState1);
        try {
            _to = _to.toLowerCase();
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, governance_1.updateTravaGovernanceState)(appState);
            }
            if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateSellingVeTrava)(appState);
            }
            let _from = appState.smartWalletState.address.toLowerCase();
            if (!appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)) {
                throw new error_1.NFTNotFoundError("NFT not found");
            }
            if (!(_from == appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId).seller.toLowerCase())) {
                throw new Error("Not owner error");
            }
            let data = appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId);
            let tokenLock = governance_1.tokenLockOptions[appState.chainId].find(x => x.address == data.lockedToken.address);
            let data1 = {
                id: data.id,
                votingPower: data.votingPower,
                tokenInVeTrava: {
                    balances: data.lockedToken.amount,
                    tokenLockOption: tokenLock,
                },
                unlockTime: data.end,
                rewardTokenBalance: {
                    compoundAbleRewards: data.rwAmount,
                    compoundedRewards: data.rwAmount,
                    balances: data.rwAmount,
                },
            };
            appState.smartWalletState.veTravaListState.veTravaList.set(_NFTId, data1);
            appState.NFTVeTravaMarketSellingState.sellingVeTrava = appState.NFTVeTravaMarketSellingState.sellingVeTrava.filter(x => x.id != _NFTId);
            appState = yield (0, SimulationVeTravaNFTUtilities_1.simulateNFTVeTravaTranfer)(appState, _NFTId, _from, _to);
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
exports.simulateNFTVeTravaCancelSale = simulateNFTVeTravaCancelSale;
function simulateNFTVeTravaBuy(_appState1, _NFTId, _from, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState1);
        try {
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield (0, governance_1.updateTravaGovernanceState)(appState);
            }
            if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
                appState = yield (0, UpdateStateAccount_1.updateSellingVeTrava)(appState);
            }
            let modeFrom = (0, helper_1.getMode)(appState, _from);
            if (!appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)) {
                throw new error_1.NFTNotFoundError("NFT not found");
            }
            _from = _from.toLowerCase();
            if (_from != appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId).seller.toLowerCase()) {
                let data = appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId);
                let tokenLock = governance_1.tokenLockOptions[appState.chainId].find(x => x.address == data.lockedToken.address);
                let data1 = {
                    id: data.id,
                    votingPower: data.votingPower,
                    tokenInVeTrava: {
                        balances: data.lockedToken.amount,
                        tokenLockOption: tokenLock,
                    },
                    unlockTime: data.end,
                    rewardTokenBalance: {
                        compoundAbleRewards: data.rwAmount,
                        compoundedRewards: data.rwAmount,
                        balances: data.rwAmount,
                    },
                };
                let price = data.priceToken.amount;
                let priceTokenAddress = data.priceToken.address.toLowerCase();
                if (modeFrom == "walletState") {
                    appState = yield (0, basic_1.updateUserTokenBalance)(appState, priceTokenAddress);
                }
                else if (modeFrom == "smartWalletState") {
                    appState = yield (0, basic_1.updateSmartWalletTokenBalance)(appState, priceTokenAddress);
                }
                let balanceOfToken = (0, bignumber_js_1.default)(0);
                if (appState[modeFrom].tokenBalances.has(priceTokenAddress.toLowerCase())) {
                    balanceOfToken = (0, bignumber_js_1.default)(appState[modeFrom].tokenBalances.get(priceTokenAddress.toLowerCase()));
                }
                let newBalance = balanceOfToken.minus(price).toFixed();
                appState[modeFrom].tokenBalances.set(priceTokenAddress.toLowerCase(), newBalance);
                appState[modeFrom].veTravaListState.veTravaList.set(_NFTId, data1);
                appState.NFTVeTravaMarketSellingState.sellingVeTrava = appState.NFTVeTravaMarketSellingState.sellingVeTrava.filter(x => x.id != _NFTId);
            }
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
exports.simulateNFTVeTravaBuy = simulateNFTVeTravaBuy;
