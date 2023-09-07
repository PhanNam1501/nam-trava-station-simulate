var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Contract, Interface } from "ethers";
import ABITravaLP from "../../abis/TravaLendingPool.json";
import IncentiveContractABI from "../../abis/IncentiveContract.json";
import BEP20ABI from "../../abis/BEP20.json";
import { convertHexStringToAddress, getAddr } from "../../utils/address";
import MultiCallABI from "../../abis/Multicall.json";
export function updateLPtTokenInfo(appState1, _tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            const travaLP = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            let reverseList = yield travaLP.getReservesList();
            let tokenAddress = convertHexStringToAddress(_tokenAddress);
            let tokenAddressState = tokenAddress.toLowerCase();
            if (reverseList.includes(tokenAddress) &&
                !appState.smartWalletState.detailTokenInPool.has(tokenAddressState)) {
                // get reserve data
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                const tTokenAddress = String(reserveData[6]).toLowerCase();
                // get amount
                const tTokenContract = new Contract(tTokenAddress, BEP20ABI, appState.web3);
                const tTokenBalance = yield tTokenContract.balanceOf(appState.smartWalletState.address);
                appState.smartWalletState.detailTokenInPool =
                    appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
                        tToken: {
                            address: tTokenAddress.toLowerCase(),
                            balances: tTokenBalance.toString(),
                        },
                        dToken: {
                            address: "",
                            balances: "",
                        },
                    });
            }
            else if (reverseList.includes(tokenAddress) &&
                appState.smartWalletState.detailTokenInPool.has(tokenAddressState)) {
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                const tTokenAddress = String(reserveData[6]).toLowerCase();
                // get amount
                const tTokenContract = new Contract(tTokenAddress, BEP20ABI, appState.web3);
                const tTokenBalance = yield tTokenContract.balanceOf(appState.smartWalletState.address);
                let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddressState);
                tokenInfo.tToken = {
                    address: tTokenAddress.toLowerCase(),
                    balances: tTokenBalance.toString(),
                };
                appState.smartWalletState.detailTokenInPool.set(tokenAddressState, tokenInfo);
            }
            else {
                throw new Error(`Can't update info of LP tToken ${tokenAddress}`);
            }
            return appState;
        }
        catch (error) {
            throw new Error("Can't update LP tToken info !");
        }
    });
}
export function updateLPDebtTokenInfo(appState1, _tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            const travaLP = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            let reverseList = yield travaLP.getReservesList();
            let tokenAddress = convertHexStringToAddress(_tokenAddress);
            let tokenAddressState = tokenAddress.toLowerCase();
            if (reverseList.includes(tokenAddress) &&
                !appState.smartWalletState.detailTokenInPool.has(tokenAddressState)) {
                // get reserve data
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();
                // get amount
                const debtTokenContract = new Contract(variableDebtTokenAddress, BEP20ABI, appState.web3);
                const debtTokenBalance = yield debtTokenContract.balanceOf(appState.smartWalletState.address);
                appState.smartWalletState.detailTokenInPool =
                    appState.smartWalletState.detailTokenInPool.set(tokenAddressState, {
                        dToken: {
                            address: variableDebtTokenAddress.toLowerCase(),
                            balances: debtTokenBalance.toString(),
                        },
                        tToken: {
                            address: "",
                            balances: "",
                        },
                    });
            }
            else if (reverseList.includes(tokenAddress) &&
                appState.smartWalletState.detailTokenInPool.has(tokenAddressState)) {
                const reserveData = yield travaLP.getReserveData(tokenAddress);
                // token address
                const variableDebtTokenAddress = String(reserveData[7]).toLowerCase();
                // get amount
                const debtTokenContract = new Contract(variableDebtTokenAddress, BEP20ABI, appState.web3);
                const debtTokenBalance = yield debtTokenContract.balanceOf(appState.smartWalletState.address);
                let tokenInfo = appState.smartWalletState.detailTokenInPool.get(tokenAddressState);
                tokenInfo.dToken = {
                    address: variableDebtTokenAddress.toLowerCase(),
                    balances: debtTokenBalance.toString(),
                };
                appState.smartWalletState.detailTokenInPool.set(tokenAddressState, tokenInfo);
            }
            else {
                throw new Error(`Can't update info of LP Debt Token ${tokenAddress}`);
            }
            return appState;
        }
        catch (error) {
            throw new Error("Can't update LP Debt Token info !");
        }
    });
}
// call this before all actions
export function updateTravaLPInfo(appState1, userAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const appState = Object.assign({}, appState1);
        try {
            // first update token in pool balances
            const TravaLendingPool = new Contract(getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId), ABITravaLP, appState.web3);
            const reserveAddressList = yield TravaLendingPool.getReservesList();
            if (reserveAddressList.length == 0) {
                throw new Error("No reserve in TravaLP");
            }
            // update balance for wallet
            for (let i = 0; i < reserveAddressList.length; i++) {
                // update token balance for wallet
                let reserveAddress = reserveAddressList[i];
                const reserve = new Contract(reserveAddress, BEP20ABI, appState.web3);
                reserveAddress = String(reserveAddress).toLowerCase();
                if (String(appState.walletState.tokenBalances.get(reserveAddress)) ==
                    "undefined") {
                    const balance = yield reserve.balanceOf(userAddress);
                    appState.walletState.tokenBalances.set(reserveAddress, balance);
                }
                if (String(appState.smartWalletState.tokenBalances.get(reserveAddress)) ==
                    "undefined") {
                    // update token balance for smart wallet
                    const smartWalletBalance = yield reserve.balanceOf(appState.smartWalletState.address);
                    appState.smartWalletState.tokenBalances.set(reserveAddress, smartWalletBalance);
                }
            }
            // second update TravaLP state for wallet
            const userData = yield TravaLendingPool.getUserAccountData(userAddress);
            // update appState for wallet
            appState.walletState.travaLPState.totalCollateralUSD =
                userData.totalCollateralUSD;
            appState.walletState.travaLPState.totalDebtUSD = userData.totalDebtUSD;
            appState.walletState.travaLPState.availableBorrowsUSD =
                userData.availableBorrowsUSD;
            appState.walletState.travaLPState.currentLiquidationThreshold =
                userData.currentLiquidationThreshold;
            appState.walletState.travaLPState.healthFactor = userData.healthFactor;
            appState.walletState.travaLPState.ltv = userData.ltv;
            // third update TravaLP state for smart wallet
            const smartWalletData = yield TravaLendingPool.getUserAccountData(appState.smartWalletState.address);
            // update appState for smart wallet
            appState.smartWalletState.travaLPState.totalCollateralUSD =
                smartWalletData.totalCollateralUSD;
            appState.smartWalletState.travaLPState.totalDebtUSD =
                smartWalletData.totalDebtUSD;
            appState.smartWalletState.travaLPState.availableBorrowsUSD =
                smartWalletData.availableBorrowsUSD;
            appState.smartWalletState.travaLPState.currentLiquidationThreshold =
                smartWalletData.currentLiquidationThreshold;
            appState.smartWalletState.travaLPState.healthFactor =
                smartWalletData.healthFactor;
            appState.smartWalletState.travaLPState.ltv = smartWalletData.ltv;
            return appState;
        }
        catch (e) {
            console.log(e);
            return appState1;
        }
    });
}
const multiCall = (abi, calls, provider, chainId) => __awaiter(void 0, void 0, void 0, function* () {
    let _provider = provider;
    const multi = new Contract(getAddr("MULTI_CALL_ADDRESS", chainId), MultiCallABI, _provider);
    const itf = new Interface(abi);
    const callData = calls.map((call) => [
        call.address.toLowerCase(),
        itf.encodeFunctionData(call.name, call.params),
    ]);
    const { returnData } = yield multi.aggregate(callData);
    return returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
});
// export async function updateListToken(
//   appState1: ApplicationState,
// ) {
//   try {
//     const appState = { ...appState1 };
//     const travaLP = new Contract(
//       getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
//       ABITravaLP,
//       appState.web3!
//     );
//     let reverseList = await travaLP.getReservesList();
//     reverseList = reverseList.map((e: string) => e.toLowerCase());
//     let [reserveData] = await Promise.all([
//       multiCall(
//         ABITravaLP,
//         reverseList.map((address: string, _: number) => ({
//           address: getAddr("TRAVA_LENDING_POOL_MARKET", appState.chainId),
//           name: 'getReserveData',
//           params: [address],
//         })),
//         appState.web3,
//         appState.chainId
//       ),
//     ]);
//     reserveData = reserveData.flat();
//     let tTokenList = [] as Array<string>;
//     let dTokenList = [] as Array<string>;
//     for(const r of reserveData) {
//       tTokenList.push(r[6]);
//       dTokenList.push(r[7]);
//     }
//     let [balanceTList] = await Promise.all([
//       multiCall(
//         BEP20ABI,
//         tTokenList.map((address: string, _: number) => ({
//           address: address,
//           name: 'balanceOf',
//           params: [appState.smartWalletState.address],
//         })),
//         appState.web3,
//         appState.chainId
//       ),
//     ]);
//     balanceTList = balanceTList.flat();
//     let [balanceDList] = await Promise.all([
//       multiCall(
//         BEP20ABI,
//         dTokenList.map((address: string, _: number) => ({
//           address: address,
//           name: 'balanceOf',
//           params: [appState.smartWalletState.address],
//         })),
//         appState.web3,
//         appState.chainId
//       ),
//     ]);
//     balanceDList = balanceDList.flat();
//     let [maxRewardCanGets] = await Promise.all([
//       multiCall(
//         IncentiveContractABI,
//         reverseList.map((address: string, index: number) => ({
//           address: getAddr("INCENTIVE_CONTRACT", appState.chainId),
//           name: 'getRewardsBalance',
//           params: [[tTokenList[index], dTokenList[index]], appState.smartWalletState.address],
//         })),
//         appState.web3,
//         appState.chainId
//       ),
//     ]);
//     maxRewardCanGets = maxRewardCanGets.flat();
//     appState.smartWalletState.detailTokenInPool = new Map();
//     let counter = 0;
//     for(const token of reverseList) {
//       if(balanceDList[counter] > 0 || balanceTList[counter] > 0) {
//         appState.smartWalletState.detailTokenInPool = appState.smartWalletState.detailTokenInPool.set(
//           token, 
//           {
//             tToken: {
//               address: tTokenList[counter].toLowerCase(),
//               balances: balanceTList[counter].toString(),
//             },
//             dToken: {
//               address: dTokenList[counter].toLowerCase(),
//               balances: balanceDList[counter].toString(),
//             },
//             maxRewardCanGet: maxRewardCanGets[counter].toString()
//           }
//         );
//       }
//       counter++;
//     }
//     return appState;
//   } catch (error) {
//     throw new Error("Can't update LP tToken info !");
//   }
// }
export function updateRTravaAndTravaForReward(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appState = Object.assign({}, appState1);
            const incentiveContract = new Contract(getAddr("INCENTIVE_CONTRACT", appState.chainId), IncentiveContractABI, appState.web3);
            const rTravaAddress = yield incentiveContract.REWARD_TOKEN();
            const rTravaContract = new Contract(rTravaAddress, BEP20ABI, appState.web3);
            const rTravaBalance = yield rTravaContract.balanceOf(appState.smartWalletState.address);
            const travaContract = new Contract(getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId), BEP20ABI, appState.web3);
            const travaBalance = yield travaContract.balanceOf(appState.smartWalletState.address);
            const travaBalance2 = yield travaContract.balanceOf(appState.walletState.address);
            appState.smartWalletState.tokenBalances.set(getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase(), travaBalance.toString());
            appState.walletState.tokenBalances.set(getAddr("TRAVA_TOKEN_IN_MARKET", appState.chainId).toLowerCase(), travaBalance2.toString());
            appState.smartWalletState.tokenBalances.set(String(rTravaAddress).toLowerCase(), rTravaBalance.toString());
            return appState;
        }
        catch (error) {
            throw new Error("Can't update LP tToken info !");
        }
    });
}
