import { AxiosResponse } from "axios";
import { AxiosRequestConfig } from "./types";
type ApiResponse<T> = AxiosResponse<T>;
declare class ApiQuery {
    private rootUrl;
    private config;
    constructor(rootUrl: string, config?: AxiosRequestConfig);
    get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    del<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
}
declare const TravaNFTApiQuery: ApiQuery;
export { ApiQuery, TravaNFTApiQuery };
