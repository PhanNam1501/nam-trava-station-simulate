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
    - [Tương tác với các Marketplace](#tương-tác-với-các-marketplace)
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
- [Simulate Trava NFT Marketplace](#simulate-trava-nft-marketplace)
  - [Buy NFT](#buy-nft)
  - [Sell NFT](#sell-nft)
  - [Cancel order](#cancel-order)
- [Simulate Trava NFT Utilities](#simulate-trava-nft-utilities)
  - [Transfer armoury](#transfer-armoury)
  - [Transfer collection](#transfer-collection)
- [Get Max amount in Trava Lending Pool](#get-max-amount-in-trava-lending-pool)
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
# Get Max amount in Trava Lending Pool
```
const maxSupply = calculateMaxAmountSupply(
    appState: ApplicationState, 
    _tokenAddress: string, 
    mode: "walletState" | "smartWalletState"
    ).toFixed()
```
```
const maxBorrow = calculateMaxAmountBorrow(
    appState: ApplicationState, 
    _tokenAddress: string
    ).toFixed()
```
```
const maxRepay = calculateMaxAmountRepay(
    appState: ApplicationState, 
    _tokenAddress: string, 
    mode: "walletState" | "smartWalletState"
    ).toFixed()
```
```
const maxWithdraw = calculateMaxAmountWithdraw(
    appState: ApplicationState, 
    _tokenAddress: string, 
    mode: "walletState" | "smartWalletState"
    ).toFixed()
```
