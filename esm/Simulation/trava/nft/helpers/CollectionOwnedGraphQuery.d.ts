import { EthAddress } from '../../../../utils/types';
export default class SellGraphQuery {
    private static _rewriteData;
    static fetchData(owner: EthAddress): Promise<{
        v1: never[];
        v2: never[];
    } | undefined>;
}
