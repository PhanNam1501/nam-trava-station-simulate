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
import StakedTokenAbi from "../../abis/StakedToken.json";
import VestingTokenAbi from "../../abis/VestingTrava.json";
import { getAddr } from "../../utils/address";
import { listStakingVault } from "../../utils/stakingVaultConfig";
import { YEAR_TO_SECONDS } from "../../utils/config";
import BigNumber from "bignumber.js";
import MultiCallABI from "../../abis/Multicall.json";
import { updateSmartWalletTokenBalance } from "../basic/UpdateStateAccount";
export function updateAllAccountVault(appState1) {
    return __awaiter(this, void 0, void 0, function* () {
        const vaultConfigList = listStakingVault[appState1.chainId];
        let appState = Object.assign({}, appState1);
        let underlyingAddress = new Array;
        let priceUnderlyingAddress = new Array;
        let stakedTokenAddress = new Array;
        let rewardTokenAddress = new Array;
        for (let i = 0; i < vaultConfigList.length; i++) {
            underlyingAddress.push(vaultConfigList[i].underlyingAddress);
            priceUnderlyingAddress.push(vaultConfigList[i].priceUnderlyingAddress);
            stakedTokenAddress.push(vaultConfigList[i].stakedTokenAddress);
            rewardTokenAddress.push(vaultConfigList[i].rewardToken.address);
        }
        let [depositedDatas, TVLDatas,] = yield Promise.all([
            multiCall(StakedTokenAbi, stakedTokenAddress.map((address, _) => ({
                address: address,
                name: "balanceOf",
                params: [appState.smartWalletState.address],
            })), appState.web3, appState.chainId),
            multiCall(StakedTokenAbi, stakedTokenAddress.map((address, _) => ({
                address: address,
                name: "totalSupply",
                params: [],
            })), appState.web3, appState.chainId)
        ]);
        // let [underlyingTokenPriceDatas, rewardTokenPriceDatas] = await Promise.all([
        //   multiCall(
        //     OracleABI,
        //     priceUnderlyingAddress.map((address: string, _: number) => ({
        //       address: getAddr("ORACLE_ADDRESS", appState.chainId),
        //       name: "getAssetPrice",
        //       params: [address],
        //     })),
        //     appState.web3,
        //     appState.chainId
        //   ),
        //   multiCall(
        //     OracleABI,
        //     rewardTokenAddress.map((address: string, _: number) => ({
        //       address: getAddr("ORACLE_ADDRESS", appState.chainId),
        //       name: "getAssetPrice",
        //       params: [address],
        //     })),
        //     appState.web3,
        //     appState.chainId
        //   )
        // ]);
        for (let i = 0; i < vaultConfigList.length; i++) {
            let claimableReward = BigNumber(0);
            let eps = "0";
            if (vaultConfigList[i].id == "orai") {
                const vestingCR = new Contract(getAddr("VESTING_TRAVA_ADDRESS", appState.chainId), VestingTokenAbi, appState.web3);
                claimableReward = yield vestingCR.getClaimableReward(appState.smartWalletState.address, vaultConfigList[i].underlyingAddress);
                eps = "0.005549";
            }
            else {
                const stakedCR = new Contract(vaultConfigList[i].stakedTokenAddress, StakedTokenAbi, appState.web3);
                claimableReward = yield stakedCR.getTotalRewardsBalance(appState.smartWalletState.address);
                eps = BigNumber(yield stakedCR.getAssetEmissionPerSecond(vaultConfigList[i].stakedTokenAddress)).div(vaultConfigList[i].reserveDecimals).toFixed();
            }
            let stakedToken = {
                id: vaultConfigList[i].id,
                name: vaultConfigList[i].name,
                code: vaultConfigList[i].code,
                stakedTokenAddress: vaultConfigList[i].stakedTokenAddress,
                eps: eps,
                reserveDecimals: vaultConfigList[i].reserveDecimals
            };
            let underlyingToken = {
                underlyingAddress: vaultConfigList[i].underlyingAddress,
                reserveDecimals: vaultConfigList[i].reserveDecimals,
                price: "0" //underlyingTokenPriceDatas[i]
            };
            let rewardToken = {
                address: vaultConfigList[i].rewardToken.address,
                decimals: vaultConfigList[i].rewardToken.decimals,
                price: "0", // rewardTokenPriceDatas[i]
            };
            let TVL = BigNumber(TVLDatas[i]).div(underlyingToken.reserveDecimals).multipliedBy(underlyingToken.price);
            let APR = BigNumber(eps).multipliedBy(rewardToken.price).multipliedBy(YEAR_TO_SECONDS).div(TVL).div(100);
            if (APR.isNaN()) {
                APR = BigNumber(0);
            }
            let accountVaults = {
                claimable: vaultConfigList[i].claimable,
                claimableReward: claimableReward.toString(),
                deposited: depositedDatas[i].toString(),
                TVL: TVL.toFixed(),
                APR: APR.toFixed(),
                underlyingToken: underlyingToken,
                stakedToken: stakedToken,
                rewardToken: rewardToken
            };
            appState.smartWalletState.travaLPStakingStateList.set(vaultConfigList[i].stakedTokenAddress.toLowerCase(), accountVaults);
            if (!appState.smartWalletState.tokenBalances.has(vaultConfigList[i].stakedTokenAddress.toLowerCase())) {
                appState = yield updateSmartWalletTokenBalance(appState, vaultConfigList[i].stakedTokenAddress.toLowerCase());
            }
        }
        return appState;
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
