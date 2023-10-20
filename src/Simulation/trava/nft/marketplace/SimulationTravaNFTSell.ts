import { EthAddress } from "../../../../utils/types";
import { ApplicationState } from "../../../../State/ApplicationState";
import { getAddr } from "../../../../utils/address";
import _ from "lodash";
import { ArmouryType, SellingArmouryType } from "../../../../global";
import { CollectionName, RarityMapping, TypeMapping } from "../KnightConfig";
import BigNumber from "bignumber.js";

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
        BigNumber(travaBalance).minus(currentNFT.price).toFixed(0)
      );
    }
    if (from == appState.smartWalletState.address) {
      let travaBalance =
        appState.smartWalletState.tokenBalances.get(travaAddress) ?? 0;
      appState.smartWalletState.tokenBalances.set(
        travaAddress,
        BigNumber(travaBalance).minus(currentNFT.price).toFixed(0)
      );
    }
    const data: ArmouryType = {
      tokenId: currentNFT.id,
      version: currentNFT.collectionId.toString(),
      set: currentNFT.collectionId,
      nRarity: currentNFT.nRarity,
      nType: currentNFT.nType,
      rarity: RarityMapping[currentNFT.nRarity - 1],
      type: TypeMapping[currentNFT.nType - 1],
      exp: currentNFT.exp,
    };
    if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      appState.walletState.nfts[currentVersion][tokenId] = data;
    }
    if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      appState.smartWalletState.nfts[currentVersion][tokenId] = data;
    }

    appState.smartWalletState.sellingNFT[currentVersion] = appState.smartWalletState.sellingNFT[currentVersion].filter(x => x.id != tokenId);
    appState.NFTSellingState[currentVersion] = appState.NFTSellingState[currentVersion].filter((obj) => obj.id != tokenId);
    return appState;
  } catch (err) {
    throw err;
  }
}

export async function simulateTravaNFTSell(
  appState1: ApplicationState,
  tokenId: number | string,
  price: string,
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
      nRarity: currentNFT.nRarity,
      nType: currentNFT.nType,
      rarity: currentNFT.rarity.toString(),
      type: currentNFT.type.toString(),
      exp: currentNFT.exp,
      price: price,
      seller: appState.smartWalletState.address,
    };
    appState.NFTSellingState[currentVersion].push(data);
    appState.smartWalletState.sellingNFT[currentVersion].push(data);
    return appState;
  } catch (err) {
    throw err;
  }
}

export async function simulateTravaNFTCancelSale(
  appState1: ApplicationState,
  to: EthAddress,
  tokenId: number | string
): Promise<ApplicationState> {
  try {
    const appState = { ...appState1 };
    let currentVersion: "v1" | "v2" = "v1";
    let currentNFT = appState.smartWalletState.sellingNFT.v1.find((n) => n.id == tokenId);
    if (!currentNFT) {
      currentNFT = appState.smartWalletState.sellingNFT.v2.find((n) => n.id == tokenId);
      currentVersion = "v2";
    }
    appState.NFTSellingState[currentVersion] = appState.NFTSellingState[currentVersion].filter(x => x.id != tokenId);
    appState.smartWalletState.sellingNFT[currentVersion] = appState.smartWalletState.sellingNFT[currentVersion].filter(x => x.id != tokenId);
    let data: ArmouryType = {
      tokenId: tokenId as number,
      version: currentVersion,
      set: (currentNFT as SellingArmouryType).collectionId,
      nRarity: (currentNFT as SellingArmouryType).nRarity,
      nType: (currentNFT as SellingArmouryType).nType,
      rarity: (currentNFT as SellingArmouryType).rarity,
      type: (currentNFT as SellingArmouryType).type,
      exp: (currentNFT as SellingArmouryType).exp
    }
    if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
      appState.smartWalletState.nfts[currentVersion][tokenId] = data;
    } else if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
      appState.walletState.nfts[currentVersion][tokenId] = data;
    }
    return appState;
  } catch (err) {
    throw err;
  }
}
