import { EthAddress, uint256 } from "trava-station-sdk";
import { ApplicationState } from "../../State/ApplicationState";
import { actions } from "trava-station-sdk"
import { TokenApprove, simulateExecute } from "../../utils/simulateExecute";
import { updateSmartWalletEthBalance, updateSmartWalletTokenBalance, updateUserEthBalance, updateUserTokenBalance } from "./UpdateStateAccount";
import BigNumber from "bignumber.js";
import { NotEnoughBalanceError } from "../../utils/error";
import { convertHexStringToAddress, getAddr } from "../../utils/address";

export async function simulateWrapV2(appState1: ApplicationState, _amount: uint256, actionAddress?: EthAddress): Promise<ApplicationState> {
    let appState = { ...appState1 };

    try {
        if (BigNumber(appState.walletState.ethBalances).isLessThan(_amount)) {
            throw new NotEnoughBalanceError()
        }

        const action = new actions.basic.WrapBnbAction(
            _amount,
            actionAddress
        )

        const encodeActionData = action.encodeForDsProxyCall();

        const tokensApprove = new Array<TokenApprove>();

        await simulateExecute(
            appState,
            tokensApprove,
            {
                target: encodeActionData[0].toString(),
                data: encodeActionData[1].toString(),
                value: _amount
            }
        )

        appState = await updateUserEthBalance(appState, true);
        appState = await updateSmartWalletTokenBalance(appState, getAddr("WBNB_ADDRESS", appState.chainId), true);

    } catch (err) {
        console.log(err);
    }

    return appState;
}

export async function simulateUnwrapV2(appState1: ApplicationState, _amount: uint256, actionAddress?: EthAddress): Promise<ApplicationState> {
    let appState = { ...appState1 };

    try {
        const bnb_address = getAddr("WBNB_ADDRESS", appState.chainId).toLowerCase();

        if (BigNumber(appState.smartWalletState.tokenBalances.get(bnb_address)!).isLessThan(_amount)) {
            throw new NotEnoughBalanceError()
        }

        const action = new actions.basic.UnwrapBnbAction(
            _amount,
            appState.walletState.address,
            actionAddress
        )

        const encodeActionData = action.encodeForDsProxyCall();

        const tokensApprove = new Array<TokenApprove>();

        await simulateExecute(
            appState,
            tokensApprove,
            {
                target: encodeActionData[0].toString(),
                data: encodeActionData[1].toString(),
                value: ""
            }
        )

        appState = await updateSmartWalletEthBalance(appState, true);
        appState = await updateUserTokenBalance(appState, getAddr("WBNB_ADDRESS", appState.chainId), true);

    } catch (err) {
        console.log(err);
    }

    return appState;
}

export async function simulateSendTokenV2(appState1: ApplicationState, _tokenAddress: EthAddress, from: EthAddress, to: EthAddress, _amount: uint256, actionAddress?: EthAddress): Promise<ApplicationState> {
    let appState = { ...appState1 };

    try {
        let tokenAddress = _tokenAddress.toLowerCase()

        if (from.toLowerCase() == appState.smartWalletState.address.toLowerCase() && BigNumber(appState.smartWalletState.tokenBalances.get(tokenAddress)!).isLessThan(_amount)) {
            throw new NotEnoughBalanceError()
        }

        if (from.toLowerCase() == appState.walletState.address.toLowerCase() && BigNumber(appState.walletState.tokenBalances.get(tokenAddress)!).isLessThan(_amount)) {
            throw new NotEnoughBalanceError()
        }

        let action = new actions.basic.SendTokenAction(
            tokenAddress,
            to,
            _amount,
            actionAddress
        )

        let tokensApprove = new Array<TokenApprove>();

        if (from.toLowerCase() == appState.walletState.address.toLowerCase()) {
            action = new actions.basic.PullTokenAction(
                tokenAddress,
                from,
                _amount,
                actionAddress
            )

            let tokenApprove_1: TokenApprove = {
                address: convertHexStringToAddress(_tokenAddress),
                amount: _amount
            }
            tokensApprove.push(tokenApprove_1)
        }

        const encodeActionData = action.encodeForDsProxyCall();


        await simulateExecute(
            appState,
            tokensApprove,
            {
                target: encodeActionData[0].toString(),
                data: encodeActionData[1].toString(),
                value: ""
            }
        )

        appState = await updateSmartWalletTokenBalance(appState, tokenAddress, true);
        appState = await updateUserTokenBalance(appState, tokenAddress, true);

    } catch (err) {
        console.log(err);
    }

    return appState;
}