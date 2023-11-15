import { request, gql } from 'graphql-request';
import { endpointsByChainId } from '../constants/endpoints';

export const fetcher = (query, variables) => request(endpointsByChainId[process.env.NEXT_PUBLIC_SUBGRAPH_ENDPOINT], gql`${query}`, variables);
