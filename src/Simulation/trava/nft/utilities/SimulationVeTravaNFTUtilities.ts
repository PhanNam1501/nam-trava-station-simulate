import { ApplicationState } from "../../../../State/ApplicationState";
import _ from "lodash";
import { _fetchNormal } from "../helpers/utils"
import { EthAddress, uint256, wallet_mode } from "../../../../utils/types";
import { NFTNotFoundError } from "../../../../utils/error";
import { updateTravaGovernanceState, updateUserLockBalance } from "../../governance/UpdateStateAccount";
import { VeTravaState } from "../../../../State";
import { getMode } from "../../../../utils/helper";

export async function simulateNFTVeTravaTransfer(
    _appState1: ApplicationState,
    _NFTId: uint256,
    _from: EthAddress,
    _to: EthAddress,
): Promise<ApplicationState> {
    let appState = {..._appState1};
    try{
        _from = _from.toLowerCase();
        _to = _to.toLowerCase();
        let tokenAddress: EthAddress = "";
        if (appState.TravaGovernanceState.totalSupply == "") {
            appState = await updateTravaGovernanceState(appState);
          }
          let modeFrom: wallet_mode = getMode(appState, _from);
          if (!appState[modeFrom].veTravaListState.veTravaList.has(_NFTId)) {
            throw new NFTNotFoundError("NFT not found");
          }
          if (_to == appState.walletState.address.toLowerCase() || _to == appState.smartWalletState.address.toLowerCase()) {
            let data: VeTravaState = appState[modeFrom].veTravaListState.veTravaList.get(_NFTId)!;
            appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
            appState[getMode(appState, _to)].veTravaListState.veTravaList.set(_NFTId, data);
            tokenAddress = data.tokenInVeTrava.tokenLockOption.address;
          }
          else{
              appState[modeFrom].veTravaListState.veTravaList.delete(_NFTId);
          }
          
    } catch (err) {
      throw err;
      }
      return appState;
}