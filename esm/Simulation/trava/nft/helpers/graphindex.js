"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethQuery = void 0;
const eth_graph_query_1 = require("eth-graph-query");
const THE_GRAPH_ROOT = 'https://api.thegraph.com/subgraphs/name/zennomi/trava-bsc';
exports.ethQuery = new eth_graph_query_1.EthGraphQuery(THE_GRAPH_ROOT);
