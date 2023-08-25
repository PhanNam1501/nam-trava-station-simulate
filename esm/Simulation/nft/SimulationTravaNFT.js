var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAddr } from "../../utils/address";
export function simulateTravaNFTBuy(appState1, tokenId, from, to) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            let currentVersion = "v1";
            let currentNFT = appState.NFTState.nfts.v1.find(n => n.id == tokenId);
            if (!currentNFT) {
                currentNFT = appState.NFTState.nfts.v2.find(n => n.id == tokenId);
                currentVersion = "v2";
            }
            if (!currentNFT) {
                throw new Error("NFT is not being sold");
            }
            const travaAddress = getAddr("TRAVA_TOKEN").toLowerCase();
            if (from == appState.walletState.address) {
                let travaBalance = (_a = appState.walletState.tokenBalances.get(travaAddress)) !== null && _a !== void 0 ? _a : "0";
                appState.walletState.tokenBalances.set(travaAddress, (BigInt(travaBalance) - BigInt(currentNFT.data.price)).toString());
            }
            if (from == appState.smartWalletState.address) {
                let travaBalance = (_b = appState.smartWalletState.tokenBalances.get(travaAddress)) !== null && _b !== void 0 ? _b : 0;
                appState.smartWalletState.tokenBalances.set(travaAddress, (BigInt(travaBalance) - BigInt(currentNFT.data.price)).toString());
            }
            if (to == appState.walletState.address) {
                appState.walletState.nfts[currentVersion].push({ id: tokenId });
            }
            if (to == appState.smartWalletState.address) {
                appState.smartWalletState.nfts[currentVersion].push({ id: tokenId });
            }
            appState.NFTState.nfts.v1 = appState.NFTState.nfts[currentVersion].filter((obj) => obj.id != tokenId);
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function simulateTravaNFTSell(appState1, tokenId, price, from) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            let currentVersion = "v1";
            if (from == appState.walletState.address) {
                let currentNFT = appState.walletState.nfts.v1.find(n => n.id == tokenId);
                if (!currentNFT) {
                    currentNFT = appState.walletState.nfts.v2.find(n => n.id == tokenId);
                    currentVersion = "v2";
                }
                appState.walletState.nfts[currentVersion] = appState.walletState.nfts[currentVersion].filter((obj) => obj.id != tokenId);
            }
            else {
                let currentNFT = appState.smartWalletState.nfts.v1.find(n => n.id == tokenId);
                if (!currentNFT) {
                    currentNFT = appState.smartWalletState.nfts.v2.find(n => n.id == tokenId);
                    currentVersion = "v2";
                }
                appState.smartWalletState.nfts[currentVersion] = appState.smartWalletState.nfts[currentVersion].filter((obj) => obj.id != tokenId);
            }
            appState.NFTState.nfts[currentVersion].push({ id: tokenId, data: { price, seller: appState.smartWalletState.address } });
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
export function simulateTravaNFTTransfer(appState1, from, to, tokenId, contract) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            let prefix = "collection";
            if (contract.toLowerCase() == getAddr("NFT_CORE_ADDRESS").toLowerCase()) {
                prefix = "nfts";
            }
            let currentVersion = "v1";
            let currentNFT = appState.walletState[prefix].v1.find((n) => n.id == tokenId);
            if (!currentNFT) {
                currentNFT = appState.walletState[prefix].v2.find((n) => n.id == tokenId);
                currentVersion = "v2";
            }
            // Giảm NFT
            if (from == appState.walletState.address) {
                appState.walletState[prefix][currentVersion] = appState.walletState[prefix][currentVersion].filter((obj) => obj.id != tokenId);
            }
            else if (from == appState.smartWalletState.address) {
                appState.smartWalletState[prefix][currentVersion] = appState.smartWalletState[prefix][currentVersion].filter((obj) => obj.id != tokenId);
            }
            // Tăng NFT
            if (to == appState.walletState.address) {
                appState.walletState[prefix][currentVersion].push({ id: tokenId });
            }
            else {
                appState.smartWalletState[prefix][currentVersion].push({ id: tokenId });
            }
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
