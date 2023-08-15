export class NFTData {
    constructor() {
        this.id = '0';
        this.data = {
            price: "0",
            seller: "0x0000000000000000000000000000000000000000"
        };
    }
}
export class NFT {
    constructor() {
        this.v1 = new Array();
        this.v2 = new Array();
    }
}
export class NFTState {
    constructor() {
        this.nfts = new NFT();
    }
}
