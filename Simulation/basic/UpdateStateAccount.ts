
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import ERC20Mock from "../../abis/ERC20Mock.json";
import {Contract,JsonRpcProvider} from "ethers";

export async function updateUserEthBalance(appState:ApplicationState){
    appState.walletState.ethBalances = String(await appState.web3!.getBalance(appState.walletState.address))
}
export async function updateSmartWalletEthBalance(appState:ApplicationState){
    appState.smartWalletState.ethBalances = String(await appState.web3!.getBalance(appState.smartWalletState.address))
}
export async function updateUserTokenBalance(appState:ApplicationState,address:EthAddress){
    const TokenContract = new Contract(address,ERC20Mock,appState.web3)
    const balance = String(await TokenContract.balanceOf(appState.walletState.address));
    appState.walletState.tokenBalances.set(address, balance);
}
export async function updateSmartWalletTokenBalance(appState:ApplicationState,address:EthAddress){
  const TokenContract = new Contract(address,ERC20Mock,appState.web3)
    const balance = String(await TokenContract.balanceOf(appState.walletState.address));
    appState.smartWalletState.tokenBalances.set(address, balance);
}
