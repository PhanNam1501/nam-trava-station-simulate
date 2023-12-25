var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAddr } from "../../../../utils/address";
export function simulateTravaNFTTransfer(appState1, from, to, tokenId, contract) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            let mode = "walletState";
            if (from == appState.smartWalletState.address) {
                mode = "smartWalletState";
            }
            if (contract.toLowerCase() == getAddr("NFT_CORE_ADDRESS", appState1.chainId).toLowerCase()) {
                let currentVersion = "v1";
                let currentNFT = appState[mode].nfts.v1[tokenId];
                if (!currentNFT) {
                    currentNFT = appState[mode].nfts.v2[tokenId];
                    currentVersion = "v2";
                }
                // Giảm NFT
                delete appState[mode].nfts[currentVersion][tokenId];
                // Tăng NFT
                if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
                    to = appState.walletState.address;
                    appState.walletState.nfts[currentVersion][tokenId] = currentNFT;
                }
                else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
                    to = appState.smartWalletState.address;
                    appState.smartWalletState.nfts[currentVersion][tokenId] = currentNFT;
                }
            }
            else {
                let currentVersion = "v1";
                let currentNFT = appState[mode].collection.v1.find((n) => n.id == tokenId);
                if (!currentNFT) {
                    currentNFT = appState[mode].collection.v2.find((n) => n.id == tokenId);
                    currentVersion = "v2";
                }
                if (!currentNFT) {
                    let currentNFTSpecial = appState[mode].collection.specials.find((n) => n.id == tokenId);
                    currentVersion = "specials";
                    // Giảm NFT
                    appState[mode].collection[currentVersion] = (appState[mode].collection[currentVersion]).filter((obj) => obj.id != tokenId);
                    if (currentNFTSpecial) {
                        // Tăng NFT
                        if (to == appState.walletState.address) {
                            appState.walletState.collection[currentVersion].push(currentNFTSpecial);
                        }
                        else {
                            appState.smartWalletState.collection[currentVersion].push(currentNFTSpecial);
                        }
                    }
                }
                else {
                    // Giảm NFT
                    appState[mode].collection[currentVersion] = (appState[mode].collection[currentVersion]).filter((obj) => obj.id != tokenId);
                    // Tăng NFT
                    if (to == appState.walletState.address) {
                        appState.walletState.collection[currentVersion].push(currentNFT);
                    }
                    else {
                        appState.smartWalletState.collection[currentVersion].push(currentNFT);
                    }
                }
            }
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
