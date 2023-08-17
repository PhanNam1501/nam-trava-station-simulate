(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ethers"), require("@zennomi/tokens"));
	else if(typeof define === 'function' && define.amd)
		define(["ethers", "@zennomi/tokens"], factory);
	else if(typeof exports === 'object')
		exports["trava-station-simulation"] = factory(require("ethers"), require("@zennomi/tokens"));
	else
		root["trava-station-simulation"] = factory(root["ethers"], root["@zennomi/tokens"]);
})(this, (__WEBPACK_EXTERNAL_MODULE__11__, __WEBPACK_EXTERNAL_MODULE__14__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppState: () => (/* reexport module object */ _ApplicationState__WEBPACK_IMPORTED_MODULE_0__)
/* harmony export */ });
/* harmony import */ var _ApplicationState__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);



/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApplicationState: () => (/* binding */ ApplicationState)
/* harmony export */ });
/* harmony import */ var _WalletState__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _SmartWalletState__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _NFTState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }



class ApplicationState {
  constructor(userAddress, smartWalletAddress, web3) {
    _defineProperty(this, "walletState", void 0);
    _defineProperty(this, "smartWalletState", void 0);
    _defineProperty(this, "NFTState", void 0);
    _defineProperty(this, "web3", void 0);
    this.walletState = new _WalletState__WEBPACK_IMPORTED_MODULE_0__.WalletState(userAddress);
    this.smartWalletState = new _SmartWalletState__WEBPACK_IMPORTED_MODULE_1__.SmartWalletState(smartWalletAddress);
    this.NFTState = new _NFTState__WEBPACK_IMPORTED_MODULE_2__.NFTState();
    this.web3 = web3;
  }
}

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NFT: () => (/* binding */ NFT),
/* harmony export */   NFTData: () => (/* binding */ NFTData),
/* harmony export */   WalletState: () => (/* binding */ WalletState)
/* harmony export */ });
/* harmony import */ var _TravaDeFiState__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

class NFTData {
  constructor() {
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "data", void 0);
    this.id = '0';
    this.data = {};
  }
}
class NFT {
  constructor() {
    _defineProperty(this, "v1", void 0);
    _defineProperty(this, "v2", void 0);
    this.v1 = new Array();
    this.v2 = new Array();
  }
}
class WalletState {
  constructor(address) {
    _defineProperty(this, "address", void 0);
    _defineProperty(this, "tokenBalances", void 0);
    _defineProperty(this, "nfts", void 0);
    _defineProperty(this, "collection", void 0);
    _defineProperty(this, "travaLPState", void 0);
    _defineProperty(this, "ethBalances", void 0);
    this.address = address;
    this.tokenBalances = new Map();
    this.nfts = new NFT();
    this.travaLPState = new _TravaDeFiState__WEBPACK_IMPORTED_MODULE_0__.WalletTravaLPState();
    this.collection = new NFT();
    this.ethBalances = "0";
  }

  // async getTokenAmount(tokenAddress: string): Promise<string> {
  //   // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
  //   if (this.tokenBalances.length > 0) {
  //     // check tokenAddress is exist on appState.walletState.tokenBalances
  //     for (let i = 0; i < this.tokenBalances.length; i++) {
  //       // console.log(appState.walletState.tokenBalances[i].has(tokenAddress));
  //       if (this.tokenBalances[i].has(tokenAddress)) {
  //         return this.tokenBalances[i].get(tokenAddress)!;
  //       }
  //     }
  //   }
  //   return "0";
  // }

  // // get tokenBalances based on tokenAddress
  // async getTokenBalances(tokenAddress: string): Promise<any> {
  //   // find tokenAddress in tokenBalances
  //   for (let i = 0; i < this.tokenBalances.length; i++) {
  //     if (this.tokenBalances[i].has(tokenAddress)) {
  //       return this.tokenBalances[i];
  //     }
  //   }
  //   return null;
  // }
}

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TravaLPState: () => (/* binding */ TravaLPState),
/* harmony export */   WalletTravaLPState: () => (/* binding */ WalletTravaLPState)
/* harmony export */ });
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 *
 * @param
 * @param
 */
class WalletTravaLPState {
  //

  constructor() {
    _defineProperty(this, "totalCollateralUSD", void 0);
    // USD
    _defineProperty(this, "totalDebtUSD", void 0);
    // USD
    _defineProperty(this, "availableBorrowsUSD", void 0);
    // USD
    _defineProperty(this, "currentLiquidationThreshold", void 0);
    //
    _defineProperty(this, "ltv", void 0);
    //
    _defineProperty(this, "healthFactor", void 0);
    this.totalCollateralUSD = "";
    this.totalDebtUSD = "";
    this.availableBorrowsUSD = "";
    this.currentLiquidationThreshold = "";
    this.ltv = "";
    this.healthFactor = "";
  }
}
class TravaLPState {}

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SmartWalletState: () => (/* binding */ SmartWalletState)
/* harmony export */ });
/* harmony import */ var _TravaDeFiState__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _WalletState__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }


class SmartWalletState {
  constructor(address) {
    _defineProperty(this, "address", void 0);
    _defineProperty(this, "tokenBalances", void 0);
    _defineProperty(this, "nfts", void 0);
    _defineProperty(this, "collection", void 0);
    _defineProperty(this, "travaLPState", void 0);
    _defineProperty(this, "ethBalances", void 0);
    this.address = address;
    this.tokenBalances = new Map();
    this.nfts = new _WalletState__WEBPACK_IMPORTED_MODULE_1__.NFT();
    this.travaLPState = new _TravaDeFiState__WEBPACK_IMPORTED_MODULE_0__.WalletTravaLPState();
    this.collection = new _WalletState__WEBPACK_IMPORTED_MODULE_1__.NFT();
    this.ethBalances = "0";
  }

  // async getTokenAmount(tokenAddress: string): Promise<string> {
  //   // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>
  //   if (this.tokenBalances.length > 0) {
  //     // check tokenAddress is exist on appState.walletState.tokenBalances
  //     for (let i = 0; i < this.tokenBalances.length; i++) {
  //       // console.log(appState.walletState.tokenBalances[i].has(tokenAddress));
  //       if (this.tokenBalances[i].has(tokenAddress)) {
  //         return this.tokenBalances[i].get(tokenAddress)!;
  //       }
  //     }
  //   }
  //   return "0";
  // }

  // async getTokenBalances(tokenAddress: string): Promise<any> {
  //   // find tokenAddress in tokenBalances
  //   for (let i = 0; i < this.tokenBalances.length; i++) {
  //     if (this.tokenBalances[i].has(tokenAddress)) {
  //       return this.tokenBalances[i];
  //     }
  //   }
  //   return null;
  // }
}

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NFT: () => (/* binding */ NFT),
/* harmony export */   NFTData: () => (/* binding */ NFTData),
/* harmony export */   NFTState: () => (/* binding */ NFTState)
/* harmony export */ });
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class NFTData {
  constructor() {
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "data", void 0);
    this.id = '0';
    this.data = {
      price: "0",
      seller: "0x0000000000000000000000000000000000000000"
    };
  }
}
class NFT {
  constructor() {
    _defineProperty(this, "v1", void 0);
    _defineProperty(this, "v2", void 0);
    this.v1 = new Array();
    this.v2 = new Array();
  }
}
class NFTState {
  constructor() {
    _defineProperty(this, "nfts", void 0);
    this.nfts = new NFT();
  }
}

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SimulationBorrow: () => (/* reexport safe */ _market_SimulationWalletTravaLP__WEBPACK_IMPORTED_MODULE_2__.SimulationBorrow),
/* harmony export */   SimulationRepay: () => (/* reexport safe */ _market_SimulationWalletTravaLP__WEBPACK_IMPORTED_MODULE_2__.SimulationRepay),
/* harmony export */   SimulationSupply: () => (/* reexport safe */ _market_SimulationWalletTravaLP__WEBPACK_IMPORTED_MODULE_2__.SimulationSupply),
/* harmony export */   SimulationWithdraw: () => (/* reexport safe */ _market_SimulationWalletTravaLP__WEBPACK_IMPORTED_MODULE_2__.SimulationWithdraw),
/* harmony export */   simulateSendToken: () => (/* reexport safe */ _basic_SimulationBasic__WEBPACK_IMPORTED_MODULE_0__.simulateSendToken),
/* harmony export */   simulateSwap: () => (/* reexport safe */ _swap_SimulationSwap__WEBPACK_IMPORTED_MODULE_5__.simulateSwap),
/* harmony export */   simulateTravaNFTBuy: () => (/* reexport safe */ _nft_SimulationTravaNFT__WEBPACK_IMPORTED_MODULE_3__.simulateTravaNFTBuy),
/* harmony export */   simulateTravaNFTSell: () => (/* reexport safe */ _nft_SimulationTravaNFT__WEBPACK_IMPORTED_MODULE_3__.simulateTravaNFTSell),
/* harmony export */   simulateTravaNFTTransfer: () => (/* reexport safe */ _nft_SimulationTravaNFT__WEBPACK_IMPORTED_MODULE_3__.simulateTravaNFTTransfer),
/* harmony export */   simulateUnwrap: () => (/* reexport safe */ _basic_SimulationBasic__WEBPACK_IMPORTED_MODULE_0__.simulateUnwrap),
/* harmony export */   simulateWrap: () => (/* reexport safe */ _basic_SimulationBasic__WEBPACK_IMPORTED_MODULE_0__.simulateWrap),
/* harmony export */   updateNFTBalance: () => (/* reexport safe */ _nft_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_4__.updateNFTBalance),
/* harmony export */   updateNFTState: () => (/* reexport safe */ _nft_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_4__.updateNFTState),
/* harmony export */   updateSmartWalletEthBalance: () => (/* reexport safe */ _basic_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_1__.updateSmartWalletEthBalance),
/* harmony export */   updateSmartWalletTokenBalance: () => (/* reexport safe */ _basic_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_1__.updateSmartWalletTokenBalance),
/* harmony export */   updateTravaBalance: () => (/* reexport safe */ _nft_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_4__.updateTravaBalance),
/* harmony export */   updateUserEthBalance: () => (/* reexport safe */ _basic_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_1__.updateUserEthBalance),
/* harmony export */   updateUserTokenBalance: () => (/* reexport safe */ _basic_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_1__.updateUserTokenBalance)
/* harmony export */ });
/* harmony import */ var _basic_SimulationBasic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _basic_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _market_SimulationWalletTravaLP__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(15);
/* harmony import */ var _nft_SimulationTravaNFT__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(21);
/* harmony import */ var _nft_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(22);
/* harmony import */ var _swap_SimulationSwap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(27);








/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   simulateSendToken: () => (/* binding */ simulateSendToken),
/* harmony export */   simulateUnwrap: () => (/* binding */ simulateUnwrap),
/* harmony export */   simulateWrap: () => (/* binding */ simulateWrap)
/* harmony export */ });
/* harmony import */ var _UpdateStateAccount__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _utils_address__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }


function simulateWrap(_x, _x2) {
  return _simulateWrap.apply(this, arguments);
}
function _simulateWrap() {
  _simulateWrap = _asyncToGenerator(function* (appState1, amount) {
    var appState = _objectSpread({}, appState1);
    if (!appState.smartWalletState.tokenBalances.has((0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"))) {
      yield (0,_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_0__.updateSmartWalletTokenBalance)(appState, (0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"));
    }
    if (BigInt(appState.walletState.ethBalances) < BigInt(amount)) {
      throw new Error("Not enough BNB");
    }
    var newEthBalance = BigInt(appState.walletState.ethBalances) - BigInt(amount);
    var newWBNBBalance = BigInt(appState.smartWalletState.tokenBalances.get((0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"))) + BigInt(amount);
    appState.walletState.ethBalances = String(newEthBalance);
    appState.smartWalletState.tokenBalances.set((0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"), String(BigInt(newWBNBBalance)));
    return appState;
  });
  return _simulateWrap.apply(this, arguments);
}
function simulateUnwrap(_x3, _x4) {
  return _simulateUnwrap.apply(this, arguments);
}
function _simulateUnwrap() {
  _simulateUnwrap = _asyncToGenerator(function* (appState1, amount) {
    var appState = _objectSpread({}, appState1);
    if (!appState.walletState.tokenBalances.has((0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"))) {
      yield (0,_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_0__.updateUserTokenBalance)(appState, (0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"));
    }
    if (BigInt(appState.walletState.tokenBalances.get((0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"))) < BigInt(amount)) {
      throw new Error("Not enough WBNB");
    }
    var newWBNBBalance = BigInt(appState.walletState.tokenBalances.get((0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"))) - BigInt(amount);
    var newBNBBalance = BigInt(appState.walletState.ethBalances) + BigInt(amount);
    appState.walletState.tokenBalances.set((0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"), String(newWBNBBalance));
    appState.walletState.ethBalances = String(newBNBBalance);
    return appState;
  });
  return _simulateUnwrap.apply(this, arguments);
}
function simulateSendToken(_x5, _x6, _x7, _x8) {
  return _simulateSendToken.apply(this, arguments);
}
function _simulateSendToken() {
  _simulateSendToken = _asyncToGenerator(function* (appState1, tokenAddress, to, amount) {
    var appState = _objectSpread({}, appState1);
    if (!appState.walletState.tokenBalances.has((0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"))) {
      yield (0,_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_0__.updateUserTokenBalance)(appState, (0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"));
    }
    if (!appState.smartWalletState.tokenBalances.has((0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"))) {
      yield (0,_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_0__.updateSmartWalletTokenBalance)(appState, (0,_utils_address__WEBPACK_IMPORTED_MODULE_1__.getAddr)("WBNB_ADDRESS"));
    }
    if (BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)) < BigInt(amount)) {
      throw new Error("Not enough Balance");
    }
    var newTokenBalance = BigInt(appState.smartWalletState.tokenBalances.get(tokenAddress)) - BigInt(amount);
    appState.smartWalletState.tokenBalances.set(tokenAddress, String(newTokenBalance));
    if (to == appState.walletState.address) {
      var newUserTokenBalance = BigInt(appState.walletState.tokenBalances.get(tokenAddress)) + BigInt(amount);
      appState.walletState.tokenBalances.set(tokenAddress, String(newUserTokenBalance));
    }
    return appState;
  });
  return _simulateSendToken.apply(this, arguments);
}

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   updateSmartWalletEthBalance: () => (/* binding */ updateSmartWalletEthBalance),
/* harmony export */   updateSmartWalletTokenBalance: () => (/* binding */ updateSmartWalletTokenBalance),
/* harmony export */   updateUserEthBalance: () => (/* binding */ updateUserEthBalance),
/* harmony export */   updateUserTokenBalance: () => (/* binding */ updateUserTokenBalance)
/* harmony export */ });
/* harmony import */ var _abis_ERC20Mock_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ethers__WEBPACK_IMPORTED_MODULE_1__);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }


function updateUserEthBalance(_x) {
  return _updateUserEthBalance.apply(this, arguments);
}
function _updateUserEthBalance() {
  _updateUserEthBalance = _asyncToGenerator(function* (appState1) {
    var _appState$web;
    var appState = _objectSpread({}, appState1);
    appState.walletState.ethBalances = String(yield (_appState$web = appState.web3) === null || _appState$web === void 0 ? void 0 : _appState$web.getBalance(appState.walletState.address));
    return appState;
  });
  return _updateUserEthBalance.apply(this, arguments);
}
function updateSmartWalletEthBalance(_x2) {
  return _updateSmartWalletEthBalance.apply(this, arguments);
}
function _updateSmartWalletEthBalance() {
  _updateSmartWalletEthBalance = _asyncToGenerator(function* (appState1) {
    var appState = _objectSpread({}, appState1);
    appState.smartWalletState.ethBalances = String(yield appState.web3.getBalance(appState.smartWalletState.address));
    return appState;
  });
  return _updateSmartWalletEthBalance.apply(this, arguments);
}
function updateUserTokenBalance(_x3, _x4) {
  return _updateUserTokenBalance.apply(this, arguments);
}
function _updateUserTokenBalance() {
  _updateUserTokenBalance = _asyncToGenerator(function* (appState1, address) {
    var appState = _objectSpread({}, appState1);
    var TokenContract = new ethers__WEBPACK_IMPORTED_MODULE_1__.Contract(address, _abis_ERC20Mock_json__WEBPACK_IMPORTED_MODULE_0__, appState.web3);
    var balance = String(yield TokenContract.balanceOf(appState.walletState.address));
    appState.walletState.tokenBalances.set(address, balance);
    return appState;
  });
  return _updateUserTokenBalance.apply(this, arguments);
}
function updateSmartWalletTokenBalance(_x5, _x6) {
  return _updateSmartWalletTokenBalance.apply(this, arguments);
}
function _updateSmartWalletTokenBalance() {
  _updateSmartWalletTokenBalance = _asyncToGenerator(function* (appState1, address) {
    var appState = _objectSpread({}, appState1);
    var TokenContract = new ethers__WEBPACK_IMPORTED_MODULE_1__.Contract(address, _abis_ERC20Mock_json__WEBPACK_IMPORTED_MODULE_0__, appState.web3);
    var balance = String(yield TokenContract.balanceOf(appState.walletState.address));
    appState.smartWalletState.tokenBalances.set(address, balance);
    return appState;
  });
  return _updateSmartWalletTokenBalance.apply(this, arguments);
}

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = JSON.parse('[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]');

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__11__;

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getAddr: () => (/* binding */ getAddr),
/* harmony export */   listAddr: () => (/* binding */ listAddr)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);

var listAddr = {
  [_config__WEBPACK_IMPORTED_MODULE_0__.NETWORKS.bsc.chainId]: {
    TRAVA_LENDING_POOL_MARKET: "0x6df52f798740504c24ccd374cf7ce81b28ce8330",
    ORACLE_ADDRESS: "0x3e2320C81FdB8919bC5771CBA897B9C683506140",
    TRAVA_TOKEN_IN_MARKET: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
    NFT_CORE_ADDRESS: "0xd2Eca5a421db7c2e2aC88Da684214B52915A66b3",
    MULTI_CALL_ADDRESS: "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78",
    NFT_SELL_ADDRESS: "0xf5804062c93b0C725e277F772b5DA06749005cd5",
    NFT_MANAGER_ADDRESS: "0xA91A365D2e3D280553E96D5afA157e6A3e50890A",
    NFT_COLLECTION_ADDRESS: "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1",
    WBNB_ADDRESS: "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
    TRAVA_TOKEN: "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37"
  }
};
var getAddr = function getAddr(name) {
  var chainId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _config__WEBPACK_IMPORTED_MODULE_0__.CONFIG.chainId;
  var _chainId = typeof chainId === 'undefined' ? _config__WEBPACK_IMPORTED_MODULE_0__.CONFIG.chainId : chainId;
  var addr = listAddr[_chainId];

  // skip this check if we're in testing mode
  if (!_config__WEBPACK_IMPORTED_MODULE_0__.CONFIG.testingMode) {
    if (!addr) throw new Error("Cannot find address for chainId: ".concat(_chainId, "."));
    if (!addr[name]) throw new Error("Cannot find address for name: ".concat(name, " (chainId: ").concat(_chainId, ")."));
  }
  if (addr[name]) return addr[name];else throw new Error("Invalid addr");
};

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONFIG: () => (/* binding */ CONFIG),
/* harmony export */   CONTRACT_NETWORK: () => (/* binding */ CONTRACT_NETWORK),
/* harmony export */   NETWORKS: () => (/* binding */ NETWORKS),
/* harmony export */   configure: () => (/* binding */ configure),
/* harmony export */   getNetworkData: () => (/* binding */ getNetworkData)
/* harmony export */ });
/* harmony import */ var _zennomi_tokens__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);
/* harmony import */ var _zennomi_tokens__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_zennomi_tokens__WEBPACK_IMPORTED_MODULE_0__);

/**
 *
 * @type {Networks}
 */
var NETWORKS = {
  bsc: {
    chainId: 97,
    chainName: "Binance Smart Chain Testnet",
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
    iconUrls: [],
    rpcUrls: [],
    nativeCurrency: {
      name: "BNB",
      decimals: 18,
      symbol: "BNB"
    }
  }
};

/**
 *
 */
var CONFIG = {
  chainId: NETWORKS.bsc.chainId,
  testingMode: false
};

/**
 *
 * @param chainId
 */
var getNetworkData = chainId => {
  var networkData = Object.values(NETWORKS).find(network => network.chainId === +chainId);
  if (!networkData) throw new Error("Cannot find network data for chainId: ".concat(chainId));
  return networkData;
};

/**
 *
 * @param config
 */
var configure = config => {
  if (!config || typeof config !== "object") throw new Error("Object expected");
  var newKeys = Object.keys(config);
  newKeys.forEach(key => {
    CONFIG[key] = config[key];
    if (key === "chainId") (0,_zennomi_tokens__WEBPACK_IMPORTED_MODULE_0__.set)("network", config[key]);
  });
};
var CONTRACT_NETWORK = {
  bsc: {
    WBNB: "0x910CB19698Eac48a6AB7Ccc9542B756f2Bdd67C6",
    TRAVA_LENDING_POOL_MARKET: ["0x6df52f798740504c24ccd374cf7ce81b28ce8330"],
    ORACLE_ADDRESS: "0x3e2320C81FdB8919bC5771CBA897B9C683506140",
    TRAVA_TOKEN_IN_MARKET: "0xE1F005623934D3D8C724EC68Cc9bFD95498D4435",
    MULTI_CALL_ADDRESS: "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78",
    NFT_CORE_ADDRESS: "0xd2Eca5a421db7c2e2aC88Da684214B52915A66b3",
    NFT_MARKETPLACE: "0xf5804062c93b0C725e277F772b5DA06749005cd5",
    NFT_MANAGER: "0xA91A365D2e3D280553E96D5afA157e6A3e50890A",
    NFT_COLLECTION: "0x5D996eC57756cEB127a4eD3302d7F28F52FDEbb1",
    TRAVA_TOKEN: "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37"
  }
};

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__14__;

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SimulationBorrow: () => (/* binding */ SimulationBorrow),
/* harmony export */   SimulationRepay: () => (/* binding */ SimulationRepay),
/* harmony export */   SimulationSupply: () => (/* binding */ SimulationSupply),
/* harmony export */   SimulationWithdraw: () => (/* binding */ SimulationWithdraw)
/* harmony export */ });
/* harmony import */ var _utils_oraclePrice__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(16);
/* harmony import */ var _abis_TravaLendingPool_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(19);
/* harmony import */ var _abis_BEP20_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(20);
/* harmony import */ var _utils_address__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11);
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(ethers__WEBPACK_IMPORTED_MODULE_4__);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }





function SimulationSupply(_x, _x2, _x3) {
  return _SimulationSupply.apply(this, arguments);
}

// need add debt token to smart wallet state
function _SimulationSupply() {
  _SimulationSupply = _asyncToGenerator(function* (appState1, tokenAddress, amount) {
    try {
      var appState = _objectSpread({}, appState1);
      var oraclePrice = new _utils_oraclePrice__WEBPACK_IMPORTED_MODULE_0__["default"]((0,_utils_address__WEBPACK_IMPORTED_MODULE_3__.getAddr)("ORACLE_ADDRESS"), appState.web3);
      var travaLP = new ethers__WEBPACK_IMPORTED_MODULE_4__.Contract((0,_utils_address__WEBPACK_IMPORTED_MODULE_3__.getAddr)("TRAVA_LENDING_POOL_MARKET"), _abis_TravaLendingPool_json__WEBPACK_IMPORTED_MODULE_1__, appState.web3);
      var reverseList = yield travaLP.getReservesList();
      // check tokenAddress is exist on reverseList
      if (reverseList.includes(tokenAddress) && appState.walletState.tokenBalances.has(tokenAddress)) {
        // check tokenAddress:string is exist on appState.walletState.tokenBalances : Array<Map<string, string>>

        // get tToken address
        var reserveData = yield travaLP.getReserveData(tokenAddress);
        var tToken = reserveData[6];

        // get token amount
        var tokenAmount = BigInt(appState.walletState.tokenBalances.get(tokenAddress));

        // check amount tokenName on appState is enough .Before check convert string to number
        if (BigInt(tokenAmount) >= BigInt(amount)) {
          // update appState amount tokenName
          var newAmount = String(tokenAmount - BigInt(amount));
          appState.walletState.tokenBalances.set(tokenAddress, newAmount);

          // update state of smart wallet trava lp

          // update availableBorrowUSD . (deposited + amount * asset.price) * ltv - borrowed
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) * BigInt(10 ** 18) + BigInt(amount) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) * BigInt(appState.smartWalletState.travaLPState.ltv) - BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) * BigInt(10 ** 24)) / BigInt(10 ** 22));

          // update healthFactor .((deposited + amount * asset.price) * currentLiquidationThreshold) / borrowe
          // if totalDebtUSD = 0  , not update healthFactor
          if (appState.smartWalletState.travaLPState.totalDebtUSD != "0") {
            appState.smartWalletState.travaLPState.healthFactor = String((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) * BigInt(10 ** 18) + BigInt(amount) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) * BigInt(appState.smartWalletState.travaLPState.currentLiquidationThreshold) / BigInt(appState.smartWalletState.travaLPState.totalDebtUSD));
          } else {
            // healthFactor = MaxUint256
            appState.smartWalletState.travaLPState.healthFactor = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
          }

          // update totalCollateralUSD. deposited + amount * asset.price
          appState.smartWalletState.travaLPState.totalCollateralUSD = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) + BigInt(amount) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress)) / BigInt(10 ** 18));
        } else {
          throw new Error("Amount ".concat(tokenAddress, " on appState is not enough."));
        }

        // add tToken to smart wallet state if not exist
        if (!appState.smartWalletState.tokenBalances.has(tToken)) {
          appState.smartWalletState.tokenBalances.set(tToken, String(amount));
          console.log("added tToken to smart wallet state", appState.smartWalletState.tokenBalances.get(tToken));
        } else {
          // update tToken balance of smart wallet
          appState.smartWalletState.tokenBalances.set(tToken, String(BigInt(appState.smartWalletState.tokenBalances.get(tToken)) + BigInt(amount)));
        }
        return appState;
      } else {
        throw new Error("Account or LP does not have ".concat(tokenAddress, " token."));
      }
    } catch (err) {
      throw err;
    }
  });
  return _SimulationSupply.apply(this, arguments);
}
function SimulationBorrow(_x4, _x5, _x6) {
  return _SimulationBorrow.apply(this, arguments);
}

// need remove debt token from smart wallet state
function _SimulationBorrow() {
  _SimulationBorrow = _asyncToGenerator(function* (appState1, tokenAddress, amount) {
    try {
      var appState = _objectSpread({}, appState1);
      var oraclePrice = new _utils_oraclePrice__WEBPACK_IMPORTED_MODULE_0__["default"]((0,_utils_address__WEBPACK_IMPORTED_MODULE_3__.getAddr)("ORACLE_ADDRESS"), appState.web3);
      var travaLP = new ethers__WEBPACK_IMPORTED_MODULE_4__.Contract((0,_utils_address__WEBPACK_IMPORTED_MODULE_3__.getAddr)("TRAVA_LENDING_POOL_MARKET"), _abis_TravaLendingPool_json__WEBPACK_IMPORTED_MODULE_1__, appState.web3);
      var reverseList = yield travaLP.getReservesList();

      // check tokenAddress is exist on reverseList
      if (reverseList.includes(tokenAddress) && appState.walletState.tokenBalances.has(tokenAddress)) {
        // get tToken address
        var reserveData = yield travaLP.getReserveData(tokenAddress);
        var debToken = reserveData[7];

        // get token amount
        var tokenAmount = BigInt(appState.walletState.tokenBalances.get(tokenAddress));

        // get token price
        var tokenPrice = BigInt(yield oraclePrice.getAssetPrice(tokenAddress));
        var borrowUSD = BigInt(amount) * BigInt(tokenPrice) / BigInt(10 ** 18);

        // check availableBorrowUSD on appState is enough .Before check convert string to number
        if (BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) >= borrowUSD) {
          // when borrowUSD is enough , update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

          // update availableBorrowUSD :  deposited * ltv - borrowed - amount * asset.price
          appState.smartWalletState.travaLPState.availableBorrowsUSD = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) * BigInt(appState.smartWalletState.travaLPState.ltv) - BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) * BigInt(10 ** 4)) * BigInt(10 ** 14) - BigInt(amount) * BigInt(tokenPrice)) / BigInt(10 ** 18));

          // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed + amount * asset.price)
          appState.smartWalletState.travaLPState.healthFactor = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) * BigInt(appState.smartWalletState.travaLPState.currentLiquidationThreshold) * BigInt(10 ** 32) / (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) * BigInt(10 ** 18) + BigInt(amount) * BigInt(tokenPrice)));

          // update totalDebtUSD : borrowed + amount * asset.price
          appState.smartWalletState.travaLPState.totalDebtUSD = String(BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) + borrowUSD);
        } else {
          throw new Error("Amount borrow USD volume for token ".concat(tokenAddress, " is too much."));
        }

        // add debToken to smart wallet state if not exist
        if (!appState.smartWalletState.tokenBalances.has(debToken)) {
          appState.smartWalletState.tokenBalances.set(debToken, String(amount));
        } else {
          // update tToken balance of smart wallet
          appState.smartWalletState.tokenBalances.set(debToken, String(BigInt(appState.smartWalletState.tokenBalances.get(debToken)) + BigInt(amount)));
        }
        return appState;
      } else {
        throw new Error("Account or LP does not have ".concat(tokenAddress, " token or token is not exist in reverseList."));
      }
    } catch (err) {
      throw err;
    }
  });
  return _SimulationBorrow.apply(this, arguments);
}
function SimulationRepay(_x7, _x8, _x9) {
  return _SimulationRepay.apply(this, arguments);
}

// need remove tToken from smart wallet state
function _SimulationRepay() {
  _SimulationRepay = _asyncToGenerator(function* (appState1, tokenAddress, amount) {
    try {
      var appState = _objectSpread({}, appState1);
      var oraclePrice = new _utils_oraclePrice__WEBPACK_IMPORTED_MODULE_0__["default"]((0,_utils_address__WEBPACK_IMPORTED_MODULE_3__.getAddr)("ORACLE_ADDRESS"), appState.web3);
      var travaLP = new ethers__WEBPACK_IMPORTED_MODULE_4__.Contract((0,_utils_address__WEBPACK_IMPORTED_MODULE_3__.getAddr)("TRAVA_LENDING_POOL_MARKET"), _abis_TravaLendingPool_json__WEBPACK_IMPORTED_MODULE_1__, appState.web3);
      var reverseList = yield travaLP.getReservesList();
      // check tokenAddress is exist on reverseList
      if (reverseList.includes(tokenAddress) && appState.smartWalletState.tokenBalances.has(tokenAddress)) {
        // get reserve data
        var reserveData = yield travaLP.getReserveData(tokenAddress);

        // token address
        var tTokenAddress = reserveData[6];
        var variableDebtTokenAddress = reserveData[7];

        // check balance debt token on smart wallet

        var debtTokenBalance = new ethers__WEBPACK_IMPORTED_MODULE_4__.Contract(variableDebtTokenAddress, _abis_BEP20_json__WEBPACK_IMPORTED_MODULE_2__, appState.web3);

        // const debtTokenBalanceOfSmartWallet = await debtTokenBalance.balanceOf(
        //   appState.smartWalletState.address
        // );

        // get balance debt token of smart wallet in state
        var debtTokenBalanceOfSmartWallet = appState.smartWalletState.tokenBalances.get(variableDebtTokenAddress);
        if (debtTokenBalanceOfSmartWallet == "0") {
          throw new Error("Smart wallet does not borrow ".concat(tokenAddress, " token."));
        } else {
          if (BigInt(debtTokenBalanceOfSmartWallet) > BigInt(amount)) {
            // repay piece of borrowed token

            // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

            // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed - amount * asset.price)
            appState.smartWalletState.travaLPState.healthFactor = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) * BigInt(appState.smartWalletState.travaLPState.currentLiquidationThreshold) * BigInt(10 ** 32) / (BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) * BigInt(10 ** 18) - BigInt(amount) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))));

            // update availableBorrowUSD :  availableBorrowsUSD + amount * asset.price
            appState.smartWalletState.travaLPState.availableBorrowsUSD = String((BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) * BigInt(10 ** 18) + BigInt(amount) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) / BigInt(10 ** 18));

            // update totalDebtUSD : borrowed - amount * asset.price
            appState.smartWalletState.travaLPState.totalDebtUSD = String((BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) * BigInt(10 ** 18) - BigInt(amount) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) / BigInt(10 ** 18));

            // set debt token balance to debtTokenBalanceOfSmartWallet - amount
            appState.smartWalletState.tokenBalances.set(variableDebtTokenAddress, String(BigInt(debtTokenBalanceOfSmartWallet) - BigInt(amount)));
          } else if (BigInt(amount) >= BigInt(debtTokenBalanceOfSmartWallet)) {
            // repay all borrowed token

            // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

            // update availableBorrowUSD :  availableBorrowsUSD + debtTokenBalance * asset.price
            appState.smartWalletState.travaLPState.availableBorrowsUSD = String((BigInt(appState.smartWalletState.travaLPState.availableBorrowsUSD) * BigInt(10 ** 18) + BigInt(debtTokenBalanceOfSmartWallet) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) / BigInt(10 ** 18));

            // update healthFactor :(deposited * currentLiquidationThreshold) / (borrowed - debtTokenBalance * asset.price)

            appState.smartWalletState.travaLPState.healthFactor = String("115792089237316195423570985008687907853269984665640564039457584007913129639935");

            // update totalDebtUSD : borrowed - debtTokenBalance * asset.price
            appState.smartWalletState.travaLPState.totalDebtUSD = String((BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) * BigInt(10 ** 18) - BigInt(debtTokenBalanceOfSmartWallet) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) / BigInt(10 ** 18));

            // set debt token balance to 0
            appState.smartWalletState.tokenBalances.set(variableDebtTokenAddress, "0");
          }
        }
        return appState;
      } else {
        throw new Error("Token ".concat(tokenAddress, " is not exist in reverseList or smart wallet does not have ").concat(tokenAddress, " token."));
      }
    } catch (err) {
      throw err;
    }
  });
  return _SimulationRepay.apply(this, arguments);
}
function SimulationWithdraw(_x10, _x11, _x12) {
  return _SimulationWithdraw.apply(this, arguments);
}
function _SimulationWithdraw() {
  _SimulationWithdraw = _asyncToGenerator(function* (appState1, tokenAddress, amount) {
    try {
      var appState = _objectSpread({}, appState1);
      var oraclePrice = new _utils_oraclePrice__WEBPACK_IMPORTED_MODULE_0__["default"]((0,_utils_address__WEBPACK_IMPORTED_MODULE_3__.getAddr)("ORACLE_ADDRESS"), appState.web3);
      var travaLP = new ethers__WEBPACK_IMPORTED_MODULE_4__.Contract((0,_utils_address__WEBPACK_IMPORTED_MODULE_3__.getAddr)("TRAVA_LENDING_POOL_MARKET"), _abis_TravaLendingPool_json__WEBPACK_IMPORTED_MODULE_1__, appState.web3);
      var reverseList = yield travaLP.getReservesList();
      // check tokenAddress is exist on reverseList
      if (reverseList.includes(tokenAddress) && appState.smartWalletState.tokenBalances.has(tokenAddress)) {
        // get reserve data
        var reserveData = yield travaLP.getReserveData(tokenAddress);

        // token address
        var tTokenAddress = reserveData[6];
        var variableDebtTokenAddress = reserveData[7];

        // check balance tToken on smart wallet
        var tTokenBalance = new ethers__WEBPACK_IMPORTED_MODULE_4__.Contract(tTokenAddress, _abis_BEP20_json__WEBPACK_IMPORTED_MODULE_2__, appState.web3);
        var tTokenBalanceOfSmartWallet = String(appState.smartWalletState.tokenBalances.get(tTokenAddress));
        if (tTokenBalanceOfSmartWallet == "0") {
          throw new Error("Smart wallet does not supply ".concat(tokenAddress, " token."));
        } else {
          if (BigInt(tTokenBalanceOfSmartWallet) > BigInt(amount)) {
            console.log("Withdraw piece of supplied token");
            // withdraw piece of supplied token

            // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

            // update availableBorrowUSD : (deposited - amount * asset.price) * ltv - borrowed
            appState.smartWalletState.travaLPState.availableBorrowsUSD = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) * BigInt(10 ** 18) - BigInt(amount) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) * BigInt(appState.smartWalletState.travaLPState.ltv) - BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) * BigInt(10 ** 24)) / BigInt(10 ** 22));

            // update healthFactor :((deposited - amount * asset.price) * currentLiquidationThreshold) / borrowed
            if (appState.smartWalletState.travaLPState.totalDebtUSD != "0") {
              appState.smartWalletState.travaLPState.healthFactor = String(appState.smartWalletState.travaLPState.healthFactor = String((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) * BigInt(10 ** 18) - BigInt(tTokenBalanceOfSmartWallet) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) * BigInt(appState.smartWalletState.travaLPState.currentLiquidationThreshold) / BigInt(appState.smartWalletState.travaLPState.totalDebtUSD)));
            } else {
              // healthFactor = MaxUint256
              // need check this
              appState.smartWalletState.travaLPState.healthFactor = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
            }

            // update totalCollateralUSD. deposited - amount * asset.price
            appState.smartWalletState.travaLPState.totalCollateralUSD = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) - BigInt(amount) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress)) / BigInt(10 ** 18));

            // set tToken balance to tTokenBalanceOfSmartWallet - amount
            appState.smartWalletState.tokenBalances.set(tTokenAddress, String(BigInt(tTokenBalanceOfSmartWallet) - BigInt(amount)));
          } else if (BigInt(amount) >= BigInt(tTokenBalanceOfSmartWallet)) {
            console.log("withdraw all supplied token");
            // withdraw all supplied token

            // update state for smart wallet in travaLP state ( availableBorrowUSD , totalDebtUSD , healthFactor)

            // update availableBorrowUSD : (deposited - amount * asset.price) * ltv - borrowed
            appState.smartWalletState.travaLPState.availableBorrowsUSD = String(((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) * BigInt(10 ** 18) - BigInt(amount) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) * BigInt(appState.smartWalletState.travaLPState.ltv) - BigInt(appState.smartWalletState.travaLPState.totalDebtUSD) * BigInt(10 ** 24)) / BigInt(10 ** 22));

            // update healthFactor :((deposited - amount * asset.price) * currentLiquidationThreshold) / borrowed
            if (appState.smartWalletState.travaLPState.totalDebtUSD != "0") {
              appState.smartWalletState.travaLPState.healthFactor = String(appState.smartWalletState.travaLPState.healthFactor = String((BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) * BigInt(10 ** 18) - BigInt(tTokenBalanceOfSmartWallet) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress))) * BigInt(appState.smartWalletState.travaLPState.currentLiquidationThreshold) / BigInt(appState.smartWalletState.travaLPState.totalDebtUSD)));
            } else {
              // healthFactor = MaxUint256
              // need check this
              appState.smartWalletState.travaLPState.healthFactor = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
            }

            // update totalCollateralUSD. deposited - amount * asset.price
            appState.smartWalletState.travaLPState.totalCollateralUSD = String(BigInt(appState.smartWalletState.travaLPState.totalCollateralUSD) - BigInt(tTokenBalanceOfSmartWallet) * BigInt(yield oraclePrice.getAssetPrice(tokenAddress)) / BigInt(10 ** 18));
            // set tToken balance to 0
            appState.smartWalletState.tokenBalances.set(tTokenAddress, "0");
          }
        }
        return appState;
      } else {
        throw new Error("Token ".concat(tokenAddress, " is not exist in reverseList or smart wallet does not have ").concat(tokenAddress, " token."));
      }
    } catch (err) {
      throw err;
    }
  });
  return _SimulationWithdraw.apply(this, arguments);
}

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ OraclePrice)
/* harmony export */ });
/* harmony import */ var _abis_AaveOracle_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(17);
/* harmony import */ var _contract__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(18);
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }


class OraclePrice extends _contract__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(address, web3Reader) {
    super(address, _abis_AaveOracle_json__WEBPACK_IMPORTED_MODULE_0__, web3Reader);
  }
  getAssetPrice(assetAddress) {
    var _this = this;
    return _asyncToGenerator(function* () {
      return yield _this.contractUtil.getAssetPrice(assetAddress);
    })();
  }
}

// const oracleContract = new OracleContract(process.env.ORACLE_ADDRESS!);
// oracleContract.getAssetPrice(process.env.TRAVA_TOKEN_IN_MARKET!).then((res) => {
//   console.log(res.toString());
// });

/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = JSON.parse('[{"inputs":[{"internalType":"address[]","name":"assets","type":"address[]"},{"internalType":"address[]","name":"sources","type":"address[]"},{"internalType":"address","name":"fallbackOracle","type":"address"},{"internalType":"address","name":"weth","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":true,"internalType":"address","name":"source","type":"address"}],"name":"AssetSourceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"fallbackOracle","type":"address"}],"name":"FallbackOracleUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"weth","type":"address"}],"name":"WethSet","type":"event"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"getAssetPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"assets","type":"address[]"}],"name":"getAssetsPrices","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFallbackOracle","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"getSourceOfAsset","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"assets","type":"address[]"},{"internalType":"address[]","name":"sources","type":"address[]"}],"name":"setAssetSources","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"fallbackOracle","type":"address"}],"name":"setFallbackOracle","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]');

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BaseReadContract)
/* harmony export */ });
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(ethers__WEBPACK_IMPORTED_MODULE_0__);
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

class BaseReadContract {
  constructor(contractAddress, abi, web3Reader) {
    _defineProperty(this, "contractAddress", void 0);
    _defineProperty(this, "web3Reader", void 0);
    _defineProperty(this, "abi", void 0);
    _defineProperty(this, "contractUtil", void 0);
    this.contractAddress = contractAddress;
    this.web3Reader = web3Reader;
    this.abi = abi;
    this.contractUtil = new ethers__WEBPACK_IMPORTED_MODULE_0__.Contract(contractAddress, abi, web3Reader);
  }
}

/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"reserve","type":"address"},{"indexed":false,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"onBehalfOf","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"borrowRate","type":"uint256"},{"indexed":true,"internalType":"uint16","name":"referral","type":"uint16"}],"name":"Borrow","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"reserve","type":"address"},{"indexed":false,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"onBehalfOf","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"uint16","name":"referral","type":"uint16"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"collateralAsset","type":"address"},{"indexed":true,"internalType":"address","name":"debtAsset","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"debtToCover","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"liquidatedCollateralAmount","type":"uint256"},{"indexed":false,"internalType":"address","name":"liquidator","type":"address"},{"indexed":false,"internalType":"bool","name":"receiveTToken","type":"bool"}],"name":"LiquidationCall","type":"event"},{"anonymous":false,"inputs":[],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"reserve","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"repayer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Repay","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"reserve","type":"address"},{"indexed":false,"internalType":"uint256","name":"liquidityRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"stableBorrowRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"variableBorrowRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"liquidityIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"variableBorrowIndex","type":"uint256"}],"name":"ReserveDataUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"reserve","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"ReserveUsedAsCollateralDisabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"reserve","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"ReserveUsedAsCollateralEnabled","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"reserve","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint16","name":"referralCode","type":"uint16"},{"internalType":"address","name":"onBehalfOf","type":"address"}],"name":"borrow","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"onBehalfOf","type":"address"},{"internalType":"uint16","name":"referralCode","type":"uint16"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"balanceFromBefore","type":"uint256"},{"internalType":"uint256","name":"balanceToBefore","type":"uint256"}],"name":"finalizeTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAddressesProvider","outputs":[{"internalType":"contract IAddressesProviderFactory","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"getConfiguration","outputs":[{"components":[{"internalType":"uint256","name":"data","type":"uint256"}],"internalType":"struct DataTypes.ReserveConfigurationMap","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"getReserveData","outputs":[{"components":[{"components":[{"internalType":"uint256","name":"data","type":"uint256"}],"internalType":"struct DataTypes.ReserveConfigurationMap","name":"configuration","type":"tuple"},{"internalType":"uint128","name":"liquidityIndex","type":"uint128"},{"internalType":"uint128","name":"variableBorrowIndex","type":"uint128"},{"internalType":"uint128","name":"currentLiquidityRate","type":"uint128"},{"internalType":"uint128","name":"currentVariableBorrowRate","type":"uint128"},{"internalType":"uint40","name":"lastUpdateTimestamp","type":"uint40"},{"internalType":"address","name":"tTokenAddress","type":"address"},{"internalType":"address","name":"variableDebtTokenAddress","type":"address"},{"internalType":"address","name":"interestRateStrategyAddress","type":"address"},{"internalType":"uint8","name":"id","type":"uint8"}],"internalType":"struct DataTypes.ReserveData","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"getReserveNormalizedIncome","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"getReserveNormalizedVariableDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getReservesList","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserAccountData","outputs":[{"internalType":"uint256","name":"totalCollateralUSD","type":"uint256"},{"internalType":"uint256","name":"totalDebtUSD","type":"uint256"},{"internalType":"uint256","name":"availableBorrowsUSD","type":"uint256"},{"internalType":"uint256","name":"currentLiquidationThreshold","type":"uint256"},{"internalType":"uint256","name":"ltv","type":"uint256"},{"internalType":"uint256","name":"healthFactor","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"address","name":"tTokenAddress","type":"address"},{"internalType":"address","name":"variableDebtTokenAddress","type":"address"},{"internalType":"address","name":"reserveInterestRateStrategyAddress","type":"address"}],"name":"initReserve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IAddressesProviderFactory","name":"provider","type":"address"},{"internalType":"uint256","name":"providerId","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"collateralAsset","type":"address"},{"internalType":"address","name":"debtAsset","type":"address"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"debtToCover","type":"uint256"},{"internalType":"bool","name":"receiveTToken","type":"bool"}],"name":"liquidationCall","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"onBehalfOf","type":"address"}],"name":"repay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"configuration","type":"uint256"}],"name":"setConfiguration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"val","type":"bool"}],"name":"setPause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"address","name":"rateStrategyAddress","type":"address"}],"name":"setReserveInterestRateStrategyAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"withdraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}]');

/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = JSON.parse('[{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]');

/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   simulateTravaNFTBuy: () => (/* binding */ simulateTravaNFTBuy),
/* harmony export */   simulateTravaNFTSell: () => (/* binding */ simulateTravaNFTSell),
/* harmony export */   simulateTravaNFTTransfer: () => (/* binding */ simulateTravaNFTTransfer)
/* harmony export */ });
/* harmony import */ var _utils_address__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function simulateTravaNFTBuy(_x, _x2, _x3, _x4) {
  return _simulateTravaNFTBuy.apply(this, arguments);
}
function _simulateTravaNFTBuy() {
  _simulateTravaNFTBuy = _asyncToGenerator(function* (appState1, tokenId, from, to) {
    try {
      var appState = _objectSpread({}, appState1);
      var currentVersion = "v1";
      var currentNFT = appState.NFTState.nfts.v1.find(n => n.id == tokenId);
      if (!currentNFT) {
        currentNFT = appState.NFTState.nfts.v2.find(n => n.id == tokenId);
        currentVersion = "v2";
      }
      if (!currentNFT) {
        throw new Error("NFT is not being sold");
      }
      var travaAddress = (0,_utils_address__WEBPACK_IMPORTED_MODULE_0__.getAddr)("TRAVA_TOKEN");
      if (from == appState.walletState.address) {
        var _appState$walletState;
        var travaBalance = (_appState$walletState = appState.walletState.tokenBalances.get(travaAddress)) !== null && _appState$walletState !== void 0 ? _appState$walletState : "0";
        appState.walletState.tokenBalances.set(travaAddress, (BigInt(travaBalance) - BigInt(currentNFT.data.price)).toString());
      }
      if (from == appState.smartWalletState.address) {
        var _appState$smartWallet;
        var _travaBalance = (_appState$smartWallet = appState.smartWalletState.tokenBalances.get(travaAddress)) !== null && _appState$smartWallet !== void 0 ? _appState$smartWallet : 0;
        appState.smartWalletState.tokenBalances.set(travaAddress, (BigInt(_travaBalance) - BigInt(currentNFT.data.price)).toString());
      }
      if (to == appState.walletState.address) {
        appState.walletState.nfts[currentVersion].push({
          id: tokenId
        });
      }
      if (to == appState.smartWalletState.address) {
        appState.smartWalletState.nfts[currentVersion].push({
          id: tokenId
        });
      }
      appState.NFTState.nfts.v1 = appState.NFTState.nfts[currentVersion].filter(obj => obj.id != tokenId);
      return appState;
    } catch (err) {
      throw err;
    }
  });
  return _simulateTravaNFTBuy.apply(this, arguments);
}
function simulateTravaNFTSell(_x5, _x6, _x7, _x8) {
  return _simulateTravaNFTSell.apply(this, arguments);
}
function _simulateTravaNFTSell() {
  _simulateTravaNFTSell = _asyncToGenerator(function* (appState1, tokenId, price, from) {
    try {
      var appState = _objectSpread({}, appState1);
      var currentVersion = "v1";
      if (from == appState.walletState.address) {
        var currentNFT = appState.walletState.nfts.v1.find(n => n.id == tokenId);
        if (!currentNFT) {
          currentNFT = appState.walletState.nfts.v2.find(n => n.id == tokenId);
          currentVersion = "v2";
        }
        appState.walletState.nfts[currentVersion] = appState.walletState.nfts[currentVersion].filter(obj => obj.id != tokenId);
      } else {
        var _currentNFT = appState.smartWalletState.nfts.v1.find(n => n.id == tokenId);
        if (!_currentNFT) {
          _currentNFT = appState.smartWalletState.nfts.v2.find(n => n.id == tokenId);
          currentVersion = "v2";
        }
        appState.smartWalletState.nfts[currentVersion] = appState.smartWalletState.nfts[currentVersion].filter(obj => obj.id != tokenId);
      }
      appState.NFTState.nfts[currentVersion].push({
        id: tokenId,
        data: {
          price,
          seller: appState.smartWalletState.address
        }
      });
      return appState;
    } catch (err) {
      throw err;
    }
  });
  return _simulateTravaNFTSell.apply(this, arguments);
}
function simulateTravaNFTTransfer(_x9, _x10, _x11, _x12, _x13) {
  return _simulateTravaNFTTransfer.apply(this, arguments);
}
function _simulateTravaNFTTransfer() {
  _simulateTravaNFTTransfer = _asyncToGenerator(function* (appState1, from, to, tokenId, contract) {
    try {
      var appState = _objectSpread({}, appState1);
      var prefix = "collection";
      if (contract == (0,_utils_address__WEBPACK_IMPORTED_MODULE_0__.getAddr)("NFT_CORE_ADDRESS")) {
        prefix = "nfts";
      }
      var currentVersion = "v1";
      var currentNFT = appState.walletState[prefix].v1.find(n => n.id == tokenId);
      if (!currentNFT) {
        currentNFT = appState.walletState[prefix].v2.find(n => n.id == tokenId);
        currentVersion = "v2";
      }
      // Giảm NFT
      if (from == appState.walletState.address) {
        appState.walletState[prefix][currentVersion] = appState.walletState[prefix][currentVersion].filter(obj => obj.id != tokenId);
      } else if (from == appState.smartWalletState.address) {
        appState.smartWalletState[prefix][currentVersion] = appState.smartWalletState[prefix][currentVersion].filter(obj => obj.id != tokenId);
      }

      // Tăng NFT
      if (to == appState.walletState.address) {
        appState.walletState[prefix][currentVersion].push({
          id: tokenId
        });
      } else {
        appState.smartWalletState[prefix][currentVersion].push({
          id: tokenId
        });
      }
      return appState;
    } catch (err) {
      throw err;
    }
  });
  return _simulateTravaNFTTransfer.apply(this, arguments);
}

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   updateNFTBalance: () => (/* binding */ updateNFTBalance),
/* harmony export */   updateNFTState: () => (/* binding */ updateNFTState),
/* harmony export */   updateTravaBalance: () => (/* binding */ updateTravaBalance)
/* harmony export */ });
/* harmony import */ var _abis_ERC20Mock_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _abis_Multicall_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(23);
/* harmony import */ var _abis_TravaNFTCore_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(24);
/* harmony import */ var _abis_TravaNFTSell_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(25);
/* harmony import */ var _abis_NFTManager_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(26);
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(11);
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(ethers__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _utils_address__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(12);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }







var multiCall = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (abi, calls, provider) {
    var _provider = provider;
    var multi = new ethers__WEBPACK_IMPORTED_MODULE_5__.Contract((0,_utils_address__WEBPACK_IMPORTED_MODULE_6__.getAddr)("MULTI_CALL_ADDRESS"), _abis_Multicall_json__WEBPACK_IMPORTED_MODULE_1__, _provider);
    var itf = new ethers__WEBPACK_IMPORTED_MODULE_5__.Interface(abi);
    var callData = calls.map(call => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)]);
    var {
      returnData
    } = yield multi.aggregate(callData);
    return returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
  });
  return function multiCall(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
function updateTravaBalance(_x4) {
  return _updateTravaBalance.apply(this, arguments);
}
function _updateTravaBalance() {
  _updateTravaBalance = _asyncToGenerator(function* (appState1) {
    var appState = _objectSpread({}, appState1);
    try {
      // K lấy state của smartwallet
      var TravaTokenAddress = (0,_utils_address__WEBPACK_IMPORTED_MODULE_6__.getAddr)("TRAVA_TOKEN"); // Trava Token Address
      var TravaToken = new ethers__WEBPACK_IMPORTED_MODULE_5__.Contract(TravaTokenAddress, _abis_ERC20Mock_json__WEBPACK_IMPORTED_MODULE_0__, appState.web3);
      var travaBalance = yield TravaToken.balanceOf(appState.walletState.address);
      appState.walletState.tokenBalances.set(TravaTokenAddress, travaBalance);
    } catch (e) {
      console.log(e);
    }
    return appState;
  });
  return _updateTravaBalance.apply(this, arguments);
}
function updateNFTBalance(_x5) {
  return _updateNFTBalance.apply(this, arguments);
}
function _updateNFTBalance() {
  _updateNFTBalance = _asyncToGenerator(function* (appState1) {
    var appState = _objectSpread({}, appState1);
    try {
      // Update mảnh NFT wallet
      var travacore = new ethers__WEBPACK_IMPORTED_MODULE_5__.Contract((0,_utils_address__WEBPACK_IMPORTED_MODULE_6__.getAddr)("NFT_CORE_ADDRESS"), _abis_TravaNFTCore_json__WEBPACK_IMPORTED_MODULE_2__, appState.web3);
      var nftCount = yield travacore.balanceOf(appState.walletState.address);
      var [nftIds] = yield Promise.all([multiCall(_abis_TravaNFTCore_json__WEBPACK_IMPORTED_MODULE_2__, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
        address: (0,_utils_address__WEBPACK_IMPORTED_MODULE_6__.getAddr)("NFT_CORE_ADDRESS"),
        name: "tokenOfOwnerByIndex",
        params: [appState.walletState.address, index]
      })), appState.web3)]);
      var tokenIdsFlattened = nftIds.flat();
      var [data] = yield Promise.all([multiCall(_abis_NFTManager_json__WEBPACK_IMPORTED_MODULE_4__, tokenIdsFlattened.map(tokenId => ({
        address: (0,_utils_address__WEBPACK_IMPORTED_MODULE_6__.getAddr)("NFT_MANAGER_ADDRESS"),
        name: "checkIfChestOpenedAndSet",
        params: [tokenId]
      })), appState.web3)]);
      var openedTokens = [];
      tokenIdsFlattened.forEach((tokenId, index) => {
        var version = parseInt(data[index][0]);
        var isOpen = data[index][1];
        if (isOpen) {
          openedTokens.push({
            tokenId,
            version
          });
          if (version == 1) {
            appState.walletState.nfts.v1.push({
              id: tokenId.toString()
            });
          } else {
            appState.walletState.nfts.v2.push({
              id: tokenId.toString()
            });
          }
        }
      });

      // Update NFT Collection 
      // const travacollection = await ethers.getContractAt(
      //   NFTCollectionABI,
      //   CONTRACT_NETWORK.bsc.NFT_COLLECTION
      // );
      // const nftCount2 = await travacollection.balanceOf(appState.walletState.address);
      appState.walletState.collection.v1.push({
        id: "0001"
      }); // => Fake state cho nhanh
      appState.walletState.collection.v2.push({
        id: "0002"
      });
    } catch (e) {
      console.log(e);
    }
    return appState;
  });
  return _updateNFTBalance.apply(this, arguments);
}
function _fetchNormal(_x6, _x7) {
  return _fetchNormal2.apply(this, arguments);
}
function _fetchNormal2() {
  _fetchNormal2 = _asyncToGenerator(function* (appState1, tokenIds) {
    var appState = _objectSpread({}, appState1);
    var [tokenOrders, tokenMetadata] = yield Promise.all([multiCall(_abis_TravaNFTSell_json__WEBPACK_IMPORTED_MODULE_3__, tokenIds.map(tokenId => ({
      address: (0,_utils_address__WEBPACK_IMPORTED_MODULE_6__.getAddr)("NFT_SELL_ADDRESS"),
      name: "getTokenOrder",
      params: [tokenId]
    })), appState.web3), multiCall(_abis_TravaNFTCore_json__WEBPACK_IMPORTED_MODULE_2__, tokenIds.map(tokenId => ({
      address: (0,_utils_address__WEBPACK_IMPORTED_MODULE_6__.getAddr)("NFT_CORE_ADDRESS"),
      name: "getTokenMetadata",
      params: [tokenId]
    })), appState.web3)]);
    var tokenOrdersFlattened = tokenOrders.flat();
    var tokensMetadataFlattened = tokenMetadata.flat();
    var v1 = [];
    var v2 = [];
    var counter = 0;
    var CollectionName = ["genesis", "triumph"];
    for (var tokenData of tokensMetadataFlattened) {
      var collectionId = parseInt(tokenData.collectionId);
      var collectionName = CollectionName[collectionId - 1];
      var rarity = parseInt(tokenData.tokenRarity);
      if (collectionName && rarity >= 1) {
        var id = parseInt(tokenIds[counter]);
        var price = BigInt(tokenOrdersFlattened[counter].price).toString();
        var seller = tokenOrdersFlattened[counter].nftSeller;
        if (collectionId == 1) {
          appState.NFTState.nfts.v1.push({
            id,
            data: {
              price,
              seller
            }
          });
        } else if (collectionId == 2) {
          appState.NFTState.nfts.v2.push({
            id,
            data: {
              price,
              seller
            }
          });
        }
      }
      counter++;
    }
    return appState;
  });
  return _fetchNormal2.apply(this, arguments);
}
function updateNFTState(_x8) {
  return _updateNFTState.apply(this, arguments);
}
function _updateNFTState() {
  _updateNFTState = _asyncToGenerator(function* (appState1) {
    var appState = _objectSpread({}, appState1);
    try {
      var nftsell = new ethers__WEBPACK_IMPORTED_MODULE_5__.Contract((0,_utils_address__WEBPACK_IMPORTED_MODULE_6__.getAddr)("NFT_SELL_ADDRESS"), _abis_TravaNFTSell_json__WEBPACK_IMPORTED_MODULE_3__, appState.web3);
      var nftCount = yield nftsell.getTokenOnSaleCount();
      var [nftIds] = yield Promise.all([multiCall(_abis_TravaNFTSell_json__WEBPACK_IMPORTED_MODULE_3__, new Array(parseInt(nftCount.toString())).fill(1).map((_, index) => ({
        address: (0,_utils_address__WEBPACK_IMPORTED_MODULE_6__.getAddr)("NFT_SELL_ADDRESS"),
        name: "getTokenOnSaleAtIndex",
        params: [index]
      })), appState.web3)]);
      var tokenIdsFlattened = nftIds.flat();
      var promises = [];
      for (var i = 0; i < tokenIdsFlattened.length; i += 500) {
        var _tokenSlice = tokenIdsFlattened.slice(i, i + 500);
        promises.push(_fetchNormal(appState, _tokenSlice));
      }
      yield Promise.all(promises);
    } catch (e) {
      console.log(e);
    }
    return appState;
  });
  return _updateNFTState.apply(this, arguments);
}

/***/ }),
/* 23 */
/***/ ((module) => {

module.exports = JSON.parse('[{"constant":true,"inputs":[{"components":[{"name":"target","type":"address"},{"name":"callData","type":"bytes"}],"name":"calls","type":"tuple[]"}],"name":"aggregate","outputs":[{"name":"blockNumber","type":"uint256"},{"name":"returnData","type":"bytes[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"getEthBalance","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]');

/***/ }),
/* 24 */
/***/ ((module) => {

module.exports = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"}],"name":"BatchTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"enum NFTCore.Type","name":"tokenType","type":"uint8"},{"indexed":false,"internalType":"enum NFTCore.Rarity","name":"tokenRarity","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"collectionId","type":"uint256"}],"name":"ChestOpen","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"TokenBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"MAXIMUM_ALLOWANCE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"uint256","name":"_collectedExperience","type":"uint256"}],"name":"addExperience","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newCOPPERPercent","type":"uint256"},{"internalType":"uint256","name":"newSILVERPercent","type":"uint256"},{"internalType":"uint256","name":"newGOLDPercent","type":"uint256"},{"internalType":"uint256","name":"newDIAMONDPercent","type":"uint256"},{"internalType":"uint256","name":"newCRYSTALPercent","type":"uint256"}],"name":"adjustRarityPercent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newHELMETPercent","type":"uint256"},{"internalType":"uint256","name":"newARMORPercent","type":"uint256"},{"internalType":"uint256","name":"newSWORDPercent","type":"uint256"},{"internalType":"uint256","name":"newSHIELDPercent","type":"uint256"}],"name":"adjustTypePercent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"}],"name":"batchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"}],"name":"completeGeneration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getExperience","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMaximumAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getRarity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getSet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getTokenMetadata","outputs":[{"components":[{"internalType":"bool","name":"isOpened","type":"bool"},{"internalType":"enum NFTCore.Rarity","name":"tokenRarity","type":"uint8"},{"internalType":"enum NFTCore.Type","name":"tokenType","type":"uint8"},{"internalType":"uint256","name":"collectionId","type":"uint256"},{"internalType":"uint256","name":"experiencePoint","type":"uint256"}],"internalType":"struct NFTCore.NFTMetadata","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getType","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getUniqueTokenMetadata","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"isTokenOpened","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"specialTokenId","type":"uint256"},{"internalType":"string","name":"_data","type":"string"}],"name":"mintUniqueToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"uint256","name":"_setId","type":"uint256"},{"internalType":"uint256","name":"_seed","type":"uint256"}],"name":"openToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_collectionAddress","type":"address"}],"name":"setCollectionAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_managerAddress","type":"address"}],"name":"setManagerAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"maximumAllowance","type":"uint256"}],"name":"setMaximumAllowance","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_randomContract","type":"address"}],"name":"setRandomAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"}],"name":"setWhitelistedAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_type","type":"uint256"},{"internalType":"uint256","name":"_rarity","type":"uint256"}],"name":"specificGeneration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"_setId","type":"uint256"},{"internalType":"uint256","name":"_targetType","type":"uint256"},{"internalType":"uint256","name":"_targetRarity","type":"uint256"}],"name":"tradeUp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]');

/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"nftSeller","type":"address"}],"name":"BoughtBack","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"nftSeller","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"PriceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"nftSeller","type":"address"}],"name":"SaleCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"nftSeller","type":"address"},{"indexed":false,"internalType":"address","name":"nftBuyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"SaleCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"nftSeller","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"SaleCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"buyBack","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"cancelSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"createSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"editPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getTokenOfOwnerAtIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"getTokenOfOwnerBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getTokenOnSaleAtIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTokenOnSaleCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getTokenOrder","outputs":[{"components":[{"internalType":"address","name":"nftSeller","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"}],"internalType":"struct NFTMarketplace.Sale","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_travaNFTddress","type":"address"},{"internalType":"address","name":"_paymentToken","type":"address"},{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_percent","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"makeOrder","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauseContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_rarity","type":"uint256"},{"internalType":"uint256","name":"_type","type":"uint256"},{"internalType":"uint256","name":"_buybackPrice","type":"uint256"},{"internalType":"uint256","name":"_sellbackPrice","type":"uint256"}],"name":"setBuyAndSellPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_receiver","type":"address"}],"name":"setReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_status","type":"bool"}],"name":"toggleBuyback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpauseContract","outputs":[],"stateMutability":"nonpayable","type":"function"}]');

/***/ }),
/* 26 */
/***/ ((module) => {

module.exports = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"indexed":false,"internalType":"uint256","name":"tokenTradedUp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenType","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenRarity","type":"uint256"}],"name":"TradeUpCollectionSuccessfully","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"indexed":false,"internalType":"uint256","name":"tokenBurned","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenType","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenRarity","type":"uint256"}],"name":"TradeUpFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"indexed":false,"internalType":"uint256","name":"tokenTradedUp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenType","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenRarity","type":"uint256"}],"name":"TradeUpSuccessfully","type":"event"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"changeSetId","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"checkIfChestOpenedAndSet","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"discountedMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getCirculatingLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"},{"internalType":"uint256","name":"_rarity","type":"uint256"}],"name":"getRelativeFailPercent","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTravaNFTAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_travaNFTAddress","type":"address"},{"internalType":"address","name":"_paymentToken","type":"address"},{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_options","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"string","name":"_data","type":"string"}],"name":"mintUniqueToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"nftExperience","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"nftLevel","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"openChest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"_approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_limit","type":"uint256"}],"name":"setCirculatingLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPrice","type":"uint256"}],"name":"setPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_randomizer","type":"address"}],"name":"setRandomizer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_receiver","type":"address"}],"name":"setReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"setTradeUpFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_requirements","type":"uint256"}],"name":"setTradeUpRequirements","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_time","type":"uint256"}],"name":"setTradeUpTimeRequired","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_transmuteAddress","type":"address"}],"name":"setTransmuteAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_whitelist","type":"address"}],"name":"setWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_status","type":"bool"}],"name":"toggleBuy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_status","type":"bool"}],"name":"toggleOpen","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_status","type":"bool"}],"name":"toggleTradeUp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"},{"internalType":"uint256","name":"_type","type":"uint256"},{"internalType":"uint256","name":"_rarity","type":"uint256"}],"name":"tradeUp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"},{"internalType":"uint256","name":"_type","type":"uint256"},{"internalType":"uint256","name":"_rarity","type":"uint256"}],"name":"tradeUpSet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_setId","type":"uint256"},{"internalType":"uint256","name":"_rarity","type":"uint256"},{"internalType":"uint256","name":"_targetType","type":"uint256"},{"internalType":"uint256","name":"_collectedExperience","type":"uint256"}],"name":"transmute","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_whitelist","type":"address"}],"name":"unsetWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"}]');

/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   simulateSwap: () => (/* binding */ simulateSwap)
/* harmony export */ });
/* harmony import */ var _basic_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function simulateSwap(_x, _x2, _x3, _x4, _x5) {
  return _simulateSwap.apply(this, arguments);
}
function _simulateSwap() {
  _simulateSwap = _asyncToGenerator(function* (appState1, fromToken, toToken, fromAmount, toAmount) {
    var appState = _objectSpread({}, appState1);
    if (!appState.walletState.tokenBalances.has(fromToken)) {
      yield (0,_basic_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_0__.updateUserTokenBalance)(appState, fromToken);
    }
    if (!appState.walletState.tokenBalances.has(toToken)) {
      yield (0,_basic_UpdateStateAccount__WEBPACK_IMPORTED_MODULE_0__.updateUserTokenBalance)(appState, toToken);
    }
    if (BigInt(appState.walletState.tokenBalances.get(fromToken)) < BigInt(fromAmount)) {
      throw new Error("Insufficient balance");
    }
    var newFromBalance = BigInt(appState.walletState.tokenBalances.get(fromToken)) - BigInt(fromAmount);
    var newToBalance = BigInt(appState.walletState.tokenBalances.get(toToken)) + BigInt(toAmount);
    appState.walletState.tokenBalances.set(fromToken, String(BigInt(newFromBalance)));
    appState.walletState.tokenBalances.set(toToken, String(BigInt(newToBalance)));
    return appState;
  });
  return _simulateSwap.apply(this, arguments);
}

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppState: () => (/* reexport safe */ _State__WEBPACK_IMPORTED_MODULE_0__.AppState),
/* harmony export */   SimulationBorrow: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.SimulationBorrow),
/* harmony export */   SimulationRepay: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.SimulationRepay),
/* harmony export */   SimulationSupply: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.SimulationSupply),
/* harmony export */   SimulationWithdraw: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.SimulationWithdraw),
/* harmony export */   simulateSendToken: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.simulateSendToken),
/* harmony export */   simulateSwap: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.simulateSwap),
/* harmony export */   simulateTravaNFTBuy: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.simulateTravaNFTBuy),
/* harmony export */   simulateTravaNFTSell: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.simulateTravaNFTSell),
/* harmony export */   simulateTravaNFTTransfer: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.simulateTravaNFTTransfer),
/* harmony export */   simulateUnwrap: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.simulateUnwrap),
/* harmony export */   simulateWrap: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.simulateWrap),
/* harmony export */   updateNFTBalance: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.updateNFTBalance),
/* harmony export */   updateNFTState: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.updateNFTState),
/* harmony export */   updateSmartWalletEthBalance: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.updateSmartWalletEthBalance),
/* harmony export */   updateSmartWalletTokenBalance: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.updateSmartWalletTokenBalance),
/* harmony export */   updateTravaBalance: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.updateTravaBalance),
/* harmony export */   updateUserEthBalance: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.updateUserEthBalance),
/* harmony export */   updateUserTokenBalance: () => (/* reexport safe */ _Simulation__WEBPACK_IMPORTED_MODULE_1__.updateUserTokenBalance)
/* harmony export */ });
/* harmony import */ var _State__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _Simulation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);


})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});