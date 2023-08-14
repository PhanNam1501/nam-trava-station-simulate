import {ethers} from "hardhat";
import { ApplicationState } from "../../State/ApplicationState";
import { EthAddress } from "../../utils/types";
import { abi as ERC20Mock } from "../../abis/ERC20Mock.json";
export async function updateUserEthBalance(appState:ApplicationState){

    
    appState.walletState.ethBalances = String(await ethers.provider.getBalance(appState.walletState.address))
}
export async function updateSmartWalletEthBalance(appState:ApplicationState){
    appState.smartWalletState.ethBalances = String(await ethers.provider.getBalance(appState.smartWalletState.address))
}
export async function updateUserTokenBalance(appState:ApplicationState,address:EthAddress){
    const TokenContract = await ethers.getContractAt(
      ERC20Mock,
      address
    );
    const balance = String(await TokenContract.balanceOf(appState.walletState.address));
    appState.walletState.tokenBalances.set(address, balance);
}
export async function updateSmartWalletTokenBalance(appState:ApplicationState,address:EthAddress){
    const TokenContract = await ethers.getContractAt(
      ERC20Mock,
      address
    );
    const balance = String(await TokenContract.balanceOf(appState.walletState.address));
    appState.smartWalletState.tokenBalances.set(address, balance);
}
