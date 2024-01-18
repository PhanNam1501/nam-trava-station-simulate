"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTTicketState = exports.NFTFarmingsState = exports.NFTVeTravaSellingState = exports.NFTAuctioningState = exports.NFTSellingState = void 0;
class NFTSellingState {
    constructor() {
        this.v1 = new Array();
        this.v2 = new Array();
        this.isFetch = false;
    }
}
exports.NFTSellingState = NFTSellingState;
class NFTAuctioningState {
    constructor() {
        this.v1 = new Array();
        this.v2 = new Array();
        this.specials = new Array();
        this.isFetch = false;
    }
}
exports.NFTAuctioningState = NFTAuctioningState;
class NFTVeTravaSellingState {
    constructor() {
        this.sellingVeTrava = new Array();
        this.priceTokens = new Map();
        this.isFetch = false;
    }
}
exports.NFTVeTravaSellingState = NFTVeTravaSellingState;
class NFTFarmingsState {
    constructor() {
        this.nftFarmings = new Map();
        this.isFetch = false;
    }
}
exports.NFTFarmingsState = NFTFarmingsState;
class NFTTicketState {
    constructor() {
        this.ticketState = new Map();
        this.isFetch = false;
    }
}
exports.NFTTicketState = NFTTicketState;
