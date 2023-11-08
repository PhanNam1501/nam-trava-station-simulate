import { ApplicationState } from "../../../../State/ApplicationState";
import _ from "lodash";
import { _fetchNormal } from "../helpers/utils"
import { BigNumberish, EthAddress, wallet_mode } from "../../../../utils/types";
import { FromAddressError } from "../../../../utils/error";
import { updateTravaGovernanceState, updateUserLockBalance } from "../../governance/UpdateStateAccount";
import { VeTravaState } from "../../../../State/TravaGovenanceState";
export async function simulateNFTVeTravaTranfer(
    _appState1: ApplicationState,
    _NFTId: string,
    _from: EthAddress,
    _to: EthAddress,
): Promise<ApplicationState> {
    let appState = {..._appState1};
    try{
        if (appState.TravaGovernanceState.totalSupply == "") {
            appState = await updateTravaGovernanceState(appState);
          }
          let modeFrom: wallet_mode;
          let modeTo: "walletState" | "smartWalletState" | "Other";
          if (_from.toLowerCase() == appState.walletState.address.toLowerCase()) {
            modeFrom = "walletState"
          } else if (_from.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            modeFrom = "smartWalletState"
          } else {
            throw new FromAddressError()
          }
          if (_to.toLowerCase() == appState.walletState.address.toLowerCase()) {
            modeTo = "walletState"
          } else if (_to.toLowerCase() == appState.smartWalletState.address.toLowerCase()) {
            modeTo = "smartWalletState"
          } else {
            modeTo = "Other"
          }
        if (modeTo == "Other") {
            appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
        }
        else{
            let data: VeTravaState = appState[modeFrom].veTravaListState.veTravaList.get(_NFTId)!;
            appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
            appState[modeTo].veTravaListState.veTravaList.set(_NFTId, data);
        }
    } catch (err) {
        throw err;
      }
      return appState;
}