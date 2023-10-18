import { NFTMarketplaceType, SellingArmouryType } from '../../../../../global';
export default class SellGraphQuery {
    private static _rewriteData;
    static fetchData(): Promise<{
        v1: (SellingArmouryType & {
            rawData: NFTMarketplaceType;
        })[];
        v2: (SellingArmouryType & {
            rawData: NFTMarketplaceType;
        })[];
    }>;
}
