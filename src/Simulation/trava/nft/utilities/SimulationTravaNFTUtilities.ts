import { EthAddress } from "../../../../utils/types";
import { ApplicationState } from "../../../../State/ApplicationState";
import { getAddr } from "../../../../utils/address";
import _ from "lodash";

export async function simulateTravaNFTTransfer(
  appState1: ApplicationState,
  from: EthAddress,
  to: EthAddress,
  tokenId: number | string,
  contract: EthAddress
): Promise<ApplicationState> {
  try {
    const appState = { ...appState1 };
    if (contract.toLowerCase() == getAddr("NFT_CORE_ADDRESS", appState1.chainId).toLowerCase()) {
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
      if (to.toLowerCase() == appState.walletState.address.toLowerCase()) {
        to = appState.walletState.address;
        appState.walletState.nfts[currentVersion][tokenId] = currentNFT;
      } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
        to = appState.smartWalletState.address;
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
      if (!currentNFT) {
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
        if (currentNFTSpecial) {
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
