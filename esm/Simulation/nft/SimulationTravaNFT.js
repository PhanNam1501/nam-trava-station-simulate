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
import { CollectionName } from "./KnightConfig";
export function simulateTravaNFTBuy(appState1, tokenId, from, to) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            let currentVersion = "v1";
            let currentNFT = appState.NFTSellingState.v1.find((n) => n.id == tokenId);
            if (!currentNFT) {
                currentNFT = appState.NFTSellingState.v2.find((n) => n.id == tokenId);
                currentVersion = "v2";
            }
            if (!currentNFT) {
                throw new Error("NFT is not being sold");
            }
            const travaAddress = getAddr("TRAVA_TOKEN", appState1.chainId).toLowerCase();
            if (from == appState.walletState.address) {
                let travaBalance = (_a = appState.walletState.tokenBalances.get(travaAddress)) !== null && _a !== void 0 ? _a : "0";
                appState.walletState.tokenBalances.set(travaAddress, (BigInt(travaBalance) - BigInt(currentNFT.price)).toString());
            }
            if (from == appState.smartWalletState.address) {
                let travaBalance = (_b = appState.smartWalletState.tokenBalances.get(travaAddress)) !== null && _b !== void 0 ? _b : 0;
                appState.smartWalletState.tokenBalances.set(travaAddress, (BigInt(travaBalance) - BigInt(currentNFT.price)).toString());
            }
            const data = {
                tokenId: currentNFT.id,
                version: currentNFT.collectionId.toString(),
                set: currentNFT.collectionId,
                rarity: currentNFT.nRarity,
                type: currentNFT.nType,
                exp: currentNFT.exp,
            };
            if (to == appState.walletState.address) {
                appState.walletState.nfts[currentVersion][tokenId] = data;
            }
            if (to == appState.smartWalletState.address) {
                appState.smartWalletState.nfts[currentVersion][tokenId] = data;
            }
            appState.NFTSellingState[currentVersion] = appState.NFTSellingState[currentVersion].filter((obj) => obj.id != tokenId);
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
            let currentNFT = undefined;
            if (from == appState.walletState.address) {
                currentNFT = appState.walletState.nfts.v1[tokenId];
                if (!currentNFT) {
                    currentNFT = appState.walletState.nfts.v2[tokenId];
                    currentVersion = "v2";
                }
                delete appState.walletState.nfts[currentVersion][tokenId];
            }
            else {
                currentNFT = appState.smartWalletState.nfts.v1[tokenId];
                if (!currentNFT) {
                    currentNFT = appState.smartWalletState.nfts.v2[tokenId];
                    currentVersion = "v2";
                }
                delete appState.smartWalletState.nfts[currentVersion][tokenId];
            }
            const collectionId = parseInt(currentNFT.version);
            const collectionName = CollectionName[collectionId - 1];
            const data = {
                id: currentNFT.tokenId,
                collectionName,
                collectionId,
                nRarity: currentNFT.rarity,
                nType: currentNFT.type,
                rarity: currentNFT.rarity.toString(),
                type: currentNFT.type.toString(),
                exp: currentNFT.exp,
                price: price,
                seller: appState.smartWalletState.address,
            };
            appState.NFTSellingState[currentVersion].push(data);
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
            if (contract == getAddr("NFT_CORE_ADDRESS", appState1.chainId)) {
                let currentVersion = "v1";
                let currentNFT = appState.walletState.nfts.v1[tokenId];
                if (!currentNFT) {
                    currentNFT = appState.walletState.nfts.v2[tokenId];
                    currentVersion = "v2";
                }
                // Giảm NFT
                if (from == appState.walletState.address) {
                    delete appState.walletState.nfts[currentVersion][tokenId];
                }
                else if (from == appState.smartWalletState.address) {
                    delete appState.smartWalletState.nfts[currentVersion][tokenId];
                }
                // Tăng NFT
                if (to == appState.walletState.address) {
                    appState.walletState.nfts[currentVersion][tokenId] = currentNFT;
                }
                else {
                    appState.smartWalletState.nfts[currentVersion][tokenId] = currentNFT;
                }
            }
            else {
                let currentVersion = "v1";
                let currentNFT = appState.walletState.collection.v1.find((n) => n.id == tokenId);
                if (!currentNFT) {
                    currentNFT = appState.walletState.collection.v2.find((n) => n.id == tokenId);
                    currentVersion = "v2";
                }
                if (!currentNFT) {
                    let currentNFTSpecial = appState.walletState.collection.specials.find((n) => n.id == tokenId);
                    currentVersion = "specials";
                    // Giảm NFT
                    if (from == appState.walletState.address) {
                        appState.walletState.collection[currentVersion] = (appState.walletState.collection[currentVersion]).filter((obj) => obj.id != tokenId);
                    }
                    else if (from == appState.smartWalletState.address) {
                        appState.smartWalletState.collection[currentVersion] = appState.smartWalletState.collection[currentVersion].filter((obj) => obj.id != tokenId);
                    }
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
                    if (from == appState.walletState.address) {
                        appState.walletState.collection[currentVersion] = (appState.walletState.collection[currentVersion]).filter((obj) => obj.id != tokenId);
                    }
                    else if (from == appState.smartWalletState.address) {
                        appState.smartWalletState.collection[currentVersion] = appState.smartWalletState.collection[currentVersion].filter((obj) => obj.id != tokenId);
                    }
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
export function simulateTravaNFTCancelSale(appState1, to, tokenId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            let currentVersion = "v1";
            let currentNFT = appState.smartWalletState.sellingNFT.v1.find((n) => n.id == tokenId);
            if (!currentNFT) {
                currentNFT = appState.smartWalletState.sellingNFT.v2.find((n) => n.id == tokenId);
                currentVersion = "v2";
            }
            appState.NFTSellingState[currentVersion] = appState.NFTSellingState[currentVersion].filter(x => x.id != tokenId);
            appState.smartWalletState.sellingNFT[currentVersion] = appState.smartWalletState.sellingNFT[currentVersion].filter(x => x.id != tokenId);
            let data = {
                tokenId: tokenId,
                version: currentVersion,
                set: currentNFT.collectionId,
                rarity: currentNFT.nRarity,
                type: currentNFT.nType,
                exp: currentNFT.exp
            };
            if (to == appState.smartWalletState.address) {
                appState.smartWalletState.nfts[currentVersion][tokenId] = data;
            }
            else if (to == appState.walletState.address) {
                appState.walletState.nfts[currentVersion][tokenId] = data;
            }
            return appState;
        }
        catch (err) {
            throw err;
        }
    });
}
