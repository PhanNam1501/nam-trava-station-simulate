# TRAVA SIMULATION ROUTE
# Table of contents
- [TRAVA SIMULATION ROUTE](#trava-simulation-route)
- [Table of contents](#table-of-contents)
- [Initialize state](#initialize-state)
  - [Các action liên quan đến token](#các-action-liên-quan-đến-token)
  - [Các action liên quan đến pools: deposit, borrow, withdraw, repay](#các-action-liên-quan-đến-pools-deposit-borrow-withdraw-repay)
  - [Các action liên qua đến nft](#các-action-liên-qua-đến-nft)
    - [Tương tác với các mảnh armouries](#tương-tác-với-các-mảnh-armouries)
    - [Tương tác với các Knight](#tương-tác-với-các-knight)
    - [Tương tác với các Marketplace / Sell armoury](#tương-tác-với-các-marketplace--sell-armoury)
    - [Tương tác với các Marketplace / Auction](#tương-tác-với-các-marketplace--auction)
    - [Tuong tac voi Trava Staking](#tuong-tac-voi-trava-staking)
    - [Tuưng tác với Trava Governance](#tuưng-tác-với-trava-governance)
- [Simulate state](#simulate-state)
  - [Simulate Utilities actions](#simulate-utilities-actions)
  - [Pull token](#pull-token)
  - [Sendtoken](#sendtoken)
  - [Wrap](#wrap)
  - [Unwrap](#unwrap)
  - [Swap](#swap)
- [Simulate Trava Pools actions](#simulate-trava-pools-actions)
  - [Deposit](#deposit)
  - [Borrow](#borrow)
  - [Repay](#repay)
  - [Withdraw](#withdraw)
  - [ClaimRewards](#claimrewards)
  - [Convert rewards](#convert-rewards)
- [Simulate Trava NFT Marketplace / Sell armoury](#simulate-trava-nft-marketplace--sell-armoury)
  - [Buy NFT](#buy-nft)
  - [Sell NFT](#sell-nft)
  - [Cancel order](#cancel-order)
- [Simulate Trava NFT Marketplace / Auction](#simulate-trava-nft-marketplace--auction)
  - [Create Auction](#create-auction)
  - [Make edit auction price](#make-edit-auction-price)
  - [Make bid auction](#make-bid-auction)
  - [Make cancel auction](#make-cancel-auction)
  - [Fninalize auction](#fninalize-auction)
- [Simulate Trava NFT Utilities](#simulate-trava-nft-utilities)
  - [Transfer armoury](#transfer-armoury)
  - [Transfer collection](#transfer-collection)
- [Simulate Trava Staking](#simulate-trava-staking)
  - [Simulate Trava Staking Stake](#simulate-trava-staking-stake)
  - [Simulate Trava Staking Redeem (Withdraw)](#simulate-trava-staking-redeem-withdraw)
  - [Simulate Trava Staking Claim (Withdraw)](#simulate-trava-staking-claim-withdraw)
- [Simulate Trava Governance State](#simulate-trava-governance-state)
  - [Simulate Create Lock](#simulate-create-lock)
  - [Simulate Increase Balance](#simulate-increase-balance)
  - [Simulate Change unlock time](#simulate-change-unlock-time)
  - [Simulate Compound](#simulate-compound)
  - [Simulate Withdraw](#simulate-withdraw)
  - [Simulate Merge](#simulate-merge)
- [Simulate state](#simulate-state-1)
  - [Simulate Utilities actions](#simulate-utilities-actions-1)
  - [Pull token](#pull-token-1)
  - [Sendtoken](#sendtoken-1)
  - [Wrap](#wrap-1)
  - [Unwrap](#unwrap-1)
```
import { ApplicationState } from "../State/ApplicationState";

let chainId = Number((await provider.getNetwork()).chainId);

let appState = new ApplicationState(
    userAddress: String,
    smartWalletAddress: String,
    provider: JsonRpcProvider, // reader
    chainId: chainId
);
```
# Initialize state
## Các action liên quan đến token
Khi sử dụng đồng token nào, thì khởi tạo state về số dư của đồng token đó:
```
appState1 = await updateUserTokenBalance(
    appState,
    tokenAddress
)
```
Nếu sử dụng đồng BNB
```
appState2 = await updateUserEthBalance(
    appState1
)
```

## Các action liên quan đến pools: deposit, borrow, withdraw, repay
Khi sử dụng các action trong pools, thì thực hiện update state của user về pool này
```
appState3 = await updateTravaLPInfo(
    appState2,
    market
)
```
Khi gọi action supply và withdraw
```
appState31 = await updateLPtTokenInfo(
    appState3,
    tokenAddress
)
```
Khi gọi action borrow và repay
```
appState32 = await updateLPDebtTokenInfo(
    appState3,
    tokenAddress
)
```
Khi goi action claim rewards 
```
appState31 = await updateLPtTokenInfo(
    appState3,
    tokenAddress
)

init tokenBalance of rTrava in _to address
```
khi goi action convert rewards
```
appState31 = await updateLPtTokenInfo(
    appState3,
    tokenAddress
)
init rTrava balacne in _from address
init trava balance in _to address
```
## Các action liên qua đến nft
### Tương tác với các mảnh armouries
Update các armouries của main wallet
```
appState4 = await updateNFTBalanceFromContract(
    appState3,
    "walletState"
)
```
Update các armouries của smart wallet
```
appState4 = await updateNFTBalanceFromContract(
    appState3,
    "smartWalletState"
)
```
### Tương tác với các Knight
Update các Knight của main wallet
```
appState4 = await updateCollectionBalanceFromContract(
    appState3,
    "walletState"
)
```
Update các Knight của smart wallet
```
appState4 = await updateCollectionBalanceFromContract(
    appState3,
    "smartWalletState"
)
```
### Tương tác với các Marketplace / Sell armoury
Update các armouries đang bán trên marketplace
```
appState4 = await updateSellingNFTFromContract(
    appState3
)
// update nft mà user đang bán
appState41 = await updateOwnedSellingNFT(
    appState4
)
```
Update state của [trava token](#các-action-liên-quan-đến-token) như trên
```
appState5 = await updateUserTokenBalance(
    appState4,
    travaTokenAddress
)

```
Update các armouries mà user đang bán trên marketplace
```
appState5 = await updateOwnedSellingNFT(
    appState4
)
```
### Tương tác với các Marketplace / Auction
First,  update auctioning NFT From Contract when chose any action in Auction
```
appState = await updateAuctioningNFTFromContract(
    appState
)
```
**When create auction**,

First update Owned Auctioning NFT
```
appState = await updateOwnedAuctioningNFT(
    appState
)
```
Then, update collection of from wallet
```
appState = await updateCollectionBalanceFromContract(
    appState
)
```
**When make bid auction**,

update trava balance of from address 
```
appState = await updateUserTokenBalance(
    appState,
    travaTokenAddress
) 

appState = await updateUserEthBalance(
    appState
)

or

appState = await updateSmartWalletTokenBalance(
    appState,
    travaTokenAddress
) 

appState = await updateSmartWalletEthBalance(
    appState
)
```
**when edit auction price**

update Owned Auctioning NFT
```
appState = await updateOwnedAuctioningNFT(
    appState,
    from wallet state
)
```
**when cancel auction**

update Owned Auctioning NFT
```
appState = await updateOwnedAuctioningNFT(
    appState,
    from wallet state
)
```
Then, update collection of to wallet
```
appState = await updateCollectionBalanceFromContract(
    appState,
    to wallet state
)
```
**when finalize auction**
update Owned Auctioning NFT
if smartWallet is nftSeller, 

update Trava balance, BNB balance of to wallet
```
appState = await updateUserTokenBalance(
    appState,
    travaTokenAddress
) 

or

appState = await updateSmartWalletTokenBalance(
    appState,
    travaTokenAddress
) 
```
if smartWallet is bidder, 
```
appState = await updateCollectionBalanceFromContract(
    appState,
    to wallet state
)
```
### Tuong tac voi Trava Staking
Update state cua Smart Wallet trong cac vault
```
newAppState = await updateAllAccountVault(oldAppState)
```
```
Khi stake: update stakedToken balance for smart wallet, update underlyingToken balance for from address
Khi withdraw: update underlyingToken balance for "to" Address and Smart Wallet Address
Khi claimReward: update Trava balance for "to" address 
```
```
stakedPool = await newAppState.smartWalletState.travaLPStakingStateList.get(stakedTokenAdress.toLownerCase())

TVL = stakedPool.TVL
APR = stakedPool.APR
reward = stakedPool.claimableReward
deposited = stakedPool.deposited
```
### Tuưng tác với Trava Governance
Khi chon bat cu action nao cua Trava Governance, update TravaGovernanceState
```
appState = await updateTravaGovernanceState(appState);
```
Khi chon action Create Lock,  update Trava Governace State cua from address, to address, update bep20 balance of from address
```
appState = await updateUserLockBalance(appState, fromAddress)
appState = await updateUserLockBalance(appState, toAddress)
appState = /// update token balance cua from address
```
Khi chon action merge,  update Trava Governace State cua from address
```
appState = await updateUserLockBalance(appState, fromAddress)
```
Khi chon cac action :  coumpound, change unlock time, update Trava Governace State cua smart wallet address
```
appState = await updateUserLockBalance(appState, smartWalletAddress)
```
Khi chon cac action :  withdraw update Trava Governace State cua smart wallet address, update trava balance va token lock balance cua to address
```
appState = await updateUserLockBalance(appState, smartWalletAddress)
appState = /// update trava balance cua to address
appState = /// update token locked balance cua to address 
```
Khi chon action  increase balance, Trava Governace State cua smart wallet address, update token locked balance cua from address 
```
appState = // update token locked balance cua from address
```
# Simulate state
Sau khi init state xong. Với mỗi state, các simulate khác nhau
## Simulate Utilities actions
## Pull token
```
appState6 = await simulateSendToken(
    appState5,
    tokenAddress,
    from: wallet address
    to: smart wallet address,
    amount: number | string
)
```
## Sendtoken
```
appState7 = await simulateSendToken(
    appState6,
    tokenAddress,
    from: smart wallet address
    to: main wallet address,
    amount: number | string
)
```
## Wrap
```
appState8 = await simulateWrap(
    appState7,
    amount: number | string
)
```
## Unwrap
```
appState9 = await simulateUnwrap(
    appState8,
    amount: number | string
)
```
## Swap
```
appState10 = await simulateSwap(
    appState9,
    fromToken: token 1 address,
    toToken: token2 address,
    fromAmount: amount of token 1 will swap
    toAmount: amount of token 2 will receive
    fromAddress,
    toAddress
)
```
# Simulate Trava Pools actions
## Deposit
```
appState11 = await SimulationSupply(
    appState10,
    from,
    tokenAddress,
    amount: string
)
```
## Borrow
```
appState12 = await SimulationBorrow(
    appState11,
    to,
    tokenAddress,
    amount: string
)
```
## Repay
get max amount:
```
maxAmount = appState.smartWalletState.detailTokenInPool[tokenAddress].dToken.balances
```
```
appState13 = await SimulationRepay(
    appState12,
    from,
    tokenAddress,
    amount: string
)
```
## Withdraw
get max amount:
```
maxAmount = appState.smartWalletState.detailTokenInPool[tokenAddress].tToken.balances
```

```
appState14 = await SimulationWithdraw(
    appState13,
    to,
    tokenAddress,
    amount
)
```
## ClaimRewards
get max rewards:
```
claimableRewards = await calculateMaxRewards(appState);
```
```
appState15 = await SimulationClaimReward(
    appState14,
    to,
    MAX_UINT256
)
```

## Convert rewards
get max rTrava cua from address
```
maxRTrava = 
        app.walletState.tokenBalance.get(rTravaAddress.toLowerCase()) 
        or 
        app.smartWalletState.tokenBalance.get(rTravaAddress.toLowerCase())
```
```
appState16 = await SimulationConvertReward(
    appState15,
    from,
    to,
    MAX_UINT256
)
```
# Simulate Trava NFT Marketplace / Sell armoury
## Buy NFT
```
appState15 = await simulateTravaNFTBuy(
    appState14,
    tokenId,
    from, 
    to
)
```
## Sell NFT
```
appState16 = await simulateTravaNFTSell(
    appState15,
    tokenId,
    price: numer | String, 
    from: String
)
```
## Cancel order
```
appState17 = await simulateTravaNFTCancelSale(
    appState16,
    to,
    tokenId
)
```
# Simulate Trava NFT Marketplace / Auction
## Create Auction
```
appState = await simulateTravaNFTCreateAuction(
    appState,
    tokenId,
    startingBid,
    duration (ms),
    from
)
```
## Make edit auction price
```
appState = await simulateTravaNFTEditAuctionPrice(
    appState,
    tokenId,
    startingBid
)
```
## Make bid auction 
```
appState = await simulateTravaNFTMakeBidAuction(
    appState,
    tokenId,
    bidPrice,
    from
)
```
## Make cancel auction 
```
appState = await simulateTravaNFTCancelAuction(
    appState,
    tokenId,
    to
)
```
## Fninalize auction 
```
appState = await simulateTravaNFTFinalizeAuction(
    appState,
    tokenId,
    to
)
```
# Simulate Trava NFT Utilities
## Transfer armoury
```
appState18 = await simulateTravaNFTTransfer(
    appState17,
    from: address sender,
    to: address receiver,
    tokenId: nummber | string
    contract: NFT_CORE address
)
```
## Transfer collection
```
appState19 = await simulateTravaNFTTransfer(
    appState18,
    from: address sender,
    to: address receiver,
    tokenId: nummber | string
    contract: NFT_COLLECTION address
)
```
# Simulate Trava Staking
## Simulate Trava Staking Stake
```
maxAmount = fromState.getTokenBalanceOf(underlyingTokenAddress)

newAppState = await simulateStakeStaking(
    oldAppState,
    stakedTokenAddress,
    from,
    amount
)
```
## Simulate Trava Staking Redeem (Withdraw)
```
maxAmount = oldAppState.smartWalletState.travaLPStakingStateList.get(stakedTokenAddress.toLowerCase())!.deposited;
newAppState = await simulateStakingRedeem(
    oldAppState,
    stakedTokenAddress,
    to,
    amount
)
```
## Simulate Trava Staking Claim (Withdraw)
```
maxAmount = oldAppState.smartWalletState.travaLPStakingStateList.get(stakedTokenAddress.toLowerCase())!.claimableReward;

newAppState = await simulateStakingClaimRewards(
    oldAppState,
    stakedTokenAddress,
    to,
    maxAmount
)
```
# Simulate Trava Governance State
## Simulate Create Lock
```
newAppState = await simulateTravaGovernanceCreateLock(
    oldAppState,
    tokenId,
    amount,
    from,
    period
)
``` 
## Simulate Increase Balance
```
newAppState = await simulateTravaGovernanceIncreaseBalance(
    oldAppState,
    tokenId,
    amount,
    fromAddress,
    smartWalletAddress
)
```
## Simulate Change unlock time
```
newAppState = await simulateTravaGovernanceChangeUnlockTime(
    oldAppState,
    tokenId,
    newUnlockTime
)
```
## Simulate Compound
```
newAppState = await simulateTravaGovernanceCompound(
    oldAppState,
    tokenId
)
```
## Simulate Withdraw
```
newAppState = await simulateTravaGovernanceWithdraw(
    oldAppState,
    tokenId,
    to
)
```
## Simulate Merge
```
newAppState = await simulateTravaGovernanceMerge(
    oldAppState,
    tokenId1,
    tokenId2,
    from
)
```
# Simulate state
Sau khi init state xong. Với mỗi state, các simulate khác nhau
## Simulate Utilities actions
## Pull token
```
appState6 = await simulateSendTokenV2(
    appState5,
    tokenAddress,
    from: wallet address
    to: smart wallet address,
    amount: string,
    contractAddress: address of actions
)
```
## Sendtoken
```
appState7 = await simulateSendTokenV2(
    appState6,
    tokenAddress,
    from: smart wallet address
    to: main wallet address,
    amount: string,
    contractAddress: address of actions
)
```
## Wrap
```
appState8 = await simulateWrapV2(
    appState7,
    amount:  string,
    contractAddress: address of actions
)
```
## Unwrap
```
appState9 = await simulateUnwrapV2(
    appState8,
    amount:  string,
    contractAddress: address of actions
)
```