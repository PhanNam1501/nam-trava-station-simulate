# TRAVA SIMULATION ROUTE
# Table of contents
1. [Initialize state](#Initialize-state)
    + [Các action liên quan đến token](#các-action-liên-quan-đến-token)
    + [Các action liên quan đến Pools](#các-action-liên-quan-đến-pools-deposit-borrow-withdraw-repay)
    + [Các action liên quan đến NFT](#các-action-liên-qua-đến-nft)
2. [Simulate state](#Simulate-state)
    + [Simulate Utilities Actions](#simulate-utilities-actions)
    + [Simulate Trava Pools Actions](#simulate-trava-pools-actions)
    + [Simulate TravaNFT MarketPlace Actions](#simulate-trava-nft-marketplace)
    + [Simulate TravaNFT Utilities Actions](#simulate-trava-nft-utilities)
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
### Tương tác với các Marketplace
Update các armouries đang bán trên marketplace
```
appState4 = await updateSellingNFTFromContract(
    appState3
)
```
Update state của [trava token](#các-action-liên-quan-đến-token) như trên
```
appState5 = await updateUserTokenBalance(
    appState4,
    travaTokenAddress
)
```
# Simulate state
Sau khi init state xong. Với mỗi state, các simulate khác nhau
## Simulate Utilities actions
## Pull token
```
appState6 = await simulateSendToken(
    appState5,
    tokenAddress,
    to: smart wallet address,
    amount: number | string
)
```
## Sendtoken
```
appState7 = await simulateSendToken(
    appState6,
    tokenAddress,
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
)
```
# Simulate Trava Pools actions
## Deposit
```
appState11 = await SimulationSupply(
    appState10,
    tokenAddress,
    amount: string
)
```
## Borrow
```
appState12 = await SimulationBorrow(
    appState11,
    tokenAddress,
    amount: string
)
```
## Repay
get max amount:
```
maxAmount = appState.smartWalletState.detailTokenInPool[tokenAddress].tToken.balances
```
```
appState13 = await SimulationRepay(
    appState12,
    tokenAddress,
    amount: string
)
```
## Withdraw
```
appState14 = await SimulationWWithdraw(
    appState13,
    tokenAddress,
    amount
)
```
# Simulate Trava NFT Marketplace
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