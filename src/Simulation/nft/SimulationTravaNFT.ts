import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import TravaNFTSellABI from "../../abis/TravaNFTSell.json";
import { getAddr } from "../../utils/address";
import _ from "lodash";
import { ArmouryType, NormalKnight, SellingArmouryType, SpecialKnight } from "../../global";
import { CollectionName } from "./KnightConfig";

export async function simulateTravaNFTBuy(
  appState1: ApplicationState,
  tokenId: number | string,
  from: EthAddress,
  to: EthAddress
): Promise<ApplicationState> {
  try {
    const appState = { ...appState1 };
    let currentVersion: "v1" | "v2" = "v1";
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
      let travaBalance = appState.walletState.tokenBalances.get(travaAddress) ?? "0";
      appState.walletState.tokenBalances.set(
        travaAddress,
        (BigInt(travaBalance) - BigInt(currentNFT.price)).toString()
      );
    }
    if (from == appState.smartWalletState.address) {
      let travaBalance =
        appState.smartWalletState.tokenBalances.get(travaAddress) ?? 0;
      appState.smartWalletState.tokenBalances.set(
        travaAddress,
        (BigInt(travaBalance) - BigInt(currentNFT.price)).toString()
      );
    }
    const data: ArmouryType = {
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
  } catch (err) {
    throw err;
  }
}

export async function simulateTravaNFTSell(
  appState1: ApplicationState,
  tokenId: number | string,
  price: number | string,
  from: EthAddress
): Promise<ApplicationState> {
  try {
    const appState = { ...appState1 };

    let currentVersion: "v1" | "v2" = "v1";
    let currentNFT: ArmouryType | undefined = undefined;
    if (from == appState.walletState.address) {
      currentNFT = appState.walletState.nfts.v1[tokenId];
      if (!currentNFT) {
        currentNFT = appState.walletState.nfts.v2[tokenId];
        currentVersion = "v2";
      }
      delete appState.walletState.nfts[currentVersion][tokenId];
    } else {
      currentNFT = appState.smartWalletState.nfts.v1[tokenId];
      if (!currentNFT) {
        currentNFT = appState.smartWalletState.nfts.v2[tokenId];
        currentVersion = "v2";
      }
      delete appState.smartWalletState.nfts[currentVersion][tokenId];
    }
    
    const collectionId = parseInt(currentNFT.version);
    const collectionName = CollectionName[collectionId - 1];
    const data: SellingArmouryType = {
      id: currentNFT.tokenId,
      collectionName,
      collectionId,
      nRarity: currentNFT.rarity,
      nType: currentNFT.type,
      rarity: currentNFT.rarity.toString(),
      type: currentNFT.type.toString(),
      exp: currentNFT.exp,
      price: price as number,
      seller: appState.smartWalletState.address,
    };
    appState.NFTSellingState[currentVersion].push(data);
    return appState;
  } catch (err) {
    throw err;
  }
}

export async function simulateTravaNFTTransfer(
  appState1: ApplicationState,
  from: EthAddress,
  to: EthAddress,
  tokenId: number | string,
  contract: EthAddress
): Promise<ApplicationState> {
  try {
    const appState = { ...appState1 };
    if (contract == getAddr("NFT_CORE_ADDRESS", appState1.chainId)) {
      let currentVersion: "v1" | "v2" = "v1";
      let currentNFT = appState.walletState.nfts.v1[tokenId];
      if (!currentNFT) {
        currentNFT = appState.walletState.nfts.v2[tokenId];
        currentVersion = "v2";
      }
      // Giảm NFT
      if (from == appState.walletState.address) {
        delete appState.walletState.nfts[currentVersion][tokenId];
      } else if (from == appState.smartWalletState.address) {
        delete appState.smartWalletState.nfts[currentVersion][tokenId];
      }
      // Tăng NFT
      if (to == appState.walletState.address) {
        appState.walletState.nfts[currentVersion][tokenId] = currentNFT;
      } else {
        appState.smartWalletState.nfts[currentVersion][tokenId] = currentNFT;
      }
    }
    else {
      let currentVersion: "v1" | "v2" | "specials" = "v1";
      let currentNFT = appState.walletState.collection.v1.find(
        (n: any) => n.id == tokenId
      );
      if (!currentNFT) {
        currentNFT = appState.walletState.collection.v2.find(
          (n: any) => n.id == tokenId
        );
        currentVersion = "v2";
      }
      if(!currentNFT) {
        let currentNFTSpecial = appState.walletState.collection.specials.find(
          (n: any) => n.id == tokenId
        );
        currentVersion = "specials";
        // Giảm NFT
        if (from == appState.walletState.address) {
          appState.walletState.collection[currentVersion] = (appState.walletState.collection[currentVersion]).filter((obj: any) => obj.id != tokenId);
        } else if (from == appState.smartWalletState.address) {
          appState.smartWalletState.collection[currentVersion] = appState.smartWalletState.collection[currentVersion].filter((obj: any) => obj.id != tokenId);
        }
        if(currentNFTSpecial){
          // Tăng NFT
          if (to == appState.walletState.address) {
            appState.walletState.collection[currentVersion].push(currentNFTSpecial);
          } else {
            appState.smartWalletState.collection[currentVersion].push(currentNFTSpecial);
          }
        }
      } else {
        // Giảm NFT
        if (from == appState.walletState.address) {
          appState.walletState.collection[currentVersion] = (appState.walletState.collection[currentVersion]).filter((obj: any) => obj.id != tokenId);
        } else if (from == appState.smartWalletState.address) {
          appState.smartWalletState.collection[currentVersion] = appState.smartWalletState.collection[currentVersion].filter((obj: any) => obj.id != tokenId);
        }
        // Tăng NFT
        if (to == appState.walletState.address) {
          appState.walletState.collection[currentVersion].push(currentNFT);
        } else {
          appState.smartWalletState.collection[currentVersion].push(currentNFT);
        }
      }
    }
    return appState;
  } catch (err) {
    throw err;
  }
}
