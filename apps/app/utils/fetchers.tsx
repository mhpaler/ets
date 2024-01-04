// TODO: Get graph-endpoints going as a ets package.
// import graphEndpoints from "@ethereum-tag-service/config/graph-endpoints";
import graphEndpoints from "./graphEndpoints";
import { request, gql } from "graphql-request";
type Variables = Record<string, any>; // Define your custom variable types here if needed

export const fetcher = async <T = any,>(query: string, variables: Variables): Promise<T> => {
  // Get the environment from the REACT_APP_ENV variable
  const environment: string = process.env.REACT_APP_ENV || "development";

  // Use the environment to select the appropriate endpoint
  const GRAPH_API_ENDPOINT: string = graphEndpoints[environment];

  try {
    const data = await request(
      GRAPH_API_ENDPOINT,
      gql`
        ${query}
      `,
      variables,
    );
    return data;
  } catch (error) {
    // Handle errors here if needed
    throw error;
  }
};

// Example usage:
// const data = await fetcher<YourResponseType>(yourQuery, yourVariables);
