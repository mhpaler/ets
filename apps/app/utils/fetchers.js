import { request, gql } from 'graphql-request';
import { endpointsByChainId } from '../constants/endpoints';

export const fetcher = (query, variables) => request(endpointsByChainId[80001], gql`${query}`, variables);
