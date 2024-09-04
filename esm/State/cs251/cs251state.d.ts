export declare class cs251state {
    cs251state: Map<string, cs251statechange>;
    isFetch: boolean;
    constructor();
}
export interface cs251statechange {
    eth_reserve: string;
    token_reserve: string;
    total_shares: string;
    lps: string;
}
