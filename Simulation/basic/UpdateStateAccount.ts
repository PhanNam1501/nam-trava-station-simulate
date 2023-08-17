
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import ERC20Mock from "../../abis/ERC20Mock.json";
import {Contract,JsonRpcProvider} from "ethers";
import _ from "lodash";

export async function updateUserEthBalance(appState1:ApplicationState): Promise<ApplicationState>{
    const appState = _.cloneDeep(appState1);
    appState.walletState.ethBalances = String(await appState.web3!.getBalance(appState.walletState.address))
    return appState;
}
export async function updateSmartWalletEthBalance(appState1:ApplicationState): Promise<ApplicationState>{
    const appState = _.cloneDeep(appState1);
    appState.smartWalletState.ethBalances = String(await appState.web3!.getBalance(appState.smartWalletState.address))
    return appState;
}
export async function updateUserTokenBalance(appState1:ApplicationState,address:EthAddress): Promise<ApplicationState>{
    const appState = _.cloneDeep(appState1);
    const TokenContract = new Contract(address,ERC20Mock,appState.web3)
    const balance = String(await TokenContract.balanceOf(appState.walletState.address));
    appState.walletState.tokenBalances.set(address, balance);
    return appState;
}
export async function updateSmartWalletTokenBalance(appState1:ApplicationState,address:EthAddress): Promise<ApplicationState>{
    const appState = _.cloneDeep(appState1);
  const TokenContract = new Contract(address,ERC20Mock,appState.web3)
    const balance = String(await TokenContract.balanceOf(appState.walletState.address));
    appState.smartWalletState.tokenBalances.set(address, balance);
    return appState;
}
