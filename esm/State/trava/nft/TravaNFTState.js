export class NFTSellingState {
    constructor() {
        this.v1 = new Array();
        this.v2 = new Array();
        this.isFetch = false;
    }
}
export class NFTAuctioningState {
    constructor() {
        this.v1 = new Array();
        this.v2 = new Array();
        this.specials = new Array();
        this.isFetch = false;
    }
}
export class NFTVeTravaSellingState {
    constructor() {
        this.sellingVeTrava = new Array();
        this.priceTokens = new Map();
        this.isFetch = false;
    }
}
export class NFTFarmingsState {
    constructor() {
        this.nftFarmings = new Map();
        this.isFetch = false;
    }
}
