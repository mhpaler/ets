import { request, gql } from 'graphql-request';
import { endpointsByChainId } from '../constants/endpoints';

export const fetcher = (query, variables) => request(endpointsByChainId[31337], gql`${query}`, variables);
