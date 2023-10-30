import { ApplicationState } from "../../../State/ApplicationState";
import BigNumber from "bignumber.js";
import { getAddr } from "../../../utils/address";
import { DAY_TO_SECONDS, HOUR_TO_SECONDS, WEEK_TO_SECONDS, YEAR_TO_SECONDS } from "../../../utils/config";
import { LockBalance, RewardTokenData, TokenInGovernance } from "../../../State/TravaGovenanceState";



export async function simulateGovernanceCreateLock(
    appState1: ApplicationState,
    tokenAddress: string,
    amount: string,
    from: string,
    period: string, //second
  ): Promise<ApplicationState> {
    try {
      const appState = { ...appState1 };
    
        if (from == appState.walletState.address) {
        let travaBalance = appState.walletState.tokenBalances.get(tokenAddress) ?? "0";
        appState.walletState.tokenBalances.set(
            tokenAddress,
            BigNumber(travaBalance).minus(amount).toFixed(0)
        );
        }
        if (from == appState.smartWalletState.address) {
        let travaBalance =
            appState.smartWalletState.tokenBalances.get(tokenAddress) ?? 0;
        appState.smartWalletState.tokenBalances.set(
            tokenAddress,
            BigNumber(travaBalance).minus(amount).toFixed(0)
        );
        }
        let amount1 = BigNumber(amount).multipliedBy(10**18);
        let period1 = BigNumber(timeRemaining(BigNumber(period)));
        let votingPower = (amount1.multipliedBy(period1).dividedBy(YEAR_TO_SECONDS*4)).integerValue();
        let newId = (Number(getMaxKeyFromMap(appState.smartWalletState.travaGovenanceState))+1).toString();//check lai
        // init reward
        let rewardTokenData: RewardTokenData = {
            address: '0xce9f0487f07988003f511d6651153a6dacc32f50',
            compoundAbleRewards: "0",
            compoundedRewards: "0",
            balances: "0",
            decimals: "18",
        }

        let tokenInGovernance: TokenInGovernance = {
            address: tokenAddress.toLowerCase(),
            balances: amount1.toString(),
            decimals: "18",
          }

        let lockBalance: LockBalance = {
            id: newId,
            votingPower: votingPower.toString(),
            tokenInGovernance: tokenInGovernance,
            unlockTime: (BigNumber(period).plus(Math.floor(new Date().getTime() / 1000))).toString(),
            reward: rewardTokenData,
          }
          appState.smartWalletState.travaGovenanceState.set(newId, lockBalance);

        //   let currentVersion: "v1" | "v2" = "v1";
        //   let currentNFT: ArmouryType | undefined = undefined;
        //   if (from == appState.walletState.address) {
        //     currentNFT = appState.walletState.nfts.v1[tokenId];
        //     if (!currentNFT) {
        //       currentNFT = appState.walletState.nfts.v2[tokenId];
        //       currentVersion = "v2";
        //     }
        //     delete appState.walletState.nfts[currentVersion][tokenId];
        //   } else {
        //     currentNFT = appState.smartWalletState.nfts.v1[tokenId];
        //     if (!currentNFT) {
        //       currentNFT = appState.smartWalletState.nfts.v2[tokenId];
        //       currentVersion = "v2";
        //     }
        //     delete appState.smartWalletState.nfts[currentVersion][tokenId];
        //   }
    
        //   const collectionId = parseInt(currentNFT.version);
        //   const collectionName = CollectionName[collectionId - 1];
        //   const data: SellingArmouryType = {
        //     id: currentNFT.tokenId,
        //     collectionName,
        //     collectionId,
        //     nRarity: currentNFT.nRarity,
        //     nType: currentNFT.nType,
        //     rarity: currentNFT.rarity.toString(),
        //     type: currentNFT.type.toString(),
        //     exp: currentNFT.exp,
        //     price: price,
        //     seller: appState.smartWalletState.address,
        //   };
        //   appState.NFTSellingState[currentVersion].push(data);
        //   appState.smartWalletState.sellingNFT[currentVersion].push(data);

        return appState;
    } catch (err) {
      throw err;
    }
  }

function timeRemaining(timeLock: BigNumber) {
    const now = Math.floor(new Date().getTime() / 1000);
    let _timeLock = BigNumber(timeLock);
    if (_timeLock.isEqualTo(BigNumber(WEEK_TO_SECONDS))) {
        _timeLock = _timeLock.multipliedBy(2);
    }
    return BigNumber(roundDown(now + Number(_timeLock)) - now);
};

function roundDown(timestamp: number) { 
// thứ năm gần nhất
    const thursday = Math.floor(timestamp / WEEK_TO_SECONDS) * WEEK_TO_SECONDS; 
    const dt = 5 * DAY_TO_SECONDS + 15 * HOUR_TO_SECONDS; 
    if (thursday + dt < timestamp) return thursday + dt; 
    else return thursday - WEEK_TO_SECONDS + dt; 
}

function getMaxKeyFromMap(map: Map<string, any>): string | undefined {
    let maxKey = "0";

    for (const [key] of map) {
        if (parseInt(key) > parseInt(maxKey)) {
            maxKey = key;
        }
    }

    return maxKey;
}