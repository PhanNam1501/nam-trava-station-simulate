import BigNumber from "bignumber.js";
import { ApplicationState, Dapp, Reserve, UserAsset } from "../../State";
import { EthAddress } from "../../utils/types";
import { updateUserTokenBalance } from "../basic";
// Comming Soon .......
import { getMode } from "../../utils/helper";
import { updateForkAaveLPState } from "./UpdateStateAccount";
import { MAX_UINT256 } from "../../utils";

export function calculateMaxAmountForkAaveSupply(appState: ApplicationState, _entity_id: string, _tokenAddress: string, _from: EthAddress): BigNumber {
    const tokenAddress = _tokenAddress.toLowerCase();
    const mode = getMode(appState, _from);

    if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
        updateForkAaveLPState(appState, _entity_id);
    }

    const walletBalance = appState[mode].tokenBalances.get(tokenAddress)!;
    if (typeof walletBalance == undefined) {
        throw new Error("Token is not init in " + mode + " state!")
    }

    const lpState = appState.smartWalletState.forkedAaveLPState.get(_entity_id)!
    let tokenInfo = lpState.detailTokenInPool.get(tokenAddress)!;
    if (typeof tokenInfo == undefined) {
        throw new Error("Token is not init in smart wallet lending pool state!")
    }

    return BigNumber(appState[mode].tokenBalances.get(tokenAddress)!);
}

export function calculateMaxAmountForkAaveBorrow(appState: ApplicationState, _entity_id: string, _tokenAddress: string): BigNumber {
    const tokenAddress = _tokenAddress.toLowerCase();

    if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
        updateForkAaveLPState(appState, _entity_id);
    }

    const lpState = appState.smartWalletState.forkedAaveLPState.get(_entity_id)!
    let tokenInfo = lpState.detailTokenInPool.get(tokenAddress)!;

    const tTokenReserveBalanceRaw = BigNumber(tokenInfo.tToken.originToken.balances);
    const tTokenReserveBalance = BigNumber(tTokenReserveBalanceRaw).div(BigNumber("10").pow(tokenInfo.tToken.decimals));
    const availableBorrowsUSD = BigNumber(appState.smartWalletState.travaLPState.availableBorrowsUSD);
    const nativeAvailableBorrow = availableBorrowsUSD.div(tokenInfo.price);

    return BigNumber.max(BigNumber.min(nativeAvailableBorrow, tTokenReserveBalance), 0).multipliedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));
}

export function calculateMaxAmountForkAaveRepay(appState: ApplicationState, _entity_id: string, _tokenAddress: string, _from: EthAddress): BigNumber {
    const tokenAddress = _tokenAddress.toLowerCase();
    const mode = getMode(appState, _from);

    if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
        updateForkAaveLPState(appState, _entity_id);
    }

    const walletBalance = appState[mode].tokenBalances.get(tokenAddress)!;
    if (typeof walletBalance == undefined) {
        throw new Error("Token is not init in " + mode + " state!")
    }

    const lpState = appState.smartWalletState.forkedAaveLPState.get(_entity_id)!
    let tokenInfo = lpState.detailTokenInPool.get(tokenAddress)!;

    let dTokenBalance = tokenInfo.dToken.balances;
    const borrowed = new BigNumber(dTokenBalance);

    return BigNumber.max(BigNumber.min(walletBalance, borrowed), 0);
}

export function calculateMaxAmountForkAaveWithdraw(appState: ApplicationState, _entity_id: string, _tokenAddress: string): BigNumber {
    const tokenAddress = _tokenAddress.toLowerCase();

    if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
        updateForkAaveLPState(appState, _entity_id);
    }

    const lpState = appState.smartWalletState.forkedAaveLPState.get(_entity_id)!
    let tokenInfo = lpState.detailTokenInPool.get(tokenAddress)!;
    const depositedRaw = tokenInfo.tToken.balances;
    const deposited = BigNumber(depositedRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));

    const tTokenReserveBalanceRaw = tokenInfo.tToken.originToken.balances;
    const tTokenReserveBalance = BigNumber(tTokenReserveBalanceRaw).dividedBy(BigNumber("10").pow(tokenInfo.tToken.decimals));

    let nativeAvailableWithdraw = BigNumber(appState.smartWalletState.travaLPState.totalCollateralUSD)
        .minus(BigNumber(appState.smartWalletState.travaLPState.totalDebtUSD).div(BigNumber(appState.smartWalletState.travaLPState.ltv)))
        .div(tokenInfo.price);
    const available = BigNumber(tokenInfo.tToken.totalSupply).minus(tokenInfo.dToken.totalSupply).div(tokenInfo.price);

    if (nativeAvailableWithdraw.isNaN()) {
        nativeAvailableWithdraw = BigNumber(0);
    }

    return BigNumber.max(
        BigNumber.min(deposited, nativeAvailableWithdraw, tTokenReserveBalance, available),
        0
    ).multipliedBy(BigNumber("10").pow(tokenInfo.tToken.decimals))
}

export async function SimulationSupplyForkAaveLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _entity_id: string,
    _tokenAddress: EthAddress,
    _amount: string
): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
            appState = await updateForkAaveLPState(appState, _entity_id);
        }

        const tokenAddress = _tokenAddress.toLowerCase();
        let modeFrom = getMode(appState, _from);

        if (amount.isEqualTo(MAX_UINT256)) {
            amount = calculateMaxAmountForkAaveSupply(appState, _entity_id, tokenAddress, _from)
        }


        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkAaveLPState.forkAaveLP.get(_entity_id);
        if (!data) {
            throw new Error("data not found");
        }
        let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
        let price = dataAssets?.price;
        if (!price) {
            throw new Error("price not found");
        }

        data.totalSupplyInUSD = BigNumber(data.totalSupplyInUSD || 0).plus(amount.multipliedBy(price)).toNumber();

        let dataWallet = appState.smartWalletState.forkedAaveLPState.get(_entity_id)!;
        if (dataWallet.dapps.length == 0) {
            let reserve: Reserve = {
                category: "Lending",
                healthFactor: Number(MAX_UINT256),
                deposit: new Array(),
                borrow: new Array()
            }

            let reserves: Array<Reserve> = new Array();
            reserves.push(reserve);

            let dapp: Dapp = {
                id: _entity_id,
                type: "token",
                value: amount.multipliedBy(price).toNumber(),
                depositInUSD: amount.multipliedBy(price).toNumber(),
                borrowInUSD: 0,
                claimable: 0,
                reserves: reserves
            }

            dataWallet.dapps.push(dapp)

        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            let newData: UserAsset = {
                // key: dataAssets?.key || "",
                id: dataAssets?.id || "",
                // name: dataAssets?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: amount.toNumber(),
                valueInUSD: amount.multipliedBy(price).toNumber(),
                // imgUrl: dataAssets?.imgUrl || "",
                totalValue: amount.multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].reserves[0].deposit.push(newData);
        }
        else {
            let newData: UserAsset = {
                // key: dataAssets?.key || "",
                id: dataAssets?.id || "",
                // name: dataAssets?.name || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: amount.toNumber() + dataInWallet.amount,
                valueInUSD: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                // imgUrl: dataAssets?.imgUrl || "",
                totalValue: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toNumber();
            dataWallet.dapps[0].depositInUSD = BigNumber(dataWallet.dapps[0].depositInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }



        const newAmount = tokenAmount.minus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState.smartWalletState.forkedAaveLPState.set(_entity_id, dataWallet!);
        appState.forkAaveLPState.forkAaveLP.set(_entity_id, data!);

        return appState;
    } catch (err) {
        throw err;
    }
}

export async function SimulationWithdrawForkAaveLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _entity_id: string,
    _tokenAddress: EthAddress,
    _amount: string
): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
            appState = await updateForkAaveLPState(appState, _entity_id);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let modeFrom = getMode(appState, _from);
        if (amount.isEqualTo(MAX_UINT256)) {
            amount = calculateMaxAmountForkAaveWithdraw(appState, _entity_id, tokenAddress);
        }

        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkAaveLPState.forkAaveLP.get(_entity_id);
        if (!data) {
            throw new Error("data not found");
        }
        let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
        let price = dataAssets?.price;
        if (!price) {
            throw new Error("price not found");
        }

        data.totalSupplyInUSD = BigNumber(data.totalSupplyInUSD || 0).minus(amount.multipliedBy(price)).toNumber();

        let dataWallet = appState.smartWalletState.forkedAaveLPState.get(_entity_id)!;

        if (dataWallet.dapps.length == 0) {
            let reserve: Reserve = {
                category: "Lending",
                healthFactor: Number(MAX_UINT256),
                deposit: new Array(),
                borrow: new Array()
            }

            let reserves: Array<Reserve> = new Array();
            reserves.push(reserve);

            let dapp: Dapp = {
                id: _entity_id,
                type: "token",
                value: 0,
                depositInUSD: 0,
                borrowInUSD: 0,
                claimable: 0,
                reserves: reserves
            }

            dataWallet.dapps.push(dapp)

        }


        let dataInWallet = dataWallet.dapps[0].reserves[0].deposit.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: -amount.toNumber(),
                valueInUSD: -amount.multipliedBy(price).toNumber(),
                totalValue: -amount.multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].reserves[0].deposit.push(newData);
        }
        else {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: -amount.toNumber() + dataInWallet.amount,
                valueInUSD: BigNumber(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
                totalValue: BigNumber(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
            };

            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toNumber();
            dataWallet.dapps[0].depositInUSD = BigNumber(dataWallet.dapps[0].depositInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            dataWallet.dapps[0].reserves[0].deposit = dataWallet.dapps[0].reserves[0].deposit.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.plus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState.smartWalletState.forkedAaveLPState.set(_entity_id, dataWallet);
        appState.forkAaveLPState.forkAaveLP.set(_entity_id, data!);

        return appState;
    } catch (err) {
        throw err;
    }
}

export async function SimulationBorrowForkAaveLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _entity_id: string,
    _tokenAddress: EthAddress,
    _amount: string
): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
            appState = await updateForkAaveLPState(appState, _entity_id);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let modeFrom = getMode(appState, _from);
        // Comming Soon .......
        if (amount.isEqualTo(MAX_UINT256)) {
            amount = calculateMaxAmountForkAaveBorrow(
                appState,
                _entity_id,
                tokenAddress
            )
        }

        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkAaveLPState.forkAaveLP.get(_entity_id);
        if (!data) {
            throw new Error("data not found");
        } let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
        let price = dataAssets?.price;
        if (!price) {
            throw new Error("price not found");
        }

        data.totalBorrowInUSD = BigNumber(data.totalBorrowInUSD || 0).plus(amount.multipliedBy(price)).toNumber();

        let dataWallet = appState.smartWalletState.forkedAaveLPState.get(_entity_id)!;
        if (dataWallet.dapps.length == 0) {
            let reserve: Reserve = {
                category: "Lending",
                healthFactor: Number(MAX_UINT256),
                deposit: new Array(),
                borrow: new Array()
            }

            let reserves: Array<Reserve> = new Array();
            reserves.push(reserve);

            let dapp: Dapp = {
                id: _entity_id,
                type: "token",
                value: 0,
                depositInUSD: 0,
                borrowInUSD: 0,
                claimable: 0,
                reserves: reserves
            }

            dataWallet.dapps.push(dapp)

        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: amount.toNumber(),
                valueInUSD: amount.multipliedBy(price).toNumber(),
                totalValue: amount.multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].reserves[0].borrow.push(newData);
        }
        else {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: amount.toNumber() + dataInWallet.amount,
                valueInUSD: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
                totalValue: amount.plus(dataInWallet.amount).multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).plus(amount).toNumber();
            dataWallet.dapps[0].borrowInUSD = BigNumber(dataWallet.dapps[0].borrowInUSD || 0).plus(amount.multipliedBy(price)).toNumber();
            dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.plus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState.smartWalletState.forkedAaveLPState.set(_entity_id, dataWallet);
        appState.forkAaveLPState.forkAaveLP.set(_entity_id, data!);

        return appState;
    } catch (err) {
        throw err;
    }
}


export async function SimulationRepayForkAaveLP(
    appState1: ApplicationState,
    _from: EthAddress,
    _entity_id: string,
    _tokenAddress: EthAddress,
    _amount: string
): Promise<ApplicationState> {
    try {
        let amount = BigNumber(_amount);
        let appState = { ...appState1 };
        if (appState.forkAaveLPState.forkAaveLP.get(_entity_id) == undefined) {
            appState = await updateForkAaveLPState(appState, _entity_id);
        }
        const tokenAddress = _tokenAddress.toLowerCase();
        let modeFrom = getMode(appState, _from);
        // Comming Soon .......
        if (amount.isEqualTo(MAX_UINT256)) {
            amount = calculateMaxAmountForkAaveRepay(appState, _entity_id, tokenAddress, _from);
        }

        if (!appState[modeFrom].tokenBalances.has(tokenAddress)) {
            appState = await updateUserTokenBalance(appState, tokenAddress);
        }

        const tokenAmount = BigNumber(
            appState[modeFrom].tokenBalances.get(tokenAddress)!
        );

        let data = appState.forkAaveLPState.forkAaveLP.get(_entity_id);
        if (!data) {
            throw new Error("data not found");
        }
        let dataAssets = data.markets[0].assets.find((asset) => asset.address == tokenAddress);
        let price = dataAssets?.price;
        if (!price) {
            throw new Error("price not found");
        }

        data.totalBorrowInUSD = BigNumber(data.totalBorrowInUSD || 0).minus(amount.multipliedBy(price)).toNumber();

        let dataWallet = appState.smartWalletState.forkedAaveLPState.get(_entity_id)!;
        if (dataWallet.dapps.length == 0) {
            let reserve: Reserve = {
                category: "Lending",
                healthFactor: Number(MAX_UINT256),
                deposit: new Array(),
                borrow: new Array()
            }

            let reserves: Array<Reserve> = new Array();
            reserves.push(reserve);

            let dapp: Dapp = {
                id: _entity_id,
                type: "token",
                value: 0,
                depositInUSD: 0,
                borrowInUSD: 0,
                claimable: 0,
                reserves: reserves
            }

            dataWallet.dapps.push(dapp)

        }

        let dataInWallet = dataWallet.dapps[0].reserves[0].borrow.find((reserve) => reserve.address == tokenAddress);
        if (!dataInWallet) {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: -amount.toNumber(),
                valueInUSD: -amount.multipliedBy(price).toNumber(),
                totalValue: -amount.multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].reserves[0].borrow.push(newData);
        }
        else {
            let newData: UserAsset = {
                id: dataAssets?.id || "",
                type: "token",
                address: tokenAddress,
                symbol: dataAssets?.symbol || "",
                amount: -amount.toNumber() + dataInWallet.amount,
                valueInUSD: BigNumber(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
                totalValue: BigNumber(dataInWallet.amount).minus(amount).multipliedBy(price).toNumber(),
            };
            dataWallet.dapps[0].value = BigNumber(dataWallet.dapps[0].value || 0).minus(amount).toNumber();
            dataWallet.dapps[0].borrowInUSD = BigNumber(dataWallet.dapps[0].borrowInUSD || 0).minus(amount.multipliedBy(price)).toNumber();
            dataWallet.dapps[0].reserves[0].borrow = dataWallet.dapps[0].reserves[0].borrow.map((reserve) => {
                if (reserve.address == tokenAddress) {
                    return newData;
                }
                return reserve;
            });
        }
        const newAmount = tokenAmount.minus(amount).toFixed(0);
        appState[modeFrom].tokenBalances.set(tokenAddress, newAmount);
        appState.smartWalletState.forkedAaveLPState.set(_entity_id, dataWallet);
        appState.forkAaveLPState.forkAaveLP.set(_entity_id, data!);

        return appState;
    } catch (err) {
        throw err;
    }
}