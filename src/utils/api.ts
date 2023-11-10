import axios, { AxiosResponse } from "axios";
import { TRAVA_NFT_BACKEND_ROOT } from "./constance";
import { AxiosRequestConfig } from "./types";


const defaultHeaders = { Accept: "application/json", "Content-Type": "application/json" };

type ApiResponse<T> = AxiosResponse<T>;

class ApiQuery {
  private rootUrl: string;
  private config: AxiosRequestConfig;

  constructor(rootUrl: string, config?: AxiosRequestConfig) {
    this.rootUrl = rootUrl;
    this.config = config ? { ...config, headers: { ...defaultHeaders, ...(config.headers || {}) } } : { headers: defaultHeaders };
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return await axios.get(`${this.rootUrl}${url}`, { ...config, ...this.config });
  }

  async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return await axios.post(`${this.rootUrl}${url}`, data, { ...config, ...this.config });
  }

  async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return await axios.put(`${this.rootUrl}${url}`, data, { ...config, ...this.config });
  }

  async del<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return await axios.delete(`${this.rootUrl}${url}`, { ...config, ...this.config });
  }
}

const TravaNFTApiQuery = new ApiQuery(TRAVA_NFT_BACKEND_ROOT);

export { ApiQuery, TravaNFTApiQuery };
