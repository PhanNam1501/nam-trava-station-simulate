import { EthGraphQuery } from 'eth-graph-query';
const THE_GRAPH_ROOT = 'https://api.thegraph.com/subgraphs/name/zennomi/trava-bsc';

export const ethQuery = new EthGraphQuery(THE_GRAPH_ROOT);