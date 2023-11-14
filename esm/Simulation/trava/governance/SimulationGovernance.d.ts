import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js";
import { EthAddress } from "../../../utils/types";
import { uint256 } from "trava-station-sdk";
export declare function getTimeLeft(time: uint256): number;
export declare function calcVotingPower(amount: uint256, timeRemaining: uint256, maxTime?: number): BigNumber;
export declare function getAmountInTrava(tokenBalance: uint256, increaseAmount: uint256, tokenRatio: uint256, claimedReward: uint256): BigNumber;
export declare function getPredictVotingPower(tokenBalance: uint256, increaseAmount: uint256, tokenRatio: uint256, claimedReward: uint256, timeEnd: uint256): BigNumber;
export declare function timeRemaining(_timeLock: BigNumber): BigNumber;
export declare function simulateTravaGovernanceCreateLock(_appState1: ApplicationState, _tokenAddress: EthAddress, _amount: uint256, _period: uint256, //second
_from: EthAddress, _to: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaGovernanceIncreaseBalance(appState1: ApplicationState, _tokenId: uint256, _amount: uint256, _from: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaGovernanceChangeUnlockTime(appState1: ApplicationState, _tokenId: uint256, _unlockTime: uint256): Promise<ApplicationState>;
export declare function simulateTravaGovernanceCompound(appState1: ApplicationState, _tokenId: uint256): Promise<ApplicationState>;
export declare function simulateTravaGovernanceWithdraw(appState1: ApplicationState, _tokenId: uint256, _to: EthAddress): Promise<ApplicationState>;
export declare function simulateTravaGovernanceMerge(appState1: ApplicationState, _tokenId1: uint256, _tokenId2: uint256, _from: EthAddress, _to: EthAddress): Promise<ApplicationState>;
