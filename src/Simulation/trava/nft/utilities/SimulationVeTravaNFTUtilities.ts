import { ApplicationState } from "../../../../State/ApplicationState";
import _ from "lodash";
import { _fetchNormal } from "../helpers/utils"
import { BigNumberish, EthAddress, wallet_mode } from "../../../../utils/types";
import { FromAddressError } from "../../../../utils/error";
import { updateTravaGovernanceState, updateUserLockBalance } from "../../governance/UpdateStateAccount";
import { VeTravaState } from "../../../../State";
import { getMode } from "../../../../utils/helper";

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
          let modeFrom: wallet_mode = getMode(appState, _from);
          let modeTo: wallet_mode = getMode(appState, _to);
          if (modeTo == "walletState" || modeTo == "smartWalletState") {
            let data: VeTravaState = appState[modeFrom].veTravaListState.veTravaList.get(_NFTId)!;
            appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
            appState[modeTo].veTravaListState.veTravaList.set(_NFTId, data);
          }
          else{
              appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
          }
    } catch (err) {
        throw err;
      }
      return appState;
}