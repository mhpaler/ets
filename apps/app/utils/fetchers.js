import { request, gql } from 'graphql-request';
import { endpointsByChainId } from '../constants/endpoints';

<<<<<<< HEAD
export const fetcher = (query, variables) => request(endpointsByChainId[80001], gql`${query}`, variables);
=======
export const fetcher = (query, variables) => request(endpointsByChainId[process.env.NEXT_PUBLIC_SUBGRAPH_ENDPOINT], gql`${query}`, variables);
>>>>>>> 240-enable-disable-relayer
