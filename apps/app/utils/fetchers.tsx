import { request, gql } from 'graphql-request';

const getEndpoint = () => {
  if (process.env.NODE_ENV === 'development') {
    // Use the development endpoint
    return process.env.GRAPH_ENDPOINT || 'http://localhost:8000/subgraphs/name/ets/ets-local';
  } else {
    // Use the production or other environment endpoint
    return process.env.GRAPH_ENDPOINT || 'https://api.thegraph.com/subgraphs/name/ethereum-tag-service/ets-mumbai';
  }
};

type Variables = Record<string, any>; // Define your custom variable types here if needed

export const fetcher = async <T = any>(query: string, variables: Variables): Promise<T> => {
  const endpoint = getEndpoint(); // Replace with the correct chain ID or logic

  try {
    const data = await request(endpoint, gql`${query}`, variables);
    return data;
  } catch (error) {
    // Handle errors here if needed
    throw error;
  }
};

// Example usage:
// const data = await fetcher<YourResponseType>(yourQuery, yourVariables);
