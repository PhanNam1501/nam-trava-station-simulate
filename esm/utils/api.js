var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import { TRAVA_NFT_BACKEND_ROOT } from "./constance";
const defaultHeaders = { Accept: "application/json", "Content-Type": "application/json" };
class ApiQuery {
    constructor(rootUrl, config) {
        this.rootUrl = rootUrl;
        this.config = config ? Object.assign(Object.assign({}, config), { headers: Object.assign(Object.assign({}, defaultHeaders), (config.headers || {})) }) : { headers: defaultHeaders };
    }
    get(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios.get(`${this.rootUrl}${url}`, Object.assign(Object.assign({}, config), this.config));
        });
    }
    post(url, data, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios.post(`${this.rootUrl}${url}`, data, Object.assign(Object.assign({}, config), this.config));
        });
    }
    put(url, data, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios.put(`${this.rootUrl}${url}`, data, Object.assign(Object.assign({}, config), this.config));
        });
    }
    del(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios.delete(`${this.rootUrl}${url}`, Object.assign(Object.assign({}, config), this.config));
        });
    }
}
const TravaNFTApiQuery = new ApiQuery(TRAVA_NFT_BACKEND_ROOT);
export { ApiQuery, TravaNFTApiQuery };
