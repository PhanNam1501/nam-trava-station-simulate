
import { EthAddress, uint256 } from "../../utils/types";
import { ApplicationState } from "../../State/ApplicationState";
import TravaNFTSellABI from "../../abis/TravaNFTSell.json";
import { getAddr } from "../../utils/address";
import _ from "lodash";

export async function simulateTravaNFTBuy(
  appState1: ApplicationState,
  tokenId: number | string,
  from: EthAddress,
  to: EthAddress,
): Promise<ApplicationState> {
  try {
    const appState = {...appState1};
    let currentVersion = "v1";
    let currentNFT = appState.NFTState.nfts.v1.find(n => n.id == tokenId);
    if(!currentNFT){
      currentNFT = appState.NFTState.nfts.v2.find(n => n.id == tokenId);
      currentVersion = "v2";
    }
    if(!currentNFT){
      throw new Error("NFT is not being sold");
    }
    const travaAddress = getAddr("TRAVA_TOKEN").toLowerCase();
    if(from == appState.walletState.address) {
      let travaBalance = appState.walletState.tokenBalances.get(travaAddress) ?? "0";
      appState.walletState.tokenBalances.set(travaAddress, (BigInt(travaBalance) - BigInt(currentNFT.data.price)).toString());
    }
    if(from == appState.smartWalletState.address){
      let travaBalance = appState.smartWalletState.tokenBalances.get(travaAddress) ?? 0;
      appState.smartWalletState.tokenBalances.set(travaAddress, (BigInt(travaBalance) - BigInt(currentNFT.data.price)).toString());
    }
    if(to == appState.walletState.address){
      (appState.walletState.nfts as any)[currentVersion].push({id: tokenId});
    }
    if(to == appState.smartWalletState.address){
      (appState.smartWalletState.nfts as any)[currentVersion].push({id: tokenId});
    }
    appState.NFTState.nfts.v1 = (appState.NFTState.nfts as any)[currentVersion].filter((obj: any) => obj.id != tokenId);
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
    const appState = {...appState1};

    let currentVersion = "v1";
    if(from == appState.walletState.address) {
      let currentNFT = appState.walletState.nfts.v1.find(n => n.id == tokenId);
      if(!currentNFT){
        currentNFT = appState.walletState.nfts.v2.find(n => n.id == tokenId);
        currentVersion = "v2";
      }
      (appState.walletState.nfts as any)[currentVersion] = (appState.walletState.nfts as any)[currentVersion].filter((obj: any) => obj.id != tokenId);
    } else {
      let currentNFT = appState.smartWalletState.nfts.v1.find(n => n.id == tokenId);
      if(!currentNFT){
        currentNFT = appState.smartWalletState.nfts.v2.find(n => n.id == tokenId);
        currentVersion = "v2";
      }
      (appState.smartWalletState.nfts as any)[currentVersion] = (appState.smartWalletState.nfts as any)[currentVersion].filter((obj: any) => obj.id != tokenId);
    }
    (appState.NFTState.nfts as any)[currentVersion].push({id: tokenId, data: {price, seller: appState.smartWalletState.address}});
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
    const appState = {...appState1};
    let prefix: string = "collection";
    if(contract.toLowerCase() == getAddr("NFT_CORE_ADDRESS").toLowerCase()) {
      prefix = "nfts";
    }
    let currentVersion = "v1";
    let currentNFT = (appState.walletState as any)[prefix].v1.find((n: any) => n.id == tokenId);
    if(!currentNFT){
      currentNFT = (appState.walletState as any)[prefix].v2.find((n: any) => n.id == tokenId);
      currentVersion = "v2";
    }
    // Giảm NFT
    if(from == appState.walletState.address) {
      (appState.walletState as any)[prefix][currentVersion] = (appState.walletState as any)[prefix][currentVersion].filter((obj: any) => obj.id != tokenId);
    } else if(from == appState.smartWalletState.address) {
      (appState.smartWalletState as any)[prefix][currentVersion] = (appState.smartWalletState as any)[prefix][currentVersion].filter((obj: any) => obj.id != tokenId);
    }

    // Tăng NFT
    if(to == appState.walletState.address) {
      (appState.walletState as any)[prefix][currentVersion].push({id: tokenId});
    } else {
      (appState.smartWalletState as any)[prefix][currentVersion].push({id: tokenId});
    }
    return appState;
  } catch (err) {
    throw err;
  }
}
