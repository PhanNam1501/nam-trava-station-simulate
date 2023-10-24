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
    let mode: "walletState" | "smartWalletState" = "walletState"
    if (from == appState.smartWalletState.address) {
      mode = "smartWalletState"
    }
    if (contract.toLowerCase() == getAddr("NFT_CORE_ADDRESS", appState1.chainId).toLowerCase()) {
      let currentVersion: "v1" | "v2" = "v1";
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
      } else if (to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
        to = appState.smartWalletState.address;
        appState.smartWalletState.nfts[currentVersion][tokenId] = currentNFT;
      }
    }
    else {
      let currentVersion: "v1" | "v2" | "specials" = "v1";
      let currentNFT = appState[mode].collection.v1.find(
        (n: any) => n.id == tokenId
      );
      if (!currentNFT) {
        currentNFT = appState[mode].collection.v2.find(
          (n: any) => n.id == tokenId
        );
        currentVersion = "v2";
      }
      if (!currentNFT) {
        let currentNFTSpecial = appState[mode].collection.specials.find(
          (n: any) => n.id == tokenId
        );
        currentVersion = "specials";

        // Giảm NFT
        appState[mode].collection[currentVersion] = (appState[mode].collection[currentVersion]).filter((obj: any) => obj.id != tokenId);

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
        appState[mode].collection[currentVersion] = (appState[mode].collection[currentVersion]).filter((obj: any) => obj.id != tokenId);

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
