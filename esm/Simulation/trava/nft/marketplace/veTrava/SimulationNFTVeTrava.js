var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getMode } from "../../../../../utils/helper";
import { tokenLockOptions, updateTravaGovernanceState } from "../../../governance";
import { updateSellingVeTrava } from "./UpdateStateAccount";
import BigNumber from "bignumber.js";
import { updateTokenBalance } from "../../../../basic";
import { NFTNotFoundError } from '../../../../../utils/error';
import { simulateNFTVeTravaTransfer } from "../../utilities/SimulationVeTravaNFTUtilities";
export function simulateNFTVeTravaCreateSale(_appState1, _NFTId, _from, _price, _priceTokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState1);
        try {
            _priceTokenAddress = _priceTokenAddress.toLowerCase();
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield updateTravaGovernanceState(appState);
            }
            if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
                appState = yield updateSellingVeTrava(appState);
            }
            let modeFrom = getMode(appState, _from);
            if (!appState[modeFrom].veTravaListState.veTravaList.has(_NFTId)) {
                throw new NFTNotFoundError("NFT not found");
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
export function simulateNFTVeTravaCancelSale(_appState1, _NFTId, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState1);
        try {
            _to = _to.toLowerCase();
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield updateTravaGovernanceState(appState);
            }
            if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
                appState = yield updateSellingVeTrava(appState);
            }
            let _from = appState.smartWalletState.address.toLowerCase();
            if (!appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)) {
                throw new NFTNotFoundError("NFT not found");
            }
            if (!(_from == appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId).seller.toLowerCase())) {
                throw new Error("Not owner error");
            }
            let data = appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId);
            let tokenLock = tokenLockOptions[appState.chainId].find(x => x.address == data.lockedToken.address);
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
            appState = yield simulateNFTVeTravaTransfer(appState, _NFTId, _from, _to);
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
export function simulateNFTVeTravaBuy(_appState1, _NFTId, _from, _to) {
    return __awaiter(this, void 0, void 0, function* () {
        let appState = Object.assign({}, _appState1);
        try {
            _from = _from.toLowerCase();
            _to = _to.toLowerCase();
            if (appState.TravaGovernanceState.totalSupply == "") {
                appState = yield updateTravaGovernanceState(appState);
            }
            if (appState.NFTVeTravaMarketSellingState.isFetch == false) {
                appState = yield updateSellingVeTrava(appState);
            }
            let modeFrom = getMode(appState, _from);
            if (!appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId)) {
                throw new NFTNotFoundError("NFT not found");
            }
            if (_from == appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId).seller.toLowerCase()) {
                throw new Error("Seller is Buyer error");
            }
            let data = appState.NFTVeTravaMarketSellingState.sellingVeTrava.find(x => x.id == _NFTId);
            let tokenLock = tokenLockOptions[appState.chainId].find(x => x.address == data.lockedToken.address);
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
            if (!appState[modeFrom].tokenBalances.has(priceTokenAddress.toLowerCase())) {
                appState = yield updateTokenBalance(appState, _from, priceTokenAddress);
            }
            let balanceOfToken = BigNumber(0);
            balanceOfToken = BigNumber(appState[modeFrom].tokenBalances.get(priceTokenAddress.toLowerCase()));
            let newBalance = balanceOfToken.minus(price).toFixed();
            appState[modeFrom].tokenBalances.set(priceTokenAddress.toLowerCase(), newBalance);
            if (_to == appState.walletState.address.toLowerCase() || _to == appState.smartWalletState.address.toLowerCase()) {
                appState[getMode(appState, _to)].veTravaListState.veTravaList.set(_NFTId, data1);
            }
            appState.NFTVeTravaMarketSellingState.sellingVeTrava = appState.NFTVeTravaMarketSellingState.sellingVeTrava.filter(x => x.id != _NFTId);
        }
        catch (err) {
            throw err;
        }
        return appState;
    });
}
