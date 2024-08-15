"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravaNFTApiQuery = exports.ApiQuery = void 0;
const axios_1 = __importDefault(require("axios"));
const constance_1 = require("./constance");
const defaultHeaders = { Accept: "application/json", "Content-Type": "application/json" };
class ApiQuery {
    constructor(rootUrl, config) {
        this.rootUrl = rootUrl;
        this.config = config ? Object.assign(Object.assign({}, config), { headers: Object.assign(Object.assign({}, defaultHeaders), (config.headers || {})) }) : { headers: defaultHeaders };
    }
    get(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get(`${this.rootUrl}${url}`, Object.assign(Object.assign({}, config), this.config));
        });
    }
    post(url, data, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.post(`${this.rootUrl}${url}`, data, Object.assign(Object.assign({}, config), this.config));
        });
    }
    put(url, data, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.put(`${this.rootUrl}${url}`, data, Object.assign(Object.assign({}, config), this.config));
        });
    }
    del(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.delete(`${this.rootUrl}${url}`, Object.assign(Object.assign({}, config), this.config));
        });
    }
}
exports.ApiQuery = ApiQuery;
const TravaNFTApiQuery = new ApiQuery(constance_1.TRAVA_NFT_BACKEND_ROOT);
exports.TravaNFTApiQuery = TravaNFTApiQuery;
